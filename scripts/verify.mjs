// ── Smoke test ───────────────────────────────────────────────────────────────
// Drives the real site in a real browser and checks the few things that are
// invisible in a diff and have actually broken.
//
// THIS BUILD HAS NO MACHINE. The run opens on a title card over a fly-in that is
// already mounted and held at progress zero; the birthday is taken mid-flight by
// a popup and the spice by another at the tunnel's end, on the fall's first
// frame; an out-of-range birthday is NOT refused — the run goes in and the
// tunnel breaks down onto the verdict screen before the spice is ever asked;
// and the loop home flies the camera through the room's monitor straight back
// into the flight. So what this checks is the gate and the two ways out, not a
// calculator:
//
//   the card lifts on its own      no click, and the flight is under it
//   the run stops to ask           in the flight, and again at the tunnel's end
//   out of range breaks down       into the verdict, and calculate again flies on
//   the run completes              a room, with a track in it
//   the loop goes round            through the glass and back into the flight
//
//   npm run dev      in one terminal
//   npm run verify   in another
//
// BASE, CHROMIUM and LANE (webgl | webgpu — see lane.mjs) are overridable from
// the environment, and ROUTE picks the run: / (the site) or /v2 (the WebGL run
// it replaced — the same card, popups and room over different 3D; its popup
// refuses out of range in place, so the verdict checks are skipped there).
// Exits non-zero if anything failed.
import { launch } from './lane.mjs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5178';
const ROUTE = process.env.ROUTE ?? '/';
const fails = [];
const ok = (name, cond, detail) => {
	console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`);
	if (!cond) fails.push(name);
};

const { browser: b, lane } = await launch();
console.log(`lane  ${lane}`);
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

// Whichever popup is open. Both use the same selects the machine used to —
// addressed by id now rather than by aria-label, because the selects carry
// real <label for> elements and an aria-label on top of one would override the
// visible word.
const answerDob = async (month, day, year) => {
	await p.selectOption('#ask-year', String(year));
	await p.selectOption('#ask-month', String(month));
	await p.selectOption('#ask-day', String(day));
	await p.waitForTimeout(200);
};
const asksSpicy = () => /spicy/i.test(document.querySelector('.ask .q')?.textContent ?? '');

// ?seed= pins every choice the run leaves to chance — config/dev.js.
await p.goto(`${BASE}${ROUTE}?speed=6&seed=1`, { waitUntil: 'networkidle' });

// ── The card lifts on its own ────────────────────────────────────────────────
// Nothing is clicked. If this ever needs a click the run has grown a step.
ok('title card is up on load', await p.evaluate(() => !!document.querySelector('.prelude')));
ok(
	'the card lifts without being clicked',
	await until(() => !document.querySelector('.prelude'), 40)
);

// ── The flight stops to ask ──────────────────────────────────────────────────
ok('the flight asks for a birthday', await until(() => !!document.querySelector('.ask'), 60));

if (ROUTE === '/') {
	// ── Out of range breaks down ───────────────────────────────────────────
	// The earliest year the dial offers is before the archive. It is taken and
	// the run goes in; the tunnel breaks down and the verdict is given with
	// its gif — the spice is never asked, there being no room to ask it over.
	// Calculate again hands the run back to the flight, with no title card.
	const earliest = await p.evaluate(() => {
		const sel = document.querySelector('#ask-year');
		return +sel.options[sel.options.length - 1].value;
	});
	await answerDob(1, 14, earliest);
	await p.click('button.go');
	ok('the birthday lets it fly', await until(() => !document.querySelector('.ask'), 20));
	ok(
		'an impossible birthday breaks down into the verdict',
		await until(() => !!document.querySelector('.error-screen .verdict'), 80)
	);
	ok('without the spice ever being asked', !(await p.evaluate(asksSpicy)));
	ok(
		'with the right gif and the right line',
		await p.evaluate(
			() =>
				/the-past\.gif/.test(document.querySelector('.error-screen img')?.src ?? '') &&
				/dinosaurs/.test(document.querySelector('.error-screen .verdict')?.textContent ?? '')
		)
	);
	await p.click('.error-screen .go');
	ok('calculate again flies on', await until(() => !document.querySelector('.error-screen'), 20));
	ok(
		'and does NOT replay the title card',
		await p.evaluate(() => !document.querySelector('.prelude'))
	);
	ok('and asks again', await until(() => !!document.querySelector('.ask'), 80));
}

// ── A real date ──────────────────────────────────────────────────────────────
// The birthday lets the flight go on into the tunnel, and the spice is asked
// at its far end, over the first room — the fall's first frame.
await answerDob(7, 14, 1986);
await p.click('button.go');
ok('the birthday lets it fly', await until(() => !document.querySelector('.ask'), 20));
ok('the tunnel ends by asking how spicy', await until(asksSpicy, 80));
await p.selectOption('#ask-spicy', '4');
await p.click('button.go');
ok('the second answer lets it dive', await until(() => !document.querySelector('.ask'), 20));

// ── The run ──────────────────────────────────────────────────────────────────
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

// ── The loop home ────────────────────────────────────────────────────────────
// Through the glass and back into the flight — no title card the second time,
// and the questions get asked again because asking them is the shape of the run.
await p.click('.again');
ok('the loop lands back in the flight', await until(() => !document.querySelector('.again'), 40));
ok(
	'and does NOT replay the title card',
	await p.evaluate(() => !document.querySelector('.prelude'))
);
ok('and asks again', await until(() => !!document.querySelector('.ask'), 80));

ok('no console errors', errs.length === 0, errs[0] ?? '');

await b.close();
console.log(fails.length ? `\nFAILED: ${fails.join(', ')}` : '\nAll passed.');
process.exit(fails.length ? 1 : 0);
