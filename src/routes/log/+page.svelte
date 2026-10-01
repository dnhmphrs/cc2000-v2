<script>
	import { resolve } from '$app/paths';

	// ── /log — the blackboard, indexed ───────────────────────────────────────
	// Every sketch of docs/explore-03.md and every variant of each, in the order
	// of the run, each a link into the lab (a pure function of its progress, so
	// ?at= pins any frame), and the reel that plays one variant of each end to
	// end (/v4?chain=log). Nothing here is the run.
	const BEATS = [
		{
			sketch: 'log-orb',
			name: 'The orb',
			what: 'The questions, with no swimmer: each answer one logarithmic step closer to a light at the centre.',
			variants: [
				['net', 'the pole of a cyan and pink net of loxodromes'],
				['rings', 'rings and rays of the complex log, one ring per answer'],
				['calendar', 'time as a log spiral; the orb is the moment 266 days back']
			]
		},
		{
			sketch: 'log-sperm',
			name: 'The swimmer',
			what: 'The sperm as a stretch of the golden spiral: the coil its head, the arc its tail.',
			variants: [
				['spiral', 'the plate, written on, and the swimmer swimming into its own pole'],
				['trail', 'the head on the spiral, the plates streaming past'],
				['fib', 'the Fibonacci squares, rubbed out to leave the swimmer'],
				['helix', 'the tail as ζ(½ + it), round the critical line']
			]
		},
		{
			sketch: 'log-tunnel',
			name: 'The tunnel',
			what: 'Down a tunnel the golden angle makes: a zoom into the pole is a flight down the cylinder.',
			variants: [
				['plane', 'the lead’s loxodromes, head on, streaming out'],
				['cylinder', 'the same lattice from inside the log cylinder'],
				['seeds', 'the golden-angle seed head as a funnel']
			]
		},
		{
			sketch: 'log-beat',
			name: 'The beat',
			what: 'The moment, as geometry: the swimmer reaches the pole.',
			variants: [
				['invert', 'the sphere turns over: 0 and ∞ change places'],
				['ring', 'a pulse out through the Apollonian circles; Θ'],
				['pinch', 'the horn torus, where 0 and ∞ meet']
			]
		},
		{
			sketch: 'log-mobius',
			name: 'The turn',
			what: 'Out of the flat board into 3D: the net was on a sphere all along.',
			variants: [
				['sphere', 'the net lifted onto the Riemann sphere, the lens orbiting'],
				['torus', 'the cylinder glued by a zoom into a torus'],
				['flip', 'Möbius maps one after another, written as they happen']
			]
		},
		{
			sketch: 'log-fall',
			name: 'The fall',
			what: 'Glass in glass down to the room, and the room’s parallax at the end.',
			variants: [
				['droste', 'the Droste fall, each room’s layers by depth'],
				['golden', 'each room turned by the golden angle; untwists to land'],
				['chalk', 'the rooms drawn in chalk first, filled as the lens arrives']
			]
		}
	];
	const lab = (sketch, v) => `${resolve('/lab')}?sketch=${sketch}&v=${v}`;
	const reel = `${resolve('/v4')}?chain=log`;
</script>

<svelte:head>
	<title>Explore 03 · the log of everything</title>
</svelte:head>

<div class="board">
	<header>
		<h1>The log of everything</h1>
		<p>
			The next rebuild as maths on a blackboard: the complex logarithm turns scaling into sliding,
			so a zoom is a flight down a tunnel, a golden spiral is a swimmer, and the rooms are a loop
			round a torus. Six beats, a few ways each.
		</p>
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a class="reel" href={reel} data-sveltekit-reload>Play the reel, one of each, end to end →</a>
	</header>

	<ol>
		{#each BEATS as beat, i (beat.sketch)}
			<li>
				<h2><span class="n">{i + 1}</span>{beat.name}</h2>
				<p class="what">{beat.what}</p>
				<ul>
					{#each beat.variants as [v, line] (v)}
						<li>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href={lab(beat.sketch, v)} data-sveltekit-reload>{v}</a>
							<span>{line}</span>
						</li>
					{/each}
				</ul>
			</li>
		{/each}
	</ol>
</div>

<style>
	.board {
		position: fixed;
		inset: 0;
		overflow-y: auto;
		pointer-events: auto;
		background: #151515;
		color: #ece6da;
		font-family: 'Spectral', 'STIX Two Text', Georgia, 'DejaVu Serif', serif;
		padding: 64px max(16px, 6vw) 80px;
		box-sizing: border-box;
	}
	header {
		max-width: 46rem;
	}
	h1 {
		font-style: italic;
		font-weight: 400;
		font-size: clamp(30px, 5vw, 52px);
		margin: 0 0 0.4em;
		color: #f5c150;
	}
	header p {
		font-size: 18px;
		line-height: 1.5;
		opacity: 0.8;
		margin: 0 0 1.2em;
	}
	a {
		color: #5ed3e3;
		text-decoration: none;
		border-bottom: 1px solid rgba(94, 211, 227, 0.35);
	}
	a:hover,
	a:focus-visible {
		color: #eaa2e6;
		border-bottom-color: currentColor;
		outline: none;
	}
	.reel {
		font-style: italic;
		font-size: 19px;
	}
	ol {
		list-style: none;
		padding: 0;
		margin: 3rem 0 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
		gap: 2.2rem 3rem;
	}
	h2 {
		font-weight: 400;
		font-style: italic;
		font-size: 24px;
		margin: 0 0 0.3em;
	}
	.n {
		font-family: ui-monospace, monospace;
		font-style: normal;
		font-size: 13px;
		color: #f5c150;
		margin-right: 0.8em;
		vertical-align: 0.25em;
	}
	.what {
		margin: 0 0 0.8em;
		opacity: 0.7;
		line-height: 1.45;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	ul li {
		margin: 0.35em 0;
		line-height: 1.4;
	}
	ul a {
		font-family: ui-monospace, monospace;
		font-size: 14px;
		margin-right: 0.6em;
	}
	ul span {
		opacity: 0.65;
	}
</style>
