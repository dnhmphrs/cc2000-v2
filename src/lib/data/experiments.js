// ── Every experiment, in one list ────────────────────────────────────────────
// The index (/log) and the small bar on the lab and the reels
// (components/LabBar.svelte) both read this, so a sketch is listed once.
//
// BOARD is the blackboard rebuild (docs/explore-03.md, -04, -05), every beat
// in the order of the run, the round it came in, every variant of it
// ([variant, one line]) and `cut`, the variant it plays in THE CUT — /cut,
// everything there is, one of each, in the run's order (null: not a slot in
// the run). REELS play sketches end to end (/v4?chain=…). EARLIER
// are the rounds before the board: explore 01 and 02, the v4 rough cut and
// the workshop's own sketches, each a single sketch in the lab. RUNS are the
// site's two runs.

export const BOARD = [
	{
		sketch: 'log-dawn',
		cut: 'terminal',
		name: 'Beginnings',
		round: 2,
		what: 'From nothing to the orb the first question is asked under; every one ends on the orb’s first frame.',
		variants: [
			['fullstop', 'the title card’s sentence, its full stop swelling into the orb'],
			['axiom', 'a proof: a point, a circle, the pencil of circles blooming out of it'],
			['cone', 'a light cone in a spacetime diagram, turned end-on into the tunnel'],
			['sky', 'the night sky round the pole, star trails tightening into spirals'],
			['terminal', 'the card as a terminal: a prompt, the sentence typed, its full stop the orb']
		]
	},
	{
		sketch: 'log-orb',
		cut: 'net',
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
		cut: 'fib',
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
		cut: 'plane',
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
		cut: 'invert',
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
		cut: 'penrose',
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
		cut: 'sphere',
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
		cut: 'projective',
		name: 'The closure',
		round: 2,
		what: 'Zoom out from the sphere and the space round it closes up on itself.',
		variants: [
			['projective', 'ℝP³: lines run out to the sphere at ∞ and back in from the other side'],
			['conformal', 'S³ = ℝ³ ∪ ∞: every line bends into a circle through ∞, which comes into view'],
			['hopf', 'every point of the sphere a circle in the space round it, every two linked'],
			['mirror', 'inversion in the sphere: the outside, written again inside']
		]
	},
	{
		sketch: 'log-godel',
		cut: 'loop',
		name: 'Einstein meets Gödel',
		round: 3,
		what: 'Gödel’s rotating universe: the light cones tip over as you go out, until time closes up.',
		variants: [
			[
				'cones',
				'the cones tip toward φ; on the circle of light they touch the plane, beyond it they dip'
			],
			['loop', 'a worldline out of the event, round a closed timelike curve, back to its own past'],
			[
				'chart',
				'the cones cut by t: ellipses, a parabola on the circle, hyperbolas beyond; every point the centre'
			],
			['sentence', 'G ⟺ ¬Prov(⌜G⌝): the sentence that names itself, zoomed into for ever']
		]
	},
	{
		sketch: 'log-arrival',
		cut: 'assemble',
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
		cut: 'droste',
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
		cut: null,
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

export const REELS = [
	['/v4?chain=all', 'The cut', 'everything there is, one of each, in the run’s order (/cut)'],
	['/v4?chain=log', 'The board, first reel', 'one of each of the first six beats'],
	[
		'/v4?chain=clopen',
		'The board, second reel',
		'a beginning, the orb, the tunnel, into spacetime, the closure, the room'
	],
	['/v4?chain=play', 'Play', 'the five clopen films back to back, as one loop'],
	['/v4?chain=explore2', 'Explore 02 reel', 'the Evangelion feel, six sketches end to end'],
	['/v4?chain=explore', 'Explore 01 reel', 'six sketches of the swimmer in the v3 run, end to end'],
	[
		'/v4?chain=v4',
		'The v4 rough cut',
		'approach, descent, impact, lattice, cube: the plan v3 came from'
	]
];

export const EARLIER = [
	{
		name: 'Explore 02 · the Evangelion feel',
		doc: 'docs/explore-02.md',
		sketches: [
			['episode-card', 'the title as a cut, a negative, black, the spiel'],
			['red-sun', 'the egg behind the set; the swimmer’s flash at it'],
			['silhouette', 'a black body with a hot rim, over the sun and in'],
			['lcl-tunnel', 'the archive in one red; colour arrives with the room'],
			['noir-ground', 'a flat, warm, grained off-black under the whole run'],
			['strobe', 'the splosh as a negative: white, black and a cut']
		]
	},
	{
		name: 'Explore 01 · the swimmer in the run',
		doc: 'docs/explore-01.md',
		sketches: [
			['about-face', 'the swimmer comes about to take the questions'],
			['sky-of-weeks', 'the sky is the archive; it swings to your week'],
			['switch-on', 'the swimmer’s nose lights the set, into the seam'],
			['the-many', 'the swimmer joins the kaleidoscope'],
			['pilot', 'the swimmer leads the fall’s roll'],
			['runout', 'the way home is through the record']
		]
	},
	{
		name: 'The v4 rough cut',
		doc: 'docs/v4-plan.md',
		sketches: [
			['approach', 'space; the swimmer, and the archive adrift in it'],
			['rooms', 'rooms through rooms, decade after decade'],
			['impact', 'the beam strikes the sphere; the zeros ring out'],
			['lattice', 'every number a point; the lens closes on one cell'],
			['cube', 'the cell is a cube, and the cube opens on a room']
		]
	},
	{
		name: 'The workshop',
		doc: null,
		sketches: [
			['petals', 'the icosahedron opens as a flower, the ending inside it'],
			['e8', 'the icosahedron expands out: the 600-cell’s icosians'],
			['heat', 'after the strike: a Ginzburg–Landau field on the sphere'],
			['materials', 'every material the site draws with, old and new side by side']
		]
	}
];

export const RUNS = [
	['/v3', 'v3', 'the run as it is: approach, kaleido, descent, room'],
	['/v2', 'v2', 'the WebGL run v3 replaced']
];

// Every stop the bar can step to, in the index's order: each variant of each
// board sketch, the reels, then the earlier sketches. { key, label, href }.
export function stops() {
	const out = [];
	for (const b of BOARD)
		for (const [v] of b.variants)
			out.push({
				key: `${b.sketch}:${v}`,
				group: 'The board',
				label: `${b.name.toLowerCase()} · ${v}`,
				href: `/lab?sketch=${b.sketch}&v=${v}`
			});
	for (const [href, name] of REELS)
		out.push({ key: `reel:${href}`, group: 'Reels', label: name.toLowerCase(), href });
	for (const g of EARLIER)
		for (const [s] of g.sketches)
			out.push({ key: `${s}:`, group: g.name, label: s, href: `/lab?sketch=${s}` });
	return out;
}

// Which stop a location is: the lab's sketch and variant (the sketch's first
// variant when none is named), or the reel's chain.
export function stopOf(url) {
	const q = url.searchParams;
	if (url.pathname.startsWith('/lab')) {
		const s = q.get('sketch') ?? 'rooms';
		const b = BOARD.find((x) => x.sketch === s);
		const names = b ? b.variants.map(([v]) => v) : [];
		const v = b ? (names.includes(q.get('v')) ? q.get('v') : names[0]) : '';
		return `${s}:${v}`;
	}
	if (url.pathname.startsWith('/v4')) {
		const chain = q.get('chain') ?? 'v4';
		return `reel:/v4?chain=${chain}`;
	}
	return null;
}
