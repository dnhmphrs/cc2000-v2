// ── Every experiment, in one list ────────────────────────────────────────────
// The index (/log) and the small bar on the lab and the reels
// (components/LabBar.svelte) both read this, so a sketch is listed once.
//
// BOARD is the blackboard rebuild (docs/explore-03.md, -04, -05), every beat
// in the order of the run, the round it came in, every variant of it
// ([variant, one line]) — THE CUT, /cut, plays every one of them in this
// order — and `cut`, the variant it plays in the short cut (/v4?chain=one,
// one of each; null: no pick there, because another sketch holds that
// slot's pick or it is not a slot in the run) and plays first among its
// beat's in the cut. REELS play sketches end to end (/v4?chain=…). EARLIER
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
		sketch: 'log-entry',
		cut: null,
		name: 'The data entry',
		round: 5,
		what: 'The two answers taken as fields ON the lattice they form (flow-conception’s): the date typed into cells standing on a row, which its Enter makes the real axis; a 1–10 slider whose ten stops are ten lattice points and whose handle leans the second period live.',
		variants: [
			[
				'lattice',
				'the date in ten cells, Enter writing the rows out; the handle dragged from 1 to 7, the second family leaning with it, the cell drawn round the origin with its gluings'
			]
		]
	},
	{
		sketch: 'log-kummer',
		cut: null,
		name: 'The structure',
		round: 5,
		what: 'Conception as the fixed point of a fold: the lattice rolled and bent into the torus, the torus half-turned about its skewer (z ↦ −z) with its four fixed points lit, folded onto itself, and the lens into the origin’s node — a cone, a tunnel.',
		variants: [
			[
				'pillow',
				'the quotient: the lid swung down, the rims pinched to the skewer, the pillowcase with its four cone points; the dive into the origin’s'
			],
			[
				'quartic',
				'the same to the turn, then Kummer’s quartic with its sixteen nodes in the torus’s stead, the dive into the one furthest along the skewer'
			]
		]
	},
	{
		sketch: 'log-intro',
		cut: null,
		name: 'The intro, by hand',
		round: 5,
		what: 'From the title card to both answers, typed and dragged by hand: the run waits at each question (?demo=1, or a pin, plays the demo’s hand). No zoom into the full stop, no command, dim.',
		variants: [
			[
				'prompt',
				'the terminal carries on: the questions typed under the title, answered at a prompt, the spice an ASCII slider'
			],
			[
				'inline',
				'the sentence completed by hand: the date typed into its blank, the spice rolled in by a slider'
			],
			[
				'scroll',
				'a real shell: lines arrive at the bottom, the title scrolls off the top, the spice a bar of characters'
			],
			[
				'form',
				'a clean form under the frozen title: a boxed DD | MM | YYYY, a notched spice track, ▸ CONTINUE'
			],
			[
				'orb-net',
				'the stop lights into a quiet orb, the net in faint chalk round it; each answer one log step in'
			],
			[
				'orb-rings',
				'the stop lights in place, the log picture round it, dim; the spice a dial dragged round a ring'
			],
			[
				'spiral',
				'time as a log spiral round the full stop: the date read along it as it is typed, the spice a dial on its inner turn'
			],
			[
				'dial',
				'odometer wheels roll the date into place; a rotary knob with ten detents for the spice'
			],
			[
				'one',
				'one thing at a time, large; each answer collapses to a point that joins the full stop'
			],
			[
				'plot',
				'the machine plots you: a timeline 1900–2099 and a scale 1–10, the date a point along one, the spice its height'
			],
			[
				'carriage',
				'one fixed point the type is struck at, the paper moving under it; Enter a carriage return, the spice a scale dragged past the point'
			],
			[
				'cal',
				'the month you were born in prints and sets itself as you type; the box on your day becomes the spice’s handle'
			],
			[
				'morse',
				'the full stop is the lamp: the date sent in dots and dashes; the spice a window sliding on the code'
			],
			[
				'punch',
				'the date cut into a card a digit at a time, the card read by light; the spice one hole punched by a die'
			],
			[
				'epicycle',
				'the date drawn as one closed curve by a chain of circles hung from the full stop; the spice its symmetry'
			]
		]
	},
	{
		sketch: 'log-swimmer',
		cut: null,
		name: 'The swimmer, made in 3D',
		round: 5,
		what: 'A true 3D swimmer generated from nothing, twelve ways of making a solid, then swimming at an exact mathematical object; and genome, the v5 flows’ shared body on its own.',
		variants: [
			[
				'lathe',
				'a profile turned on its axis, pressed to the paddle, the tail drawn out; along the equiangular spiral into its pole'
			],
			[
				'rings',
				'sections stacked nose to tip, joined by generatrices; down the Riemann surface of log z to its branch point'
			],
			[
				'cloud',
				'a chalk haze condenses onto the body, then is wired; it swims the spiral of e^z toward 0'
			],
			['implicit', 'metaballs summed and sliced nose to tip; twice round the branch point of √z'],
			[
				'cell',
				'a round cell elongates, the head condenses, the tail buds; the loxodrome of the Riemann sphere to its pole'
			],
			[
				'sweep',
				'the centreline first, a tube swept round it, the head blown; into the nautilus, a log-spiral tube'
			],
			[
				'contours',
				'the body mapped by its thickness, the map raised into slices; up ζ(½ + it) to its first zero'
			],
			[
				'knit',
				'the skin knitted round by round from the nose; down a loxodromic Möbius flow into its sink'
			],
			[
				'draft',
				'drawn in plan and elevation, lifted off the sheet; into a golden-angle phyllotaxis funnel'
			],
			[
				'three',
				'a shaded mesh on the lab’s renderer, lathed and extruded; round the three sheets of z^{1/3} into the branch point'
			],
			[
				'cage',
				'box-modelled: a cube extruded, subdivided (Catmull–Clark) to its limit; to the point where the Fermat quintic’s five sheets meet'
			],
			[
				'filament',
				'one thread, the pen never lifting, wound on an invisible mandrel; up the pseudosphere’s horn'
			],
			[
				'genome',
				'the kit on its own: the date’s rosette as the body’s sections (log/body.js), built ring by ring, swimming at draft’s disc as it opens into its tunnel (log/phyllo.js)'
			]
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
			['flip', 'Möbius maps one after another, written as they happen'],
			[
				'cat',
				'Arnold’s cat map on the torus of rooms: the room stretched and folded, and back after finitely many turns'
			],
			['twist', 'Dehn twists: the lattice sheared by SL₂(ℤ), the torus reshaped, the net re-tiled'],
			[
				'weierstrass',
				'℘: the torus folded two to one onto the sphere, branched at the four half-periods'
			],
			[
				'hopf',
				'the Clifford torus in S³, a union of Hopf circles, projected: nested tori round the axis'
			],
			['knot', 'a (p, q) torus knot: a straight line on the flat torus, wound on the torus in 3D']
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
		sketch: 'log-universe',
		cut: 'torus',
		name: 'Closed universes',
		round: 3,
		what: 'Spaces with no edge and finite volume, seen from inside: closed, yet open wherever you stand.',
		variants: [
			['torus', 'T³: a cube whose faces are glued; from inside, the same room through every wall'],
			['dodeca', 'Poincaré’s dodecahedral space: opposite faces glued with a tenth of a turn'],
			['mirror', 'a Klein bottle: the swimmer comes round and back as its own mirror image'],
			['sphere', 'Einstein’s S³: what recedes past the equator grows again, and fills the sky'],
			[
				'seifert',
				'Seifert–Weber space: the hyperbolic dodecahedron, faces glued with three tenths of a turn, its neighbours shrinking away'
			],
			['octa', 'the octahedral space S³/2O: a truncated cube, the view from inside'],
			[
				'quaternion',
				'the quaternion space S³/Q₈: a cube whose opposite faces are glued with a quarter turn'
			],
			['lens', 'a lens space L(5, 1): the lens cell, its copies spiralling round the axis']
		]
	},
	{
		sketch: 'log-charts',
		cut: 'mercator',
		name: 'Coordinate charts',
		round: 3,
		what: 'A space is covered by charts, flat maps of pieces of it; closed in one chart, open in the next.',
		variants: [
			[
				'mercator',
				'the sphere unrolled into Mercator’s chart, which is log z: every loxodrome a straight line'
			],
			['atlas', 'the sphere in two charts, from N and from S, glued on their overlap by w = 1/z'],
			[
				'kruskal',
				'one black hole, three charts: Schwarzschild, Kruskal, Penrose, and Flamm’s bridge'
			],
			['desitter', 'de Sitter’s hyperboloid sliced closed, flat and open: it depends on the chart'],
			['torus', 'the flat torus as a glued square, rolled up; the straight line a trefoil knot']
		]
	},
	{
		sketch: 'log-passage',
		cut: 'hyperbolic',
		name: 'Moving through rooms',
		round: 3,
		what: 'Many rooms in other geometries, closed and open at once, the lens moving through them to land in the one asked for.',
		variants: [
			[
				'hyperbolic',
				'the Circle Limit of rooms: hyperbolic golden rectangles, six at every corner, the lens a Möbius translation'
			],
			[
				'torus',
				'the room glued to itself, T³: its lattice of copies in chalk, the colour moving into the next'
			],
			['wormhole', 'two rooms joined by Flamm’s paraboloid, glass to glass through the throat'],
			[
				'spiral',
				'rooms in the golden rectangle’s squares, the lens a quarter turn and φ smaller each room'
			]
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
		sketch: 'log-stage',
		cut: null,
		name: 'The stage',
		round: 4,
		what: 'The room’s layers stood up as flats in 3D between a plank floor and a ceiling slab, a perspective study on blue: from the eye it is the drawing, from anywhere else a set with its lines of sight; every variant loops away and home.',
		variants: [
			[
				'orbit',
				'a dolly zoom from the drawing into the room, a loop round the set, and back out to the drawing'
			],
			[
				'swing',
				'the study’s own shots: low looking up with the floor filling the frame, high looking down over the ceiling, the lens rolled'
			],
			[
				'walk',
				'into the room past the bed, looking round at the desk, the screen, the clock and the ceiling, and back out'
			],
			[
				'explode',
				'the flats slide along their lines of sight from the eye while the lens circles it: the drawing from the eye never changes'
			],
			[
				'shuffle',
				'three different sets, each a random deal of depths, each the same drawing from the eye'
			]
		]
	},
	{
		sketch: 'log-solid',
		cut: null,
		name: 'The solid',
		round: 4,
		what: 'The 2D room rebuilt as a 3D room: every object modelled solid — the desk and its drawers, the anglepoise, the CRT, keyboard and tower, the bed under its blanket, the clock and the posters — between a plank floor and an orange ceiling on the blue, flat colours shaded by gradients, white edges, construction lines run out long; from the eye it lines up with the drawing, and every variant loops away and home. ?ink=1 draws it as a sketch: the board’s dark, chalk lines, no colour (flow-dodeca lands in it with ?end=solid). An exploration: the rooms stay 2D.',
		variants: [
			[
				'orbit',
				'out of the elevation on a dolly zoom and once round the room: under the floor looking up, round the side, over the ceiling looking down, and home'
			],
			[
				'swing',
				'the study’s low rolled corner shots: under the floor at one corner, the bed huge and near, over the ceiling’s corner at the other, the lens rolled with the swing'
			],
			[
				'inside',
				'in through the open front and up at the orange ceiling, round to the desk, the monitor and the lamp, up the wall to the clock and the posters, and out'
			],
			[
				'sheet',
				'the drawing set: the perspective view, straight up to the plan with the ceiling lifted away, round to the section, each captioned, and back'
			],
			[
				'explode',
				'the exploded diagram: every part drifts out along its own construction lines, which stay, and comes home while the lens arcs over'
			],
			[
				'draw',
				'the drawing stands up: the flat layers dissolve into the solids as the lens leaves the eye, and come back as it returns'
			],
			['turn', 'the model shot: the room turns once on the blue under a low wide lens']
		]
	},
	{
		sketch: 'log-genesis',
		cut: null,
		name: 'The room from the dot',
		round: 3,
		what: 'Five more generations of the room out of the lit dot, each by a different piece of the board’s maths.',
		variants: [
			['seeds', 'a sunflower of seeds at the golden angle, the room at rising resolution'],
			['squares', 'the Fibonacci squares whirl out of the golden rectangle’s pole'],
			['lamp', 'the dot is the lamp’s bulb: the room lit by 1/r², the corners last'],
			['conformal', 'the room squeezed into a disc by Jacobi’s sn, relaxed to the plate'],
			['ink', 'the swimmer’s tail is a pen: the room’s ink first, then its colour']
		]
	},
	{
		sketch: 'log-appear',
		cut: null,
		name: 'The rooms, from the geometry',
		round: 4,
		what: 'More ink sketches of how the rooms might come out of the geometry itself: a cell of the lattice, the torus folded, the nodes of the Kummer surface.',
		variants: [
			[
				'cell',
				'the period lattice’s fundamental cell is the room, and every translate the same room'
			],
			['fold', 'the torus of rooms folded by x ↦ −x: each room meets its mirror image at the fold'],
			['nodes', 'the Kummer surface’s sixteen nodes are sixteen rooms, the lens into one'],
			['etching', 'the net’s lines bend into the room’s lines: the geometry is the room’s ink'],
			['trope', 'a trope’s conic is the monitor’s glass, and the room comes up round it']
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
	},
	{
		sketch: 'log-tame',
		cut: null,
		name: 'Tame geometry',
		round: 4,
		what: 'One-offs on o-minimality: geometry with no pathology — finitely many pieces at every scale, and the few rational points a transcendental curve can hold.',
		variants: [
			[
				'cells',
				'a definable set cut into finitely many cells, drawn one by one; the swimmer’s path crosses finitely many'
			],
			[
				'height',
				'Pila–Wilkie: the rational points of height ≤ H densify, and only a few land on the curve'
			],
			[
				'exp',
				'the exponential field: the plane seen through exp and log, the lattice wrapped onto the torus'
			],
			[
				'special',
				'André–Oort: the modular curve’s fundamental domain, its special points lit, a curve through them'
			]
		]
	},
	{
		sketch: 'log-abelian',
		cut: null,
		name: 'Abelian varieties',
		round: 4,
		what: 'One-offs on complex tori and the Kummer surface: the period lattice, theta, and an abelian surface folded by −1 into a quartic with sixteen nodes.',
		variants: [
			[
				'lattice',
				'the period lattice Λ in ℂ, its fundamental parallelogram folded into the torus ℂ/Λ'
			],
			[
				'theta',
				'the theta function on the torus: its level lines in ink, its zero moving over the parallelogram'
			],
			[
				'kummer',
				'the Kummer quartic turning in ink: sixteen nodes, sixteen tropes, each plane touching along a conic'
			],
			[
				'sixteen',
				'the 16₆ configuration: every node on six tropes, every trope through six nodes — the half-periods'
			]
		]
	}
];

// The v4 FLOWS: whole runs on the board, each a different answer to the
// same brief (docs/explore-06.md) — the terminal, the questions on the way
// to the point, the flash, the arithmetic geometry, and the rooms out of it —
// built to be mixed and matched, not judged. /flows plays them end to end.
export const FLOWS = [
	{
		sketch: 'flow-rosette',
		name: 'Rosette',
		what: 'v5: the epicycle intro itself, its figure becoming every ring of the swimmer; draft’s disc opens into the tunnel by the log map, and the tunnel’s rings count the years back to the birth year and the days to conception'
	},
	{
		sketch: 'flow-wormhole',
		name: 'Wormhole',
		what: 'v5: epicycles draw the head’s outline, filled as an implicit surface; the disc sinks into Flamm’s paraboloid, a wormhole’s throat; out of it down the past light cone to the event'
	},
	{
		sketch: 'flow-harmonic',
		name: 'Harmonic',
		what: 'v5: epicycles write the tail’s beat as a wave; the body swept along it; a bending tunnel of golden-angle rings; a cellular automaton seeded with the date runs its generations back to one cell'
	},
	{
		sketch: 'flow-strand',
		name: 'Strand',
		what: 'v5: the date written on a double helix, read codon by codon into the body’s rings; a log-scale horn; the calculation worked in chalk — the birth date minus 266 days, Zeller’s weekday'
	},
	{
		sketch: 'flow-strand-sun',
		name: 'Strand · sun',
		what: 'v6, the journey as one beat: draft’s seeds dawn into a spectral log-polar sun (GPU), the months written on its spokes; its rings square up into the rooms’ frames, the sun in every glass, its core the last screen and the white flash'
	},
	{
		sketch: 'flow-strand-sketch',
		name: 'Strand · sketch',
		what: 'the next run (/next), sketch F: the 0.11 tunnel — the count of days struck off, the months, the band, the date on it, the dive — then the slot KEPT through the rooms, each repeated round itself (a tesseract), the questions over them in chalk — where, the lights, what mum wore, what dad said — each answer turning the swimmer, the lens to rest in the last room, the slow holy sun, the room back out of it already in full colour, the song and its artist named only there and held; the run holds on its last frame, the glow gone, the room’s depths parting after the pointer (AGAIN: the words fade, the screen goes dark, the lens dollies on through the glass after the swimmer into the next run; PLAY the song on Spotify); a birthday the archive cannot answer for breaks down at the band instead of diving — the gif in the seam, the band torn open onto the gif tiled across the board, the verdict over it; the words in log/sketch-copy.js'
	},
	{
		sketch: 'flow-strand-sketch-a',
		name: 'Sketch · A',
		what: 'kept beside the next run (/next?v=a): the original sketch of 0.10 — the journey in two halves: the count of days struck off down the tunnel, the rings drawn apart into the slot, the date on the white-hot band, the dive through it, the chalk fall through the rooms with Zeller over them, the flash'
	},
	{
		sketch: 'flow-strand-sketch-b',
		name: 'Sketch · B',
		what: 'kept beside the next run (/next?v=b): sketch A’s tuned version of 0.11 — the same two halves through the lens and the GPU ink, the soft fuzz that keeps moving, the sunbeam flash, the landing inside the room'
	},
	{
		sketch: 'flow-strand-sketch-c',
		name: 'Sketch · C',
		what: 'kept beside the next run (/next?v=c): 0.13 — one tunnel half as long, the number theory then the flying dates and news, the circle drawn into a rectangle as the rooms begin, the date once on the last screen, the band flash with the flood of colour'
	},
	{
		sketch: 'flow-strand-sketch-d',
		name: 'Sketch · D',
		what: 'kept beside the next run (/next?v=d): 0.14 — one tunnel in two parts, the maths quickening into the mass of dates and the date found in the middle of the board; the slot, the rooms with a glimpse of their colour, the song computed over them, the band flash, the song named'
	},
	{
		sketch: 'flow-strand-sketch-direct',
		name: 'Strand · direct',
		what: 'the run without tunnel B (/next?v=direct): through the date’s band straight into the last room — the band’s flash IS the sunbeam flash, the room comes out of the white already in colour as the lens comes to rest in it, the song on its screen; the breakdown on a verdict as the run’s'
	},
	{
		sketch: 'flow-strand-sketch-e',
		name: 'Sketch · E',
		what: 'kept beside the next run (/next?v=e): 0.15 — the 0.11 tunnel without its sum, the slot kept through the rooms, the evening worked out over them, the song named over the rooms and again on the screen, the slow sun; a fade and round'
	},
	{
		sketch: 'flow-strand-sketch-one',
		name: 'Sketch · one',
		what: 'set aside (0.12): the hand bad at maths through the decades — − 26.6 years, + 266 months, − 9 years, − 9 months (ten days early) — each scribbled out in its room; then the count day by day; the date only on the last screen'
	},
	{
		sketch: 'flow-strand-sketch-two',
		name: 'Sketch · two',
		what: 'set aside (0.12): every wrong sum is a real date and the zoom flies into its decade — + 266 months (the 2010s), − 266 months (the 60s), − 266 weeks, − 40 weeks, − 9 months — then the long way, day by day, to the date on the band'
	},
	{
		sketch: 'flow-strand-sketch-three',
		name: 'Sketch · three',
		what: 'set aside (0.12): the hand turns 266 days into years by the calendar’s numbers — ÷ 7, ÷ 12, ÷ 24, ÷ 52, ÷ 100 — a needle swinging either side of the birth year into each decade’s room; then gives up and counts day by day, the drumroll, the date on the band'
	},
	{
		sketch: 'flow-strand-sketch-four',
		name: 'Sketch · four',
		what: 'set aside (0.12): the hand reads 266 in the wrong unit — years, months, weeks — each answer a room, the error shrinking tenfold, the sign hunting like a needle; then 266 days done properly'
	},
	{
		sketch: 'flow-strand-sketch-five',
		name: 'Sketch · five',
		what: 'set aside (0.12): the hand can only add — it guesses a day, adds 266, reads TOO EARLY / TOO LATE and overcorrects, swinging closer room by room, decades to days; the date once, on the band'
	},
	{
		sketch: 'flow-strand-horn',
		name: 'Strand · horn',
		what: 'v6, the journey as one beat: the horn’s own sections square off into the rooms’ frames, drawn out of its seeds, on one zoom; the workings pinned one card a room; the log-polar lattice warming into sunshine to the flash'
	},
	{
		sketch: 'flow-strand-corridor',
		name: 'Strand · corridor',
		what: 'v6, the journey as one beat: back through time down a corridor walled with the decades’ rooms, the years on hanging signs struck through, the 266 days on a floor ruler; the birth year’s room its far end from the start, a sun in its screen'
	},
	{
		sketch: 'flow-strand-screens',
		name: 'Strand · screens',
		what: 'v6, the journey as one beat: the calculator working your conception out on screen after glowing screen, each the next room’s monitor, the rooms coming up out of the dark round them; the sunshine on the glass'
	},
	{
		sketch: 'flow-calendar',
		name: 'Calendar',
		what: 'v5: epicycles in three planes trace a space curve, turned on a lathe into the body; the disc opens onto Gabriel’s horn; back along the calendar’s log spiral to conception'
	},
	{
		sketch: 'flow-record',
		name: 'The record',
		what: 'the point is a record’s spindle hole: the grooves come up round it, the needle drops at the flash, and the hole opens onto the rooms'
	},
	{
		sketch: 'flow-torus',
		name: 'The torus',
		what: 'the questions draw a net on the orb, in ink, indexed by the year and the spice; the net lifts into the torus, and a cell of it is the room'
	},
	{
		sketch: 'flow-sphere',
		name: 'The sphere',
		what: 'Garrett’s: a golden sphere in the centre, one transition to lines drawn on it, then the rooms'
	},
	{
		sketch: 'flow-ink',
		name: 'Ink',
		what: 'the simplest: the orb, the questions, the flash, and the room drawn in ink out of the point'
	},
	{
		sketch: 'flow-chalk',
		name: 'Chalk',
		what: 'the fall through chalk rooms, a black and white lattice behind to anchor it'
	},
	{
		sketch: 'flow-dodeca',
		name: 'The dodecahedral space',
		what: 'a cell built round us, every face a room, into the centre one (?end=solid for an exploration: the pane handed to the solid room drawn as a sketch, the lens walking in)'
	},
	{
		sketch: 'flow-conception',
		name: 'Conception',
		what: 'the terminal’s lines are a lattice the answers form, typed and dragged by hand in the lab; its cell rolls into a tube, the tube becomes the swimmer, and it swims down through the chalk rooms into the last room’s screen, where it splashes'
	},
	{
		sketch: 'flow-swim',
		name: 'The swim',
		what: 'the first idea, for comparison: the helix swimmer in view from the start, swimming at the point; the questions; the torus; the rooms'
	}
];

export const REELS = [
	['/v4?chain=flows', 'The v4 flows', 'seven whole runs on the board, end to end (/flows)'],
	[
		'/v4?chain=all',
		'The cut',
		'everything there is, every variant of every beat, in the run’s order (/cut)'
	],
	[
		'/v4?chain=one',
		'The short cut',
		'one of each beat, the variant its cut names, in the run’s order'
	],
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
	for (const f of FLOWS)
		out.push({
			key: `${f.sketch}:`,
			group: 'The v4 flows',
			label: f.name.toLowerCase(),
			href: `/lab?sketch=${f.sketch}`
		});
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
