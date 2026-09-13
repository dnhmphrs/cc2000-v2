// ── The contact sheet ────────────────────────────────────────────────────────
// Screenshot any beat of any 3D scene, exactly.
//
//   npm run dev      in one terminal
//   node scripts/shots.mjs
//
// Every 3D scene is a pure function of its own progress — nothing in them
// integrates dt — so ?at= PINS a scene at a fraction of its duration and holds
// it there (config/dev.js). The frame you get is the frame the run would have
// drawn at that moment, not an approximation of it, and that is the whole point:
// checking a half-second beat inside a fifteen-second scene by taking timed
// screenshots and hoping is not a method.
//
// It is also how the one hand-over in the run is checked. Shoot flyIn at 1 and
// conception at 0 and the two files should be the same picture — same circle,
// same radius, same brightness — because scenes 2, 3 and 4 are one shot.
//
//   PLAN   [[sceneKey, [progress, ...]], ...]  scene keys are the dev harness's
//          own: "2" flyIn, "3" conception, "4" computation, "5" room.
//   OUT    where to write        W, H   viewport        BASE   dev server
//   SEED   the ?seed= every frame is shot with (default 1), so the panes and
//          the motes fall the same way on every load and a sheet can be diffed
//          against another — config/dev.js
//   LANE   webgl (default) or webgpu — lane.mjs
//
//   PLAN='[["2",[0,0.5,1]],["3",[0]]]' node scripts/shots.mjs
import fs from 'fs';
import { launch } from './lane.mjs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5178';
const OUT = process.env.OUT ?? '.shots';
const W = Number(process.env.W ?? 1280);
const H = Number(process.env.H ?? 800);
const PLAN = JSON.parse(process.env.PLAN ?? '[["2",[0,0.25,0.5,0.75,1]]]');
const SEED = process.env.SEED ?? '1';
const NAME = { 2: 'flyIn', 3: 'conception', 4: 'computation', 5: 'room' };

fs.mkdirSync(OUT, { recursive: true });

const { browser: b, lane } = await launch();
console.log(`lane  ${lane}`);
const p = await b.newPage({ viewport: { width: W, height: H } });
const errs = [];
p.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message));
p.on('console', (m) => m.type() === 'error' && errs.push('CONSOLE: ' + m.text()));

for (const [key, ats] of PLAN) {
	for (const at of ats) {
		// DEV_AT is read once at module load, so each frame is its own page load.
		await p.goto(`${BASE}/?at=${at}&seed=${SEED}`, { waitUntil: 'networkidle' });
		await p.waitForTimeout(1400);
		// 1–5 jump straight to a scene, seeding a real answer on the way past the
		// calculator so the computation has a decade to find — config/dev.js.
		await p.keyboard.press(key);
		await p.waitForTimeout(1800);
		const file = `${OUT}/${NAME[key] ?? key}-${String(at).replace('.', '_')}.png`;
		await p.screenshot({ path: file });
		console.log(file);
	}
}

console.log(errs.length ? errs.slice(0, 10).join('\n') : 'no console errors');
await b.close();
