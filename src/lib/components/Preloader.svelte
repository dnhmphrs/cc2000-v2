<script>
	import { onMount } from 'svelte';
	import { phase, loadProgress, loadLabel } from '$lib/store/store';
	import { DECADES, LAYERS, elementUrl } from '$lib/data/roomElements';

	const SEGMENTS = 34;
	let progress = 0;
	let label = 'INIT';
	let percent = 0;
	let leaving = false;

	loadProgress.subscribe((v) => {
		progress = v;
		percent = Math.round(v * 100);
	});
	loadLabel.subscribe((v) => (label = v));

	$: filled = Math.round(progress * SEGMENTS);
	$: bar = '█'.repeat(filled) + '░'.repeat(SEGMENTS - filled);

	function preloadImage(url) {
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => resolve();
			img.onerror = () => resolve();
			img.src = url;
		});
	}

	function preloadModel(url) {
		return fetch(url)
			.then((r) => r.arrayBuffer())
			.then(() => {})
			.catch(() => {});
	}

	async function boot() {
		const t0 = performance.now();

		// Build the asset manifest: every room element image + the sperm model.
		const imageJobs = [];
		DECADES.forEach((d) => {
			LAYERS.forEach((l) => imageJobs.push({ url: elementUrl(d, l.key), tag: `${d}/${l.key}` }));
		});
		const jobs = [
			...imageJobs.map((j) => ({ ...j, kind: 'img' })),
			{ url: '/sperm.glb', tag: 'sperm.glb', kind: 'model' }
		];

		const total = jobs.length;
		let done = 0;

		for (const job of jobs) {
			loadLabel.set(`LOAD ${job.tag}`);
			if (job.kind === 'model') await preloadModel(job.url);
			else await preloadImage(job.url);
			done += 1;
			loadProgress.set(done / total);
		}

		loadLabel.set('LINK ESTABLISHED');
		// Hold long enough to register as a deliberate boot sequence.
		const elapsed = performance.now() - t0;
		if (elapsed < 1400) await new Promise((r) => setTimeout(r, 1400 - elapsed));

		leaving = true;
		await new Promise((r) => setTimeout(r, 420));
		phase.set('intro');
	}

	onMount(boot);
</script>

<div class="wrap" class:leaving>
	<div class="frame boot">
		<div class="frame-head">
			<span class="id">CC://2000</span>
			<span>BOOT SEQUENCE</span>
		</div>
		<div class="frame-body">
			<div class="lines">
				<div class="ln"><span class="pr">&gt;</span> conception calculator 2000</div>
				<div class="ln dim"><span class="pr">&gt;</span> conceived by science · built by magic</div>
				<div class="ln dim"><span class="pr">&gt;</span> synchronising nodes...</div>
			</div>

			<div class="bar-row">
				<span class="bar">{bar}</span>
			</div>
			<div class="meta">
				<span class="lbl">{label}</span>
				<span class="pct">{percent}%</span>
			</div>
		</div>
	</div>
</div>

<style>
	.wrap {
		position: fixed;
		inset: 0;
		z-index: 40;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		transition: opacity 0.4s ease;
	}
	.wrap.leaving {
		opacity: 0;
	}

	.boot {
		width: 100%;
		max-width: 440px;
	}

	.lines {
		font-size: 12px;
		line-height: 1.85;
		margin-bottom: 22px;
	}
	.ln {
		color: var(--fg-dim);
	}
	.ln.dim {
		color: var(--fg-faint);
	}
	.pr {
		color: var(--fg-faint);
		margin-right: 8px;
	}

	.bar-row {
		font-size: 13px;
		letter-spacing: 0.04em;
		color: var(--fg);
		overflow: hidden;
		white-space: nowrap;
	}
	.bar {
		font-family: var(--mono);
	}

	.meta {
		display: flex;
		justify-content: space-between;
		margin-top: 10px;
		font-size: 9px;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--fg-faint);
	}
	.pct {
		color: var(--fg);
	}
</style>
