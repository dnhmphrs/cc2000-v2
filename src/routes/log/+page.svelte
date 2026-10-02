<script>
	import { resolve } from '$app/paths';

	// ── /log — the blackboard, indexed ───────────────────────────────────────
	// Every sketch of docs/explore-03.md and docs/explore-04.md and every
	// variant of each, in the order of the run, each a link into the lab (a
	// pure function of its progress, so ?at= pins any frame), the round each
	// came in, the two reels that play one variant of each end to end
	// (/v4?chain=log, /v4?chain=clopen), and the play reel, the clopen films
	// back to back (/v4?chain=play). Nothing here is the run.
	const BEATS = [
		{
			sketch: 'log-dawn',
			name: 'Beginnings',
			round: 2,
			what: 'From nothing to the orb the first question is asked under; every one ends on the orb’s first frame.',
			variants: [
				['fullstop', 'the title card’s sentence, its full stop swelling into the orb'],
				['axiom', 'a proof: a point, a circle, the pencil of circles blooming out of it'],
				['cone', 'a light cone in a spacetime diagram, turned end-on into the tunnel'],
				['sky', 'the night sky round the pole, star trails tightening into spirals'],
				['title', 'the board as Lecture 1, with a correction in red chalk']
			]
		},
		{
			sketch: 'log-orb',
			name: 'The orb',
			round: 1,
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
			round: 1,
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
			round: 1,
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
			round: 1,
			what: 'The moment, as geometry: the swimmer reaches the pole.',
			variants: [
				['invert', 'the sphere turns over: 0 and ∞ change places'],
				['ring', 'a pulse out through the Apollonian circles; Θ'],
				['pinch', 'the horn torus, where 0 and ∞ meet']
			]
		},
		{
			sketch: 'log-spacetime',
			name: 'Into spacetime',
			round: 2,
			what: 'From the tunnel, by projective and Möbius maps written as they happen, to spacetime closed up.',
			variants: [
				['penrose', 'the tunnel was a light cone; tipped and squeezed into the Penrose diamond'],
				['boost', 'the zoom is a boost of the sky; the boosted frame closes on the light'],
				['conic', 'the line at infinity in view: circles become hyperbolas; ℝP²'],
				['cayley', 'the disc to the half-plane, read as spacetime, into the Penrose triangle'],
				['einstein', 'the tunnel was a cylinder: Einstein’s universe, its two i⁰ one point']
			]
		},
		{
			sketch: 'log-mobius',
			name: 'The turn',
			round: 1,
			what: 'Out of the flat board into 3D: the net was on a sphere all along.',
			variants: [
				['sphere', 'the net lifted onto the Riemann sphere, the lens orbiting'],
				['torus', 'the cylinder glued by a zoom into a torus'],
				['flip', 'Möbius maps one after another, written as they happen']
			]
		},
		{
			sketch: 'log-closure',
			name: 'The closure',
			round: 2,
			what: 'Zoom out from the sphere and the space round it closes up on itself.',
			variants: [
				['projective', 'ℝP³: lines run out to the sphere at ∞ and back in from the other side'],
				[
					'conformal',
					'S³ = ℝ³ ∪ ∞: every line bends into a circle through ∞, which comes into view'
				],
				['hopf', 'every point of the sphere a circle in the space round it, every two linked'],
				['mirror', 'inversion in the sphere: the outside, written again inside']
			]
		},
		{
			sketch: 'log-arrival',
			name: 'The rooms appear',
			round: 2,
			what: 'How the room first comes into being, from a lit point to the room swaying on its depths.',
			variants: [
				['assemble', 'the six layers fly out of the light on golden spirals, deepest first'],
				['obscura', 'the light is a pinhole: the room upside down, turning upright'],
				['glass', 'the monitor’s glass first; the lens pulls back and the room is put round it'],
				['sphere', 'the four decades’ rooms on the sphere; it turns, and flattens into one'],
				['escher', 'the Print Gallery: the room in its own monitor, untwisting as we land']
			]
		},
		{
			sketch: 'log-fall',
			name: 'The fall',
			round: 1,
			what: 'Glass in glass down to the room, and the room’s parallax at the end.',
			variants: [
				['droste', 'the Droste fall, each room’s layers by depth'],
				['golden', 'each room turned by the golden angle; untwists to land'],
				['chalk', 'the rooms drawn in chalk first, filled as the lens arrives']
			]
		},
		{
			sketch: 'log-clopen',
			name: 'Play',
			round: 2,
			what: 'Not a slot in the run: the clopen geometry for its own sake — a background, a loading screen, a beat.',
			variants: [
				['schottky', 'Indra’s pearls: a Cantor dust of circles, closing into a necklace'],
				['doyle', 'a Doyle spiral: every circle kisses six, zoomed by its own map'],
				['apollonian', 'the integral gasket, turned inside out into Coxeter’s spiral'],
				['padic', 'the 2-adic integers: every ball clopen, a birthday as a path'],
				['ford', 'the Ford circles, zooming into 1/φ, the worst-approximable number']
			]
		}
	];
	const lab = (sketch, v) => `${resolve('/lab')}?sketch=${sketch}&v=${v}`;
	const reels = [
		[`${resolve('/v4')}?chain=log`, 'The first reel: one of each of the first six beats'],
		[
			`${resolve('/v4')}?chain=clopen`,
			'The second reel: a beginning, into spacetime, the closure, the room appearing'
		],
		[`${resolve('/v4')}?chain=play`, 'Play: the five clopen films back to back, as one loop']
	];
</script>

<svelte:head>
	<title>Explore 03–04 · the log of everything</title>
</svelte:head>

<div class="board">
	<header>
		<h1>The log of everything</h1>
		<p>
			The next rebuild as maths on a blackboard: the complex logarithm turns scaling into sliding,
			so a zoom is a flight down a tunnel, a golden spiral is a swimmer, and the rooms are a loop
			round a torus. Every beat of the run, a few ways each, in the run’s order — and some play.
		</p>
		<ul class="reels">
			{#each reels as [href, line] (href)}
				<li>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a class="reel" {href} data-sveltekit-reload>{line} →</a>
				</li>
			{/each}
		</ul>
	</header>

	<ol>
		{#each BEATS as beat, i (beat.sketch)}
			<li>
				<h2>
					<span class="n">{i + 1}</span>{beat.name}{#if beat.round === 2}<span class="new">new</span
						>{/if}
				</h2>
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
	.reels {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.reels li {
		margin: 0.3em 0;
	}
	.reel {
		font-style: italic;
		font-size: 19px;
	}
	.new {
		font-family: ui-monospace, monospace;
		font-style: normal;
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #151515;
		background: #f5c150;
		border-radius: 3px;
		padding: 2px 6px;
		margin-left: 0.7em;
		vertical-align: 0.3em;
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
	ol ul li {
		margin: 0.35em 0;
		line-height: 1.4;
	}
	ol ul a {
		font-family: ui-monospace, monospace;
		font-size: 14px;
		margin-right: 0.6em;
	}
	ol ul span {
		opacity: 0.65;
	}
</style>
