// ── The drawing itself, as flats ─────────────────────────────────────────────
// The site's six layers stood up where the site keeps them (the stage sketch's
// construction): the wall at the back, the posters, the clock, the screen, the
// desk and the bed stepping forward, each a textured quad. From the eye point
// with the long lens they are the drawing; a loop fades them out as it leaves
// the eye and the solids take over, and fades them back as it comes home.

import { LAYERS, placement, elementUrl } from '$lib/data/roomElements';

export async function build(K, decade = '90s') {
	const { THREE, tex, W, H, DEPTH } = K;
	const g = new THREE.Group();
	g.name = 'flats';
	const unit = new THREE.PlaneGeometry(1, 1);
	const mats = [];
	await Promise.all(
		LAYERS.map(async (cfg) => {
			const t = await tex(elementUrl(decade, cfg.key));
			const aspect = t.image.width / t.image.height;
			const pos = placement(cfg, decade, false);
			let w, h;
			if (cfg.cover) {
				w = W;
				h = H;
				const fa = W / H;
				if (aspect > fa) {
					t.repeat.set(fa / aspect, 1);
					t.offset.set((1 - fa / aspect) / 2, 0);
				} else {
					t.repeat.set(1, aspect / fa);
					t.offset.set(0, (1 - aspect / fa) / 2);
				}
			} else {
				w = pos.width * W;
				h = w / aspect;
			}
			const m = new THREE.MeshBasicMaterial({
				map: t,
				transparent: true,
				opacity: 1,
				alphaTest: 0,
				depthWrite: false,
				// Over the solids whatever their depth: at the eye the flats ARE
				// the picture, and a solid's front edge sits a hair before its flat.
				depthTest: false,
				side: THREE.DoubleSide
			});
			const mesh = new THREE.Mesh(unit, m);
			mesh.position.set(((pos.x || 0) * W) / 2, ((pos.y || 0) * H) / 2, -cfg.depth * DEPTH + 0.01);
			mesh.scale.set(w, h, 1);
			// Painter's order: the wall first, the bed last.
			mesh.renderOrder = 100 + Math.round((1 - cfg.depth) * 10);
			mats.push(m);
			g.add(mesh);
		})
	);
	// Painter's order: the wall first, the bed last.
	g.children.sort((a, b) => a.position.z - b.position.z);
	const setOpacity = (a) => {
		g.visible = a > 0.001;
		for (const m of mats) m.opacity = a;
	};
	setOpacity(0);
	return { group: g, setOpacity };
}
