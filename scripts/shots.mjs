// ── The contact sheet ────────────────────────────────────────────────────────
// Screenshot any moment of the run, exactly.
//
//   npm run dev                                  in one terminal
//   BASE=http://localhost:3000 node scripts/shots.mjs
//
// The run is a pure function of its clock, so ?at= PINS it at a fraction of
// its length and holds it there: the frame you get is the frame the run draws
// at that moment, not a timed screenshot and a hope. A pinned frame is the
// same on every load, byte for byte, so two sheets of the same moments can be
// diffed, and a difference is a change.
//
//   BASE     the server (npm run dev picks a free port: read it from its log)
//   AT       the moments, in SECONDS of the run, comma separated
//            (default: a walk through the whole run)
//   OUT      where to write (default .shots): one PNG a moment, and sheet.jpg
//   W, H     the viewport (default 1440 × 900; a phone is W=390 H=844)
//   QUERY    more query on every pin, e.g. QUERY='edge=past' for a verdict's
//            run, 'decade=50s' for a room (the run's own switches are listed
//            at the top of src/lib/run/sketch.js)
import fs from 'fs';
import { launch, ready } from './launch.mjs';

const BASE = process.env.BASE ?? 'http://localhost:3000';
const OUT = process.env.OUT ?? '.shots';
const W = Number(process.env.W ?? 1440);
const H = Number(process.env.H ?? 900);
const QUERY = process.env.QUERY ? `&${process.env.QUERY}` : '';
const SECONDS = 44; // the run's length (SECONDS in src/lib/run/sketch.js)
const AT = (
	process.env.AT ?? '2.5,5.2,8.2,13,16.6,18.4,21,24.6,27.6,31.5,34.3,34.9,35.5,36.2,37.3,39.5'
)
	.split(',')
	.map(Number)
	.filter((s) => Number.isFinite(s));

fs.mkdirSync(OUT, { recursive: true });
const browser = await launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
const errs = [];
page.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message));
page.on('console', (m) => m.type() === 'error' && errs.push('CONSOLE: ' + m.text()));

const files = [];
for (const s of AT) {
	// ?at= is read once, as the page boots: each frame is its own page load.
	await page.goto(`${BASE}/?at=${(s / SECONDS).toFixed(5)}${QUERY}`, { waitUntil: 'load' });
	await ready(page);
	await page.evaluate(() => document.fonts.ready);
	await page.waitForTimeout(900);
	const file = `${OUT}/${s.toFixed(2).replace('.', '_')}.png`;
	await page.screenshot({ path: file });
	files.push({ file, s });
	console.log(file);
}

// The sheet: every frame, in order, with its second.
const cols = Math.min(4, files.length);
const rows = Math.ceil(files.length / cols);
const cw = Math.round(1600 / cols);
const ch = Math.round((cw * H) / W);
const sheet = await browser.newPage({ viewport: { width: cols * cw, height: rows * ch } });
await sheet.setContent(
	`<body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(${cols},${cw}px)">${files
		.map(
			({ file, s }) =>
				`<div style="position:relative;height:${ch}px"><img src="data:image/png;base64,${fs.readFileSync(file).toString('base64')}" style="width:${cw}px;height:${ch}px;display:block"><span style="position:absolute;left:6px;bottom:4px;font:12px monospace;color:#fff;background:rgba(0,0,0,.6);padding:1px 4px">${s} s</span></div>`
		)
		.join('')}</body>`
);
await sheet.waitForFunction(() => [...document.images].every((i) => i.complete));
await sheet.screenshot({ path: `${OUT}/sheet.jpg`, type: 'jpeg', quality: 88 });
console.log(`${OUT}/sheet.jpg`);

console.log(errs.length ? [...new Set(errs)].slice(0, 10).join('\n') : 'no console errors');
await browser.close();
process.exit(errs.length ? 1 : 0);
