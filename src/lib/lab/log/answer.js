// ── The answers: the two questions, taken by hand ────────────────────────────
// The site asks two things — when were you born, and how spicy (1 to 10) —
// and a sketch that asks them draws its own fields; this is what is the same
// under all of them: the keyboard and the pointer, the run WAITING at each
// question until it is answered, and the demo's hand when no one is there.
//
//   const A = makeAnswers({ live, beats });
//   A.step(time, dt)        advance the sketch's clock (board.js clock), held
//                           at a question until it is answered when live
//   const s = A.hand(t)     the state of both fields at t (below)
//   A.slider(fn)            this frame's slider geometry, for the pointer:
//                           fn(clientX, clientY, phase) → a value 1…10, or
//                           null if (on 'down') the press is not on the
//                           slider; on 'move' return a value wherever the
//                           pointer is (the drag has the handle)
//   A.answers               { date: 'DDMMYYYY', spice: 1…10 } — the demo's
//                           until answered by hand
//
// `beats`, in the sketch's seconds: { q1, wait1, e1, q2, wait2, e2 } — the
// date asked at q1; the field ready at wait1 (live: the clock holds here
// until Enter; scripted: the typing starts here); Enter at e1 (scripted; live,
// the clock jumps to e1 when Enter is pressed, so what a sketch draws on
// Enter plays the same either way). The same for the spice at q2, wait2, e2.
// Scripted needs e1 ≥ wait1 + 2.0 and e2 ≥ wait2 + 1.9.
//
// Live means a person is there: the lab, unpinned (no ?at=), not ?demo=1 —
// the sketch decides and passes it. Scripted, every frame is a pure function
// of t (log/entry.js's hand: 14 · 02 · 1987, spice 7).
//
// The hand at t:
//   asking    'date' | 'spice' | null — which field is taking keys now
//   q1, q2    0…1 the question appearing (over 0.7 s from q1, q2)
//   typed     the date's digits so far ('' … 8 digits)
//   caret     1 while the date field is open (before its Enter)
//   steady    1 just after a key (the caret holds; else it blinks)
//   valid     the 8 digits make a date (DD 01–31, MM 01–12, YYYY 1900–2099)
//   enter1    0…1 over 0.45 s from the date's Enter
//   value     the spice, 1…10, fractional while dragged
//   held      1 while the handle is held
//   enter2    0…1 over 0.45 s from the spice's Enter
//   done      0…1 after both
//   secs      the clock a caret blinks on: real seconds live, t scripted
//
// Keys (from wait1 and wait2): the date — digits, Backspace, Enter (once all eight are in). The
// spice — drag the handle, or ← → (one stop), a digit (0 is 10), Home/End,
// Enter.

import { script, HAND, DEMO } from './entry.js';
import { span } from './board.js';

export { DEMO };

export function validDate(d) {
	if (!/^\d{8}$/.test(d)) return false;
	const day = Number(d.slice(0, 2));
	const month = Number(d.slice(2, 4));
	const year = Number(d.slice(4, 8));
	return day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2099;
}

