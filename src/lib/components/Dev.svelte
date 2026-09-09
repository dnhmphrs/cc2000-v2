<script>
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { DEV } from '$lib/config';
	import { ORDER, advance, again, clearResult } from '$lib/scenes/director';
	import {
		scene,
		runId,
		dobMonth,
		dobDay,
		dobYear,
		spicy,
		date,
		track,
		conceived,
		decade,
		edge,
		monitorRect,
		gate,
		goingBack
	} from '$lib/store/store';
	import { resolve, earliestBirthday } from '$lib/functions/answer';

	// ── The dev harness ──────────────────────────────────────────────────────
	// Keys for getting at any part of the run without watching the rest of it.
	// What each one does is documented where it is switched on: config/dev.js.
	//
	// Nothing here runs unless DEV.on. Every listener is bound behind that flag,
	// so this file is inert in production rather than merely quiet.

	const EARLIEST = earliestBirthday();

	// A birthday the archive can actually answer for — after the charts start and
	// before today — rolled until resolve() agrees. It is the same function the
	// machine uses, so a roll can never hand back a date the machine would then
	// refuse.
	function roll() {
		const lo = Date.parse(`${EARLIEST}T00:00:00Z`);
		const hi = Date.now() - 864e5;

		for (let i = 0; i < 50; i++) {
			const d = new Date(lo + Math.random() * (hi - lo));
			const iso = d.toISOString().slice(0, 10);
			const level = 1 + Math.floor(Math.random() * 10);
			if (resolve(iso, level).edge) continue;

			// NUMBERS, not strings. The selects bind to numeric option values, so a
			// string here sets the store but leaves the dial reading empty.
			const [y, m, day] = iso.split('-');
			dobYear.set(Number(y));
			dobMonth.set(Number(m));
			dobDay.set(Number(day));
			spicy.set(level);
			edge.set(null);
			return iso;
		}
		return null;
	}

	// Seed a real answer, so a scene jumped straight into has something to work
	// with: the computation needs a decade to search for and the room needs a
	// track. Rolls one if the dials are empty.
	function seed() {
		if (get(track)) return true;
		const iso =
			get(dobYear) && get(dobMonth) && get(dobDay)
				? `${get(dobYear)}-${String(get(dobMonth)).padStart(2, '0')}-${String(get(dobDay)).padStart(
						2,
						'0'
				  )}`
				: roll();
		if (!iso) return false;

		const found = resolve(iso, get(spicy));
		if (found.edge) return false;

		date.set(iso);
		track.set(found.track);
		conceived.set(found.conceived);
		decade.set(found.decade);
		edge.set(null);
		return true;
	}

	// ── The keys are bound by NAME, not by position in ORDER ─────────────────
	// ORDER lost the calculator in this build, so indexing into it would slide
	// every key down one — and scripts/shots.mjs and scripts/verify.mjs both
	// address scenes by these numbers. They stay where they were, and 1, freed
	// up by the machine going away, restarts the run from the title card.
	const KEYS = { 1: 'restart', 2: 'flyIn', 3: 'conception', 4: 'computation', 5: 'room' };

	function goto(name) {
		if (name === 'restart') {
			clearResult();
			monitorRect.set(null);
			goingBack.set(false);
			gate.set('prelude');
			runId.update((n) => n + 1);
			scene.set('flyIn');
			return;
		}
		if (!ORDER.includes(name)) return;
		// Every 3D scene needs an answer behind it now: the run takes one
		// mid-flight, and a jump skips the asking. The gate goes with it — a
		// jumped-to scene must not sit behind a popup nobody opened.
		if (!seed()) return;
		gate.set(null);
		goingBack.set(false);
		// Pinning follows the jump rather than fighting it, so 1-5 stays useful
		// while a scene is held.
		if (DEV.only) DEV.only = name;
		runId.update((n) => n + 1);
		scene.set(name);
	}

	function onKey(e) {
		if (!DEV.keys) return;
		// Never steal a key from a control the operator is actually using.
		const t = e.target;
		if (t && (t.tagName === 'SELECT' || t.tagName === 'INPUT' || t.isContentEditable)) return;

		const where = get(scene);

		if (e.code === 'Space') {
			e.preventDefault();
			// On the machine this only loads the dials. Pressing CALCULATE is
			// still yours — the point is to flick through songs, not to be flown
			// somewhere.
			if (where === 'room') return again();
			return advance(where);
		}

		const n = Number(e.key);
		if (KEYS[n]) {
			e.preventDefault();
			goto(KEYS[n]);
		}
	}

	onMount(() => {
		if (!DEV.on) return;
		if (DEV.only) goto(DEV.only);
		window.addEventListener('keydown', onKey);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') window.removeEventListener('keydown', onKey);
	});
</script>
