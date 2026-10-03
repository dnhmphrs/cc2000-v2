<script>
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { stops, stopOf } from '$lib/data/experiments';

	// ── A small bar for stepping between experiments ─────────────────────────
	// Bottom right of the lab, the reels and the index, out of the way of the
	// corner's run switch and the sketches' own tags: the experiment on screen,
	// an arrow either side to the one before and after (in the index's order,
	// data/experiments.js), and a select to jump to any of them, or to the
	// index. Each move is a full reload, as the run switch's is — every page
	// here mounts its own canvas, and a fresh page is the one way to be sure
	// nothing of the last is left.
	const STOPS = stops();
	$: here = stopOf($page.url);
	$: i = STOPS.findIndex((s) => s.key === here);
	$: prev = i > 0 ? STOPS[i - 1] : STOPS[STOPS.length - 1];
	$: next = i >= 0 && i < STOPS.length - 1 ? STOPS[i + 1] : STOPS[0];
	$: label = i >= 0 ? STOPS[i].label : 'index';
	const href = (h) => {
		const [path, q] = h.split('?');
		return `${resolve(path)}${q ? `?${q}` : ''}`;
	};
	const go = (e) => {
		const v = e.target.value;
		if (v) location.href = v === 'index' ? resolve('/log') : href(v);
	};
	let groups = [];
	for (const s of STOPS) {
		let g = groups[groups.length - 1];
		if (!g || g.name !== s.group) groups.push((g = { name: s.group, stops: [] }));
		g.stops.push(s);
	}
</script>

<nav class="labbar" aria-label="Experiments">
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a href={href(prev.href)} data-sveltekit-reload title={prev.label} aria-label="previous">‹</a>
	<span class="pick">
		<select value={i >= 0 ? STOPS[i].href : 'index'} on:change={go} aria-label="experiment">
			<option value="index">index</option>
			{#each groups as g (g.name)}
				<optgroup label={g.name}>
					{#each g.stops as s (s.key)}
						<option value={s.href}>{s.label}</option>
					{/each}
				</optgroup>
			{/each}
		</select>
		<span class="name" aria-hidden="true">{label} ▾</span>
	</span>
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a href={href(next.href)} data-sveltekit-reload title={next.label} aria-label="next">›</a>
</nav>

<style>
	.labbar {
		position: fixed;
		right: 10px;
		bottom: 8px;
		z-index: 35;
		display: flex;
		align-items: center;
		gap: 0.3em;
		height: 22px;
		padding: 0 4px;
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		font-size: 11px;
		letter-spacing: 0.06em;
		color: rgba(236, 230, 218, 0.55);
		background: rgba(21, 21, 21, 0.55);
		border: 1px solid rgba(236, 230, 218, 0.12);
		border-radius: 4px;
		backdrop-filter: blur(4px);
		user-select: none;
		pointer-events: auto;
		opacity: 0.6;
		transition: opacity 0.15s;
	}
	.labbar:hover,
	.labbar:focus-within {
		opacity: 1;
	}
	a {
		color: inherit;
		text-decoration: none;
		font-size: 16px;
		line-height: 1;
		padding: 0 5px;
	}
	a:hover,
	a:focus-visible {
		color: #f5c150;
		outline: none;
	}
	.pick {
		position: relative;
		display: inline-block;
	}
	.name {
		display: inline-block;
		max-width: 26ch;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		vertical-align: middle;
		pointer-events: none;
	}
	select {
		position: absolute;
		inset: 0;
		width: 100%;
		opacity: 0;
		cursor: pointer;
		font: inherit;
	}
	.pick:hover .name,
	select:focus-visible + .name {
		color: #f5c150;
	}
</style>