export function makeAnswers({ live = false, beats }) {
	const B = beats;
	const scriptBeats = {
		q1: B.q1,
		type1: B.wait1,
		e1: B.e1,
		q2: B.q2,
		drag2: B.wait2 + 0.3,
		e2: B.e2
	};
	const answers = { date: DEMO.date, spice: DEMO.spice };
	const st = { typed: '', value: 1, held: 0, date: false, spice: false, key: -9 };
	let hit = null;
	let clockRef = null;
	const now = () => performance.now() / 1000;
	const asking = (t) => {
		if (!st.date && t >= B.q1) return 'date';
		if (st.date && !st.spice && t >= B.q2) return 'spice';
		return null;
	};
	// Keys and the pointer are taken once the field is up (wait1, wait2), not
	// while its question is still being asked: typed ahead, a digit would land
	// in a field the sketch has not drawn yet.
	const taking = (t) => {
		const a = asking(t);
		if (a === 'date' && t >= B.wait1 - 0.05) return a;
		if (a === 'spice' && t >= B.wait2 - 0.05) return a;
		return null;
	};
	const reset = () => {
		st.typed = '';
		st.value = 1;
		st.held = 0;
		st.date = false;
		st.spice = false;
		answers.date = DEMO.date;
		answers.spice = DEMO.spice;
	};

	const onKey = (e) => {
		if (!clockRef) return;
		const a = taking(clockRef.t);
		if (a === 'date') {
			if (/^[0-9]$/.test(e.key) && st.typed.length < 8) st.typed += e.key;
			else if (e.key === 'Backspace') st.typed = st.typed.slice(0, -1);
			else if (e.key === 'Enter' && st.typed.length === 8) {
				st.date = true;
				answers.date = st.typed;
				if (clockRef.t < B.e1) clockRef.seek(B.e1 / clockRef.seconds);
			} else return;
			st.key = now();
			e.preventDefault();
		} else if (a === 'spice') {
			const v = Math.round(st.value);
			if (e.key === 'ArrowRight' || e.key === 'ArrowUp') st.value = Math.min(10, v + 1);
			else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') st.value = Math.max(1, v - 1);
			else if (e.key === 'Home') st.value = 1;
			else if (e.key === 'End') st.value = 10;
			else if (/^[0-9]$/.test(e.key)) st.value = e.key === '0' ? 10 : Number(e.key);
			else if (e.key === 'Enter') {
				st.value = Math.round(st.value);
				st.held = 0;
				st.spice = true;
				answers.spice = st.value;
				if (clockRef.t < B.e2) clockRef.seek(B.e2 / clockRef.seconds);
			} else return;
			st.key = now();
			e.preventDefault();
		}
	};
	const clampV = (v) => Math.max(1, Math.min(10, v));
	const onDown = (e) => {
		if (!clockRef || !hit || taking(clockRef.t) !== 'spice') return;
		const v = hit(e.clientX, e.clientY, 'down');
		if (v === null || v === undefined || !Number.isFinite(v)) return;
		st.held = 1;
		st.value = clampV(v);
		e.preventDefault();
	};
	const onMove = (e) => {
		if (!st.held || !hit) return;
		const v = hit(e.clientX, e.clientY, 'move');
		if (v !== null && v !== undefined && Number.isFinite(v)) st.value = clampV(v);
	};
	const onUp = () => {
		if (!st.held) return;
		st.held = 0;
		st.value = Math.round(st.value);
	};
	if (live) {
		window.addEventListener('keydown', onKey);
		window.addEventListener('pointerdown', onDown);
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
	}

	return {
		live,
		answers,
		slider(fn) {
			hit = fn;
		},
		step(time, dt) {
			clockRef = time;
			if (live) {
				const next = time.t + dt;
				if (!st.date && time.t <= B.wait1 + 0.02 && next >= B.wait1)
					return time.seek(B.wait1 / time.seconds);
				if (st.date && !st.spice && time.t <= B.wait2 + 0.02 && next >= B.wait2)
					return time.seek(B.wait2 / time.seconds);
			}
			const before = time.t;
			time.step(dt);
			if (live && time.t < before) reset();
		},
		hand(t) {
			const s = script(t, scriptBeats);
			s.secs = t;
			s.asking = null;
			if (live) {
				s.secs = now();
				s.asking = asking(t);
				if (!st.date) {
					s.typed = st.typed;
					s.caret = t >= Math.min(B.q1 + 0.4, B.wait1) ? 1 : 0;
					s.steady = now() - st.key < 0.5 ? 1 : 0;
				} else s.typed = answers.date;
				if (!st.spice) {
					s.value = st.value;
					s.held = st.held;
				} else {
					s.value = answers.spice;
					s.held = 0;
				}
			} else if (t >= B.q1 && t < B.e1) s.asking = 'date';
			else if (t >= B.q2 && t < B.e2) s.asking = 'spice';
			s.valid = validDate(s.typed);
			s.done = span(t, B.e2 + HAND.enter, B.e2 + HAND.enter + 0.4);
			return s;
		},
		dispose() {
			window.removeEventListener('keydown', onKey);
			window.removeEventListener('pointerdown', onDown);
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
		}
	};
}
