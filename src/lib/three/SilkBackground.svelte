<script>
	// WebGPU "silk flow" ambient background — a full-screen domain-warped silk
	// field rendered on a transparent canvas so it reads as translucent veils
	// over the page. Adapted from Josephine Shen's silk.js: palette colours are
	// now uniforms (live-switchable) and it's a toggleable Svelte component.
	import { onMount, onDestroy } from 'svelte';
	import { silkOn, silkKey, SILK_PALETTES, DEFAULT_SILK } from '$lib/theme';

	export let opacity = 0.4; // master opacity of the silk overlay (0..1)

	let canvas;
	let running = false;
	let device, ctx, pipe, bindGroup, uniBuf;
	let raf = null;
	let unsubOn, unsubKey;
	let colA = [0.15, 0.14, 0.16], colB = [0.23, 0.2, 0.19], sheen = [0.42, 0.38, 0.32];

	const WGSL = /* wgsl */ `
	struct U { params: vec4<f32>, colA: vec4<f32>, colB: vec4<f32>, sheenC: vec4<f32> };
	@group(0) @binding(0) var<uniform> u: U;

	const FLOW_SPEED: f32 = 0.01;
	const WARP:       f32 = 1.00;
	const BAND_FREQ:  f32 = 2.0;
	const SHEEN:      f32 = 0.35;

	fn hash21(p: vec2<f32>) -> f32 {
	  var p3 = fract(vec3<f32>(p.x, p.y, p.x) * 0.1031);
	  p3 += dot(p3, p3.yzx + 33.33);
	  return fract((p3.x + p3.y) * p3.z);
	}
	fn noise(p: vec2<f32>) -> f32 {
	  let i = floor(p);
	  let f = fract(p);
	  let w = f * f * (3.0 - 2.0 * f);
	  let a = hash21(i);
	  let b = hash21(i + vec2<f32>(1.0, 0.0));
	  let c = hash21(i + vec2<f32>(0.0, 1.0));
	  let d = hash21(i + vec2<f32>(1.0, 1.0));
	  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
	}
	fn fbm(p0: vec2<f32>) -> f32 {
	  var p = p0;
	  var s = 0.0;
	  var amp = 0.5;
	  for (var i = 0; i < 5; i = i + 1) {
	    s += amp * noise(p);
	    p = p * 2.03 + vec2<f32>(11.7, 5.3);
	    amp *= 0.5;
	  }
	  return s;
	}

	struct Out { @builtin(position) pos: vec4<f32>, @location(0) uv: vec2<f32> };
	@vertex
	fn vs(@builtin(vertex_index) vi: u32) -> Out {
	  var v = array<vec2<f32>, 3>(vec2<f32>(-1.0,-1.0), vec2<f32>(3.0,-1.0), vec2<f32>(-1.0,3.0));
	  var o: Out;
	  let q = v[vi];
	  o.pos = vec4<f32>(q, 0.0, 1.0);
	  o.uv  = q * 0.5 + 0.5;
	  return o;
	}
	@fragment
	fn fs(in: Out) -> @location(0) vec4<f32> {
	  let t = u.params.x * FLOW_SPEED;
	  let p = vec2<f32>(in.uv.x * u.params.z, in.uv.y);

	  let w1   = fbm(p * 1.6 + vec2<f32>(t, -t * 0.6));
	  let w2   = fbm(p * 1.6 + vec2<f32>(4.7, 1.9) + w1 * 1.3 - vec2<f32>(t * 0.8, 0.0));
	  let warp = vec2<f32>(w1, w2);
	  let q    = p + warp * WARP;

	  let field = fbm(q * 2.0 + warp * 1.4);
	  let bands = 0.5 + 0.5 * sin((q.x + q.y) * BAND_FREQ + field * 6.0 + t * 5.0);
	  let sheen = pow(0.5 + 0.5 * sin(field * 9.0 - t * 8.0 + warp.x * 6.0), 6.0);

	  var col = mix(u.colA.rgb, u.colB.rgb, smoothstep(0.30, 0.80, field));
	  col = mix(col, u.sheenC.rgb, sheen * SHEEN);

	  let density = mix(0.30, 1.0, smoothstep(0.10, 0.95, bands));
	  let a = clamp(density * u.params.y, 0.0, 1.0);
	  return vec4<f32>(col * a, a);   // premultiplied alpha
	}
	`;

	function hexToRgb(hex) {
		const h = hex.replace('#', '');
		return [
			parseInt(h.slice(0, 2), 16) / 255,
			parseInt(h.slice(2, 4), 16) / 255,
			parseInt(h.slice(4, 6), 16) / 255
		];
	}

	function setPalette(key) {
		const p = SILK_PALETTES[key] || SILK_PALETTES[DEFAULT_SILK];
		colA = hexToRgb(p.a);
		colB = hexToRgb(p.b);
		sheen = hexToRgb(p.sheen);
	}

	async function initGPU() {
		if (!canvas || !navigator.gpu) return false;
		let adapter;
		try {
			adapter = await navigator.gpu.requestAdapter({ powerPreference: 'low-power' });
			if (!adapter) return false;
			device = await adapter.requestDevice();
		} catch (e) { return false; }

		ctx = canvas.getContext('webgpu');
		if (!ctx) return false;
		const format = navigator.gpu.getPreferredCanvasFormat();
		ctx.configure({ device, format, alphaMode: 'premultiplied' });

		uniBuf = device.createBuffer({ size: 64, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
		const module = device.createShaderModule({ code: WGSL });
		const bindLayout = device.createBindGroupLayout({
			entries: [{ binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: {} }]
		});
		bindGroup = device.createBindGroup({ layout: bindLayout, entries: [{ binding: 0, resource: { buffer: uniBuf } }] });
		pipe = device.createRenderPipeline({
			layout: device.createPipelineLayout({ bindGroupLayouts: [bindLayout] }),
			vertex: { module, entryPoint: 'vs' },
			fragment: { module, entryPoint: 'fs', targets: [{ format }] },
			primitive: { topology: 'triangle-list' }
		});
		return true;
	}

	let W = 1, H = 1;
	function resize() {
		const dpr = Math.min(devicePixelRatio || 1, 2);
		W = canvas.width  = Math.max(1, Math.round(canvas.clientWidth  * dpr));
		H = canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
	}

	onMount(async () => {
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const ok = await initGPU();
		if (!ok) return; // WebGPU unavailable → silent no-op, page bg shows through

		resize();
		addEventListener('resize', resize, { passive: true });

		const uni = new Float32Array(16);
		const start = performance.now();
		function frame(now) {
			if (!running) { raf = null; return; }
			const t = reduce ? 0 : (now - start) / 1000;
			uni[0] = t; uni[1] = opacity; uni[2] = W / H; uni[3] = 0;
			uni[4] = colA[0];  uni[5] = colA[1];  uni[6] = colA[2];
			uni[8] = colB[0];  uni[9] = colB[1];  uni[10] = colB[2];
			uni[12] = sheen[0]; uni[13] = sheen[1]; uni[14] = sheen[2];
			device.queue.writeBuffer(uniBuf, 0, uni);

			const encoder = device.createCommandEncoder();
			const pass = encoder.beginRenderPass({
				colorAttachments: [{
					view: ctx.getCurrentTexture().createView(),
					loadOp: 'clear', storeOp: 'store', clearValue: { r: 0, g: 0, b: 0, a: 0 }
				}]
			});
			pass.setBindGroup(0, bindGroup);
			pass.setPipeline(pipe);
			pass.draw(3);
			pass.end();
			device.queue.submit([encoder.finish()]);
			raf = requestAnimationFrame(frame);
		}

		function startLoop() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
		function stopLoop() { running = false; }

		unsubKey = silkKey.subscribe(setPalette);
		unsubOn = silkOn.subscribe((on) => {
			if (!canvas) return;
			canvas.style.display = on ? 'block' : 'none';
			if (on) startLoop(); else stopLoop();
		});
	});

	onDestroy(() => {
		if (typeof window === 'undefined') return;
		running = false;
		if (raf) cancelAnimationFrame(raf);
		if (unsubOn) unsubOn();
		if (unsubKey) unsubKey();
		removeEventListener('resize', resize);
		if (device) device.destroy?.();
	});
</script>

<canvas bind:this={canvas} class="silk" />

<style>
	.silk {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		display: block;
		z-index: 0;
		pointer-events: none;
	}
</style>
