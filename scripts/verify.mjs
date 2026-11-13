// ── Verify ───────────────────────────────────────────────────────────────────
// Smoke-test the site as a visitor meets it. Run it against a BUILD before
// every push:
//
//   npm run build && npx vite preview --port 4175
//   BASE=http://localhost:4175 node scripts/verify.mjs
//
// (it passes against `npm run dev` too, more slowly). What it holds the site
// to:
//
//   the shell     / answers; the first paint is the run's own dark; the corner
//                 is the build label and nothing else — no links out
//   the run       boots with no errors and no missing file, and WAITS for a
//                 person: the clock holds at each question until it is answered
//   by hand       a date and a spice typed on the keyboard take it to the room;
//                 the output is on the monitor (the line, Spotify's player,
//                 SHARE, START AGAIN); START AGAIN goes round to the title
//   a verdict     a birthday the archive cannot answer for ends on its verdict
//   on a phone    the touch key comes up at the question
//   pinned        ?at= holds a frame
//   elsewhere     any other path is a 404
import { readFileSync } from 'node:fs';
import { launch, ready } from './launch.mjs';

const BASE = process.env.BASE ?? 'http://localhost:4175';
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
let fails = 0;
const ok = (name, pass, note = '') => {
	console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${note ? `  (${note})` : ''}`);
	if (!pass) fails++;
	return pass;
};
const browser = await launch();
const errs = [];
const missing = [];
const watch = (page, who) => {
	page.on('pageerror', (e) => errs.push(`${who}: ${e.message}`));
	page.on('response', (r) => {
		// (Spotify's embed is another site's business)
		if (r.status() >= 400 && r.url().startsWith(BASE)) missing.push(`${r.status()} ${r.url()}`);
	});
};
const tOf = (page) => page.evaluate(() => window.__run?.t ?? 0);
const until = async (page, test, ms) => {
	const t0 = Date.now();
	while (Date.now() - t0 < ms) {
		if (await page.evaluate(test).catch(() => false)) return true;
		await page.waitForTimeout(150);
	}
	return false;
};

// ── The shell, and the run by hand ───────────────────────────────────────────
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
watch(page, 'by hand');
const res = await page.goto(`${BASE}/`, { waitUntil: 'load' });
ok('/ answers', res?.status() === 200);
ok(
	'the first paint is the run’s dark',
	(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)) ===
		'rgb(27, 25, 23)'
);
const label = await page.locator('span.build').allTextContents();
ok(
	'the corner is the build label',
	label.length === 1 && label[0].startsWith(pkg.version),
	label[0] ?? 'none'
);
ok('no links out', (await page.locator('a[href], nav').count()) === 0);
ok(
	'the run boots',
	await ready(page).then(
		() => true,
		() => false
	)
);
const B = await page.evaluate(() => ({ ...window.__run.beats, live: window.__run.live }));
ok('a person is expected: the run is live', B.live === true);
// the title types, then the first question waits
ok(
	'it waits at the first question',
	(await until(page, `window.__run.t >= ${B.wait1 - 0.01}`, 30000)) &&
		(await page.waitForTimeout(1500), Math.abs((await tOf(page)) - B.wait1) < 0.05),
	`t = ${(await tOf(page)).toFixed(2)}`
);
await page.keyboard.type('14021987', { delay: 60 });
await page.keyboard.press('Enter');
ok(
	'the date is taken, and it waits at the second',
	(await until(page, `window.__run.t >= ${B.wait2 - 0.01}`, 20000)) &&
		(await page.waitForTimeout(1500), Math.abs((await tOf(page)) - B.wait2) < 0.05),
	`t = ${(await tOf(page)).toFixed(2)}`
);
await page.keyboard.press('7');
await page.keyboard.press('Enter');
ok(
	'the answers are the person’s',
	await page.evaluate(
		() => window.__run.answers.date === '14021987' && window.__run.answers.spice === 7
	)
);
ok('the lens comes to rest in the room', await until(page, 'window.__run.api.ended()', 60000));
const song = await page.evaluate(() => window.__run.api.song());
ok(
	'the archive names a song',
	!!song?.uri && !song.edge,
	song ? `${song.title} — ${song.artist}` : ''
);
const out = page.locator('.output:not(.preload)');
ok(
	'the output is on the monitor',
	await out.waitFor({ timeout: 8000 }).then(
		() => true,
		() => false
	)
);
ok(
	'a line, the player, two keys',
	(await out.locator('.output-say').count()) === 1 &&
		/^https:\/\/open\.spotify\.com\/embed\/track\//.test(
			(await out
				.locator('iframe')
				.getAttribute('src')
				.catch(() => '')) ?? ''
		) &&
		(await out.locator('.output-keys button').count()) === 2
);
await page.waitForTimeout(800);
await out.locator('.output-keys button').last().click();
ok(
	'START AGAIN goes round to the title',
	(await until(page, '!window.__run.api.ended() && window.__run.t < 5', 20000)) &&
		(await page.locator('.output:not(.preload)').count()) === 0
);
await ctx.close();

// ── A verdict, a phone and a pin, side by side ───────────────────────────────
await Promise.all([
	(async () => {
		const c = await browser.newContext({ viewport: { width: 1280, height: 800 } });
		const p = await c.newPage();
		watch(p, 'verdict');
		await p.goto(`${BASE}/?demo=1&edge=past`, { waitUntil: 'load' });
		await ready(p);
		ok('?demo=1 answers for itself', (await p.evaluate(() => window.__run.live)) === false);
		ok('a verdict’s run ends on its verdict', await until(p, 'window.__run.api.ended()', 90000));
		const s = await p.evaluate(() => window.__run.api.song());
		ok('…and has no song', s?.edge === 'past' && !s.uri);
		await c.close();
	})(),
	(async () => {
		const c = await browser.newContext({
			viewport: { width: 390, height: 844 },
			deviceScaleFactor: 2,
			hasTouch: true,
			isMobile: true
		});
		const p = await c.newPage();
		watch(p, 'phone');
		await p.goto(`${BASE}/`, { waitUntil: 'load' });
		await ready(p);
		await until(p, `window.__run.t >= ${B.wait1 - 0.01}`, 30000);
		const key = p.locator('body > button');
		ok(
			'on a phone the touch key comes up at the question',
			await key.waitFor({ state: 'visible', timeout: 5000 }).then(
				() => true,
				() => false
			),
			(await key.textContent().catch(() => '')) ?? ''
		);
		await c.close();
	})(),
	(async () => {
		const c = await browser.newContext({ viewport: { width: 1280, height: 800 } });
		const p = await c.newPage();
		watch(p, 'pinned');
		await p.goto(`${BASE}/?at=0.5`, { waitUntil: 'load' });
		await ready(p);
		await p.waitForTimeout(1200);
		const t = await tOf(p);
		ok('?at= pins a frame', Math.abs(t - 22) < 0.01, `t = ${t.toFixed(2)}`);
		for (const path of ['/next', '/v2', '/v3', '/lab', '/log']) {
			const r = await p.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
			ok(`${path} is a 404`, r?.status() === 404);
		}
		await c.close();
	})()
]);

// (the 404s above are asked for; anything else missing is a broken link)
const lost = missing.filter((m) => !/\/(next|v2|v3|lab|log)$/.test(m));
ok('no missing files', lost.length === 0);
if (lost.length) console.log([...new Set(lost)].slice(0, 8).join('\n'));
ok('no page errors', errs.length === 0);
if (errs.length) console.log([...new Set(errs)].slice(0, 5).join('\n'));
await browser.close();
console.log(fails ? `\n${fails} FAILED` : '\nAll passed.');
process.exit(fails ? 1 : 0);
