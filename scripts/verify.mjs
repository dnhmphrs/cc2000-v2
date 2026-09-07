// ── Smoke test ───────────────────────────────────────────────────────────────
// Drives the real site in a real browser and checks the few things that are
// invisible in a diff and have actually broken: the run completing, the answer
// landing in the monitor glass, the loop home, and console errors.
//
//   npm run dev      in one terminal
//   npm run verify   in another
//
// BASE and CHROMIUM are overridable from the environment. Exits non-zero if
// anything failed.
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5178';
const fails = [];
const ok = (name, cond, detail) => {
	console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`);
	if (!cond) fails.push(name);
};

const b = await chromium.launch({
	executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium',
	args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox']
});
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));

const until = async (fn, max = 120) => {
	for (let i = 0; i < max; i++) {
		if (await p.evaluate(fn)) return true;
		await p.waitForTimeout(500);
	}
	return false;
};

await p.goto(`${BASE}/?speed=6`, { waitUntil: 'networkidle' });
await p.selectOption('select[aria-label=month]', '7');
await p.selectOption('select[aria-label=day]', '14');
await p.selectOption('select[aria-label=year]', '1986');
await p.waitForTimeout(300);

// An out-of-range date is reported in place and must not fly anywhere. The
// earliest year the machine offers is always before the charts start.
const earliest = await p.evaluate(() => {
	// The list runs newest first, so the last option is the earliest year.
	const o = document.querySelector('select[aria-label=year]').options;
	return o[o.length - 1].value;
});
await p.selectOption('select[aria-label=year]', earliest);
await p.selectOption('select[aria-label=month]', '1');
await p.click('.go');
ok(
	'error stays on the calculator',
	await until(() => !!document.querySelector('.verdict .err'), 20)
);
await p.selectOption('select[aria-label=year]', '1986');
await p.waitForTimeout(200);
ok('error clears on a new date', await p.evaluate(() => !document.querySelector('.verdict')));

// The run.
await p.click('.go');
ok(
	'run completes',
	await until(() => !!document.querySelector('.again') || !!document.querySelector('.card'))
);
ok(
	'answer lands in the monitor glass',
	await p.evaluate(() => {
		const g = document.querySelector('.glass');
		return !!g && g.getBoundingClientRect().width > 40;
	})
);

// The loop home: one continuous move, so the calculator must arrive at identity.
await p.click('.again');
ok(
	'calculator lands home square on the viewport',
	await until(() => {
		const c = document.querySelector('.calculator');
		if (!c || !document.querySelector('.go')) return false;
		const t = getComputedStyle(c).transform;
		return t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)';
	})
);
ok('the machine is usable again', await p.evaluate(() => !!document.querySelector('.go')));
ok('no console errors', errs.length === 0, errs[0] ?? '');

await b.close();
console.log(fails.length ? `\nFAILED: ${fails.join(', ')}` : '\nAll passed.');
process.exit(fails.length ? 1 : 0);
