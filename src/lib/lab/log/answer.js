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
//   touch     1 when the person is on a touch screen (no keyboard of its own)
//   cover     px at the bottom of the board the on-screen keyboard hides now
//             (0 with none) — a sketch lifts its field above h − cover
//
// Keys (from wait1 and wait2): the date — digits, Backspace, Enter (once all
// eight are in). The spice — drag the handle, or ← → (one stop), a digit (0
// is 10), Home/End, Enter.
//
// TOUCH (a phone, a tablet): the board is a canvas, which no on-screen
// keyboard comes up for, so live the controller adds two things of its own
// to the page, over the board: an invisible numeric text field that a tap
// anywhere on the board focuses while the date is asked (its keypad's digits
// and Backspace type into the date, its Done key is Enter), and a small
// ENTER button above the keypad (TAP TO TYPE until the keypad is up, ENTER
// once the eight digits are in, and ENTER for the spice, whose handle is
// dragged with a finger). While it runs the page takes no pan or pinch, so a
// drag stays a drag.

import { script, HAND, DEMO } from './entry.js';
import { span, PAL, TECH_FONT } from './board.js';

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
		if (field) field.value = '';
	};

	// ── The two commits, from a key or the touch button ──────────────────────
	const commitDate = () => {
		if (st.typed.length !== 8) return false;
		st.date = true;
		answers.date = st.typed;
		if (clockRef.t < B.e1) clockRef.seek(B.e1 / clockRef.seconds);
		st.key = now();
		if (field) {
			field.value = '';
			field.blur();
		}
		return true;
	};
	const commitSpice = () => {
		st.value = Math.round(st.value);
		st.held = 0;
		st.spice = true;
		answers.spice = st.value;
		if (clockRef.t < B.e2) clockRef.seek(B.e2 / clockRef.seconds);
		st.key = now();
		return true;
	};

	const onKey = (e) => {
		if (!clockRef) return;
		const a = taking(clockRef.t);
		// The touch field's own keys: its digits and Backspace arrive as its
		// input (below), so only its Enter is taken here.
		const fromField = field && e.target === field;
		if (a === 'date') {
			if (fromField && e.key !== 'Enter') return;
			if (/^[0-9]$/.test(e.key) && st.typed.length < 8) st.typed += e.key;
			else if (e.key === 'Backspace') st.typed = st.typed.slice(0, -1);
			else if (e.key === 'Enter' && st.typed.length === 8) commitDate();
			else return;
			st.key = now();
			e.preventDefault();
		} else if (a === 'spice') {
			const v = Math.round(st.value);
			if (e.key === 'ArrowRight' || e.key === 'ArrowUp') st.value = Math.min(10, v + 1);
			else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') st.value = Math.max(1, v - 1);
			else if (e.key === 'Home') st.value = 1;
			else if (e.key === 'End') st.value = 10;
			else if (/^[0-9]$/.test(e.key)) st.value = e.key === '0' ? 10 : Number(e.key);
			else if (e.key === 'Enter') commitSpice();
			else return;
			st.key = now();
			e.preventDefault();
		}
	};
	const clampV = (v) => Math.max(1, Math.min(10, v));
	const onDown = (e) => {
		if (e.pointerType === 'touch') touch = true;
		if (!clockRef || !hit || taking(clockRef.t) !== 'spice') return;
		if (button && e.target === button) return;
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
	// A tap on the board while the date is asked brings the keypad up (the
	// focus must come from the tap itself, or no keypad shows; pointerup,
	// touchend and click are all taps to one browser or another).
	const tapFocus = (e) => {
		if (!field || !touch || !clockRef || taking(clockRef.t) !== 'date') return;
		if (button && e.target === button) return;
		field.focus({ preventScroll: true });
	};
	const onUp = (e) => {
		if (e.pointerType === 'touch') touch = true;
		tapFocus(e);
		if (!st.held) return;
		st.held = 0;
		st.value = Math.round(st.value);
	};

	// ── Touch: an invisible field for the keypad, and an ENTER button ────────
	let touch = false;
	let field = null;
	let button = null;
	let cover = 0;
	const vv = typeof window !== 'undefined' ? window.visualViewport : null;
	const measureCover = () => {
		cover = vv ? Math.max(0, window.innerHeight - (vv.offsetTop + vv.height)) : 0;
	};
	const saved = {};
	if (live) {
		// A coarse pointer, or the first touch: a laptop's touch screen is not
		// a phone until it is touched.
		touch = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
		field = document.createElement('input');
		Object.assign(field, {
			type: 'text',
			inputMode: 'numeric',
			autocomplete: 'off',
			enterKeyHint: 'done'
		});
		field.setAttribute('pattern', '[0-9]*');
		field.setAttribute('aria-label', 'date of birth, day month year');
		// 16 px or iOS zooms the page in to it; transparent, not hidden, or no
		// keypad comes up for it.
		Object.assign(field.style, {
			position: 'fixed',
			left: '0',
			top: '0',
			width: '1px',
			height: '1px',
			opacity: '0',
			fontSize: '16px',
			border: '0',
			padding: '0',
			margin: '0',
			background: 'transparent',
			color: 'transparent',
			caretColor: 'transparent',
			zIndex: '12',
			pointerEvents: 'none'
		});
		field.addEventListener('input', () => {
			const d = field.value.replace(/\D/g, '').slice(0, 8);
			if (field.value !== d) field.value = d;
			if (!clockRef || taking(clockRef.t) !== 'date') return;
			st.typed = d;
			st.key = now();
		});
		document.body.appendChild(field);
		button = document.createElement('button');
		button.type = 'button';
		Object.assign(button.style, {
			position: 'fixed',
			left: '50%',
			transform: 'translateX(-50%)',
			bottom: '24px',
			zIndex: '12',
			display: 'none',
			padding: '10px 22px',
			minWidth: '120px',
			font: `400 15px ${TECH_FONT}`,
			letterSpacing: '0.12em',
			color: PAL.chalk,
			background: 'rgba(20, 22, 28, 0.82)',
			border: `1px solid rgba(236, 230, 218, 0.45)`,
			borderRadius: '3px',
			touchAction: 'manipulation'
		});
		button.addEventListener('click', (e) => {
			e.preventDefault();
			if (!clockRef) return;
			const a = taking(clockRef.t);
			if (a === 'date') {
				if (st.typed.length === 8) commitDate();
				else field.focus({ preventScroll: true });
			} else if (a === 'spice') commitSpice();
		});
		document.body.appendChild(button);
		// For test drivers (the lab only: live is only ever the lab): the hand.
		window.__hand = st;
		// No pan, pinch or overscroll while the run takes the hand.
		for (const el of [document.documentElement, document.body]) {
			saved[el === document.body ? 'body' : 'html'] = {
				touchAction: el.style.touchAction,
				overscrollBehavior: el.style.overscrollBehavior
			};
			el.style.touchAction = 'none';
			el.style.overscrollBehavior = 'none';
		}
		if (vv) {
			vv.addEventListener('resize', measureCover);
			vv.addEventListener('scroll', measureCover);
		}
		window.addEventListener('keydown', onKey);
		window.addEventListener('pointerdown', onDown);
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
		window.addEventListener('pointercancel', onUp);
		window.addEventListener('touchend', tapFocus, { passive: true });
		window.addEventListener('click', tapFocus);
	}
	// The button: shown on a touch screen while a field is taking, above the
	// keypad when it is up.
	const showButton = (t) => {
		if (!button) return;
		const a = touch && clockRef ? taking(t) : null;
		const focused = document.activeElement === field;
		let label = '';
		if (a === 'date') label = st.typed.length === 8 ? 'ENTER' : focused ? '' : 'TAP TO TYPE';
		else if (a === 'spice') label = 'ENTER';
		if (!label) {
			if (button.style.display !== 'none') button.style.display = 'none';
			return;
		}
		if (button.textContent !== label) button.textContent = label;
		if (button.style.display !== 'block') button.style.display = 'block';
		const b = `${Math.round(24 + cover)}px`;
		if (button.style.bottom !== b) button.style.bottom = b;
	};

	return {
		live,
		answers,
		slider(fn) {
			hit = fn;
		},
		step(time, dt) {
			clockRef = time;
			if (live) {
				measureCover();
				const next = time.t + dt;
				if (!st.date && time.t <= B.wait1 + 0.02 && next >= B.wait1) {
					time.seek(B.wait1 / time.seconds);
					showButton(time.t);
					return;
				}
				if (st.date && !st.spice && time.t <= B.wait2 + 0.02 && next >= B.wait2) {
					time.seek(B.wait2 / time.seconds);
					showButton(time.t);
					return;
				}
			}
			const before = time.t;
			time.step(dt);
			if (live && time.t < before) reset();
			showButton(time.t);
		},
		hand(t) {
			const s = script(t, scriptBeats);
			s.secs = t;
			s.asking = null;
			s.touch = touch ? 1 : 0;
			s.cover = live ? cover : 0;
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
			window.removeEventListener('pointercancel', onUp);
			window.removeEventListener('touchend', tapFocus);
			window.removeEventListener('click', tapFocus);
			if (vv) {
				vv.removeEventListener('resize', measureCover);
				vv.removeEventListener('scroll', measureCover);
			}
			field?.remove();
			button?.remove();
			if (live) {
				for (const [k, el] of [
					['html', document.documentElement],
					['body', document.body]
				]) {
					el.style.touchAction = saved[k]?.touchAction ?? '';
					el.style.overscrollBehavior = saved[k]?.overscrollBehavior ?? '';
				}
			}
		}
	};
}
