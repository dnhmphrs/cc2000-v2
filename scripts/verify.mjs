// ── Smoke test ───────────────────────────────────────────────────────────────
// Drives the real site in a real browser and checks the few things that are
// invisible in a diff and have actually broken.
//
// THIS BUILD HAS NO MACHINE. The run opens on a title card over a fly-in that is
// already mounted and held at progress zero; the two answers are taken mid-flight
// by popups that HOLD the flight while they are open; and the loop home flies the
// camera through the room's monitor straight back into the flight. So what this
// checks is the gate, not a calculator:
//
//   the card lifts on its own      no click, and the flight is under it
//   the flight stops to ask        twice, and holds until answered
//   out of range is refused        in place, and the flight does not carry on
//   the run completes              a room, with a track in it
//   the loop goes round            through the glass and back into the flight
//
//   npm run dev      in one terminal
//   npm run verify   in another
//
// BASE, CHROMIUM and LANE (webgl | webgpu — see lane.mjs) are overridable from
// the environment. Exits non-zero if anything failed.
import { launch } from './lane.mjs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5178';
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

// ?seed= pins every choice the run leaves to chance — config/dev.js.
await p.goto(`${BASE}/?speed=6&seed=1`, { waitUntil: 'networkidle' });

// ── The card lifts on its own ────────────────────────────────────────────────
// Nothing is clicked. If this ever needs a click the run has grown a step.
ok('title card is up on load', await p.evaluate(() => !!document.querySelector('.prelude')));
ok(
	'the card lifts without being clicked',
	await until(() => !document.querySelector('.prelude'), 40)
);

// ── The flight stops to ask ──────────────────────────────────────────────────
ok('the flight asks for a birthday', await until(() => !!document.querySelector('.ask'), 60));

// An out-of-range date is refused IN PLACE — there is no machine to report it on
// and no room to fall into, so the popup is the only thing that can say so, and
// it must not let the flight carry the date any further.
const earliest = await p.evaluate(() => {
	const sel = document.querySelector('#ask-year');
	return +sel.options[sel.options.length - 1].value;
});
await answerDob(1, 14, earliest);
await p.click('button.go');
ok(
	'an impossible birthday is refused in place',
	await until(() => !!document.querySelector('.ask .no'), 20)
);
ok('and the flight is still held', await p.evaluate(() => !!document.querySelector('.ask')));

await answerDob(7, 14, 1986);
ok('the refusal clears on a new date', await p.evaluate(() => !document.querySelector('.ask .no')));
await p.click('button.go');

// ── And asks again, closer in ────────────────────────────────────────────────
// The two marks are three seconds apart in the flight, which at ?speed=6 is half
// of one — far too short to catch the panel absent between them. So what is
// checked is that the QUESTION CHANGED, which is the thing that actually matters
// and does not depend on how fast the run is played.
ok(
	'the flight moves on and asks how spicy',
	await until(() => /spicy/i.test(document.querySelector('.ask .q')?.textContent ?? ''), 80)
);
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
