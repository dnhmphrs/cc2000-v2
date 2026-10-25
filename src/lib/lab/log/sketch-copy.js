// ── The copy of flow-strand-sketch: every word that flies, in one table ──────
// EVERYTHING lettered over the journey (the maths, the years and their news,
// the months, the days, the captions, the date at the end) is listed here,
// in the run's order, with WHEN it comes (seconds of the run) and WHERE and
// HOW it flies. The sketch reads this table; nothing textual is hard-coded
// in it. Change a line here and the run shows it.
//
// THE RUN'S LANDMARKS (seconds; the sketch's beat table `B` has them all):
//   22.2  the swimmer alive; 22.5 it sets off; 23.1 – 26.2 the tunnel's rings
//         are sketched in round it, the speed lines from 24.2
//   TUNNEL A — THE DATE (the sketch's own, exact: not in this table):
//   28.7 – 35.0  the count, 266 … 1, struck one by one, the months crossed
//         off as they go — and the years back from now, in the cloud with
//         them (the `years` row below)
//   32.6 – 35.0  the tunnel narrows into the band; 35.0 the date on it,
//         ringed 35.6; 36.8 the dive through it
//   TUNNEL B — THE SONG (this table's rows):
//   36.8 – 53.6  the rooms rush past inside the slot; over them the song is
//         worked out from the date (38.3 – 47.6), the song itself where the
//         original put the date up again and ringed it (45.3)
//   52.4  the last screen lights; 53.7 the sun; 55.0 – 58.8 the colour fades
//         in under it; 55.3 the song and the date, held on the screen; 62
//
// A ROW is one thing that flies. Its fields:
//   at      the second it leaves the vanishing point (a slam pops in over
//           0.32 s; a stream starts here)
//   out     the second it goes: a slam flies on out past the lens from here
//           (gone ~0.4 s later); a stream's last figure is struck here
//   x, y    where a slam sits while it is read, as a fraction of the board
//           from its middle (x right, y down: y −0.26 is above the middle)
//   lines   a slam's lines of lettering, top to bottom: each { text, size }
//           — size as a fraction of the board's height (0.04 ≈ a caption,
//           0.075 big) — and, to have it written on while the slam is up,
//           write: [from, to] (seconds)
//   marks   the red pencil: { line, text, at, kind } — on line `line` (0 is
//           the first), the first place `text` occurs, at `at` seconds, a
//           'strike' (through it, the default) or a 'circle' (round it);
//           `text` left out marks the whole line
//   stream  a stream of figures, one after another, each struck in red as it
//           is used: 'years' (NOW down to the birth year, each year's
//           headline beside it — see HEADLINES and `every`), 'months' (the
//           months back from the birthday, each with the days it gives),
//           'days' (the count: 266 … 1). `slow` / `fast` the figures a second
//           at the stream's slowest and its blizzard (the rate climbs and
//           comes back down, so the first and the last can be read)
//   caption a line typed at the bottom in the terminal's face, from `at` to
//           `until` (not lettered: the machine's status line)
//   hold    a slam that stays put instead of flying on out — it fades at
//           `out` (the date at the end, held for the flash to take it)
//   color   a slam's ink, if not the hand's white (e.g. '#1d1612' dark)
//
// TOKENS: {…} in any text is filled from the answers (fieldsOf below): the
// date's parts, the number theory worked from them, and the song. They are:
//   {birth}  14 · 02 · 1987      {dd} {mm} {yyyy} {yy}   its parts
//   {conception}  24 · 05 · 1986  {weekday}  SUNDAY     (266 days before)
//   {cdd} {cmm} {cyyyy}  the conception's parts
//   Zeller's congruence for the conception's weekday —
//   {zq} {zt} {zK} {zK4} {zJ4} {z5J}  its six terms   {zsum}  their sum
//   {zh}  the sum mod 7
//   {p}      the first prime at or past the birth year (1987 is one)
//   {ecA} {ecB}   the curve y² = x³ + ax + b over F_p: a the day, b the month
//   {ecPx} {ecPy}  a point P on it, the first past x = the day
//   {ec2x} {ec2y}  2P, the point doubled    {np}  the points on the curve
//   {inv}    the day's inverse mod p: {dd} · {inv} ≡ 1 (mod p)
//   {ddmm}   the day and month as one number (1402)   {leg}  its Legendre
//            symbol ({ddmm} | p), 1 or −1
//   {b1} {b2}  a lattice basis made of the date, (dd, mm) and (yy, cc)
//   {r1} {r2}  … reduced (Lagrange–Gauss): the two shortest vectors in it
//   {cf}     the continued fraction of yyyy / ddmm, its first six terms
//   the conception's day, as the almanac has it —
//   {jd}     its Julian day number      {doy}  its day of the year  {week}
//   {moon}   the moon that night (NEW … FULL … WANING CRESCENT)
//   {sun} {animal}  a sun sign and a year's animal — sketch D's, not used in
//            the run (no astrology)
//   {cycle}  the solar cycle it fell in
//   the song (functions/answer.js: the archive's chart for the week) —
//   {spice}  the lever, 1 … 10          {chart}  the chart week's date
//   {title} {artist}   the track at the spice's position (blank on a
//            birthday the archive cannot answer for)
//   that day, as the machine makes it up (MUM and DAD below are lists to
//   edit; picked by the Julian day, so a date always gets the same) —
//   {news}   the conception year's first headline (HEADLINES)
//   {mum}    what mum wore         {dad}  what dad had done
//
// LETTERING: the stroke font has the digits, the capitals, the small letters,
// and · . , : − + = ( ) ⌊ ⌋ / → ⇒ ≤ < ! ≡ ≈ ² ³ | [ ] ; × ± Ш. Anything else
// shows as a space. Headlines are set in CAPITALS.

// ── The copy ─────────────────────────────────────────────────────────────────
export const NOW = 2026; // the year the years count back from

export const COPY = [
	// the machine's status line over the second tunnel, typed at the bottom
	// (the first two, COMPILING USER GENETICS and SIMULATING CONCEPTION, are
	// the sketch's own, log/caption.js)
	{ caption: 'COMPUTING SOUNDTRACK', at: 38.0, until: 48.5 },

	// ── TUNNEL A: the years back from now to the birth year, in the cloud
	// with the count (every: 0 — no headlines; 2 flies one with every second
	// year, from HEADLINES)
	{ stream: 'years', at: 29.0, out: 32.8, slow: 2.2, fast: 10, every: 0 },

	// ── TUNNEL B: the song worked out from the date, over the rooms, in
	// chalk. The parents' steaminess, read off the lever, is a chart position
	{
		at: 38.3,
		out: 40.3,
		x: 0,
		y: -0.27,
		lines: [
			{ text: 'STEAMINESS  {spice} / 10', size: 0.05 },
			{ text: '⇒  CHART POSITION  {spice}', size: 0.046, write: [38.8, 39.15] }
		],
		marks: [
			{ line: 0, text: '{spice} / 10', at: 39.4 },
			{ line: 1, text: '{spice}', at: 39.7, kind: 'circle' }
		]
	},
	// the almanac: the night's moon, the day in its year, the solar cycle
	// (no astrology)
	{
		at: 40.1,
		out: 42.1,
		x: 0,
		y: 0.26,
		lines: [
			{ text: 'MOON: {moon}   ·   DAY {doy} OF {cyyyy}', size: 0.044 },
			{ text: 'JD {jd}   ·   SOLAR CYCLE {cycle}', size: 0.042, write: [40.6, 41.0] }
		],
		marks: [
			{ line: 0, text: '{moon}', at: 41.1 },
			{ line: 1, text: '{cycle}', at: 41.4, kind: 'circle' }
		]
	},
	// that day: the news, and what mum wore
	{
		at: 41.9,
		out: 43.9,
		x: 0,
		y: -0.27,
		lines: [
			{ text: 'THAT YEAR: {news}', size: 0.044 },
			{ text: 'A {weekday}.  MUM WORE {mum}', size: 0.042, write: [42.4, 42.85] }
		],
		marks: [
			{ line: 0, text: '{news}', at: 43.0 },
			{ line: 1, text: '{mum}', at: 43.3, kind: 'circle' }
		]
	},
	// what dad had done, and the chart week the archive answers from
	{
		at: 43.7,
		out: 45.5,
		x: 0,
		y: 0.26,
		lines: [
			{ text: 'DAD {dad}', size: 0.046 },
			{ text: 'CHART WEEK  {chart}', size: 0.044, write: [44.2, 44.55] }
		],
		marks: [
			{ line: 0, text: '{dad}', at: 44.7 },
			{ line: 1, text: '{chart}', at: 45.0, kind: 'circle' }
		]
	},
	// THE SONG — where the original put the date up again and ringed it
	{
		at: 45.3,
		out: 47.8,
		x: 0,
		y: -0.25,
		lines: [
			{ text: '{title}', size: 0.08 },
			{ text: '{artist}', size: 0.046, write: [45.8, 46.15] }
		],
		marks: [{ line: 0, at: 46.0, kind: 'circle', pad: 0.3 }]
	},

	// ── the end: the song and the date on the lit room, held to the fade ──
	{
		at: 55.3,
		out: 61.6,
		hold: true,
		x: 0,
		y: -0.05,
		lines: [
			{ text: '{title}', size: 0.072 },
			{ text: '{artist}', size: 0.044, write: [55.8, 56.3] },
			{ text: '{conception}', size: 0.04, write: [56.4, 56.8] }
		],
		marks: [{ line: 0, at: 56.3, kind: 'circle', pad: 0.3 }]
	}
];

// ── The news, a headline or two a year (CAPITALS; the lead's to edit) ───────
export const HEADLINES = {
	1950: ['KOREAN WAR BEGINS'],
	1951: ['COLOUR TELEVISION'],
	1952: ['FIRST HYDROGEN BOMB'],
	1953: ['DNA: THE DOUBLE HELIX', 'EVEREST CLIMBED'],
	1954: ['THE FOUR MINUTE MILE'],
	1955: ['DISNEYLAND OPENS'],
	1956: ['SUEZ CRISIS'],
	1957: ['SPUTNIK IN ORBIT'],
	1958: ['NASA FOUNDED'],
	1959: ['CASTRO TAKES CUBA'],
	1960: ['THE PILL APPROVED'],
	1961: ['GAGARIN IN SPACE', 'BERLIN WALL GOES UP'],
	1962: ['CUBAN MISSILE CRISIS'],
	1963: ['JFK SHOT IN DALLAS'],
	1964: ['BEATLEMANIA'],
	1965: ['US TROOPS INTO VIETNAM'],
	1966: ['ENGLAND WIN THE WORLD CUP'],
	1967: ['SUMMER OF LOVE'],
	1968: ['MLK ASSASSINATED', 'PARIS: MAY 68'],
	1969: ['MAN WALKS ON THE MOON'],
	1970: ['THE BEATLES SPLIT'],
	1971: ['THE MICROPROCESSOR'],
	1972: ['WATERGATE BREAK-IN'],
	1973: ['OIL CRISIS'],
	1974: ['NIXON RESIGNS'],
	1975: ['SAIGON FALLS'],
	1976: ['APPLE FOUNDED'],
	1977: ['STAR WARS OPENS'],
	1978: ['FIRST TEST TUBE BABY'],
	1979: ['THATCHER ELECTED', 'IRAN REVOLUTION'],
	1980: ['LENNON SHOT'],
	1981: ['THE IBM PC'],
	1982: ['FALKLANDS WAR'],
	1983: ['TCP/IP: THE INTERNET'],
	1984: ['THE MACINTOSH'],
	1985: ['LIVE AID'],
	1986: ['CHERNOBYL', 'CHALLENGER LOST'],
	1987: ['BLACK MONDAY'],
	1988: ['LOCKERBIE'],
	1989: ['BERLIN WALL FALLS', 'TIANANMEN SQUARE'],
	1990: ['MANDELA FREED'],
	1991: ['SOVIET UNION DISSOLVED', 'GULF WAR'],
	1992: ['LA RIOTS'],
	1993: ['THE WEB GOES PUBLIC'],
	1994: ['MANDELA ELECTED', 'RWANDA'],
	1995: ['WINDOWS 95'],
	1996: ['DOLLY THE SHEEP'],
	1997: ['DIANA DIES IN PARIS', 'HONG KONG HANDED BACK'],
	1998: ['GOOGLE FOUNDED'],
	1999: ['THE EURO LAUNCHED'],
	2000: ['Y2K: NOTHING HAPPENS'],
	2001: ['9/11'],
	2002: ['EURO NOTES AND COINS'],
	2003: ['IRAQ INVADED'],
	2004: ['FACEBOOK LAUNCHED', 'INDIAN OCEAN TSUNAMI'],
	2005: ['YOUTUBE LAUNCHED', 'HURRICANE KATRINA'],
	2006: ['PLUTO DEMOTED'],
	2007: ['THE IPHONE'],
	2008: ['LEHMAN COLLAPSES'],
	2009: ['OBAMA INAUGURATED'],
	2010: ['DEEPWATER HORIZON'],
	2011: ['ARAB SPRING', 'FUKUSHIMA'],
	2012: ['HIGGS BOSON FOUND'],
	2013: ['SNOWDEN LEAKS'],
	2014: ['CRIMEA ANNEXED'],
	2015: ['PARIS CLIMATE DEAL'],
	2016: ['BREXIT VOTE', 'TRUMP ELECTED'],
	2017: ['METOO'],
	2018: ['THAI CAVE RESCUE'],
	2019: ['NOTRE-DAME BURNS'],
	2020: ['PANDEMIC: LOCKDOWN'],
	2021: ['CAPITOL STORMED'],
	2022: ['RUSSIA INVADES UKRAINE'],
	2023: ['CHATGPT EVERYWHERE'],
	2024: ['PARIS OLYMPICS'],
	2025: ['POPE LEO XIV ELECTED'],
	2026: ['WORLD CUP IN AMERICA']
};

// ── The date's arithmetic, exact ─────────────────────────────────────────────
// 266 days (38 weeks) from conception to birth. Checked in a scratch script
// against Date for every day 1900–2099: the date and the weekday agree.
export const GESTATION = 266;
const LEAP = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
export const DAYS = (m, y) =>
	[31, LEAP(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
export const MON = [
	'JAN',
	'FEB',
	'MAR',
	'APR',
	'MAY',
	'JUN',
	'JUL',
	'AUG',
	'SEP',
	'OCT',
	'NOV',
	'DEC'
];
const WEEKDAY = ['SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const pad2 = (x) => String(x).padStart(2, '0');
export const fmt = ({ d, m, y }) => `${pad2(d)} · ${pad2(m)} · ${y}`;

// The birthday the calculator uses: the typed date, a month past 12 or a
// day past its month brought back into range (Enter takes any eight digits).
export function birthOf(digits) {
	const s = String(digits ?? '')
		.replace(/\D/g, '')
		.padEnd(8, '0')
		.slice(0, 8);
	const y = clamp(Number(s.slice(4, 8)), 100, 9999);
	const m = clamp(Number(s.slice(2, 4)), 1, 12);
	const d = clamp(Number(s.slice(0, 2)), 1, DAYS(m, y));
	return { d, m, y };
}
// Back 266 days, a month at a time: the birth month's own d days take it to
// the last day of the month before; then each whole month's length while
// what is left is at least that; the last month's length less what is left
// is the day.
export function conceive({ d, m, y }, days = GESTATION) {
	const rows = [];
	let rem = days - d;
	rows.push({ m, y, take: d, rem });
	let [mm, yy] = m === 1 ? [12, y - 1] : [m - 1, y];
	while (rem >= DAYS(mm, yy)) {
		const L = DAYS(mm, yy);
		rem -= L;
		rows.push({ m: mm, y: yy, take: L, rem });
		[mm, yy] = mm === 1 ? [12, yy - 1] : [mm - 1, yy];
	}
	const len = DAYS(mm, yy);
	return { rows, last: { m: mm, y: yy, len, rem }, date: { d: len - rem, m: mm, y: yy } };
}
// Zeller's congruence (Gregorian): h = (q + ⌊13(m+1)/5⌋ + K + ⌊K/4⌋ + ⌊J/4⌋
// + 5J) mod 7, January and February counted as months 13 and 14 of the year
// before; K the year of the century, J the century; h = 0 is Saturday.
export function zeller({ d, m, y }) {
	const mm = m < 3 ? m + 12 : m;
	const yy = m < 3 ? y - 1 : y;
	const K = yy % 100;
	const J = Math.floor(yy / 100);
	const terms = [
		d,
		Math.floor((13 * (mm + 1)) / 5),
		K,
		Math.floor(K / 4),
		Math.floor(J / 4),
		5 * J
	];
	const sum = terms.reduce((s, x) => s + x, 0);
	const h = ((sum % 7) + 7) % 7;
	return { q: d, mm, yy, K, J, terms, sum, h, day: WEEKDAY[h] };
}

// ── Number theory, as the machine would do it ────────────────────────────────
const isPrime = (n) => {
	if (n < 2) return false;
	for (let k = 2; k * k <= n; k++) if (n % k === 0) return false;
	return true;
};
const nextPrime = (n) => {
	let p = Math.max(2, n);
	while (!isPrime(p)) p++;
	return p;
};
const mod = (a, p) => ((a % p) + p) % p;
function modpow(b, e, p) {
	let r = 1;
	b = mod(b, p);
	while (e > 0) {
		if (e & 1) r = (r * b) % p;
		b = (b * b) % p;
		e >>= 1;
	}
	return r;
}
// a⁻¹ mod p (p prime), by Fermat
const modinv = (a, p) => modpow(a, p - 2, p);
// The Legendre symbol (a | p): 1 a square mod p, −1 not, 0 if p divides a.
const legendre = (a, p) => {
	const l = modpow(a, (p - 1) / 2, p);
	return l === p - 1 ? -1 : l;
};
// y² = x³ + ax + b over F_p: a point P on it (the first x at or past x0 with
// a square right-hand side; its y the smaller root) and 2P.
function curve(a, b, p, x0) {
	while (mod(4 * a * a * a + 27 * b * b, p) === 0) b++; // never singular
	const f = (x) => mod(x * x * x + a * x + b, p);
	let x = mod(x0, p);
	for (let i = 0; i < p; i++, x = (x + 1) % p) if (legendre(f(x), p) >= 0) break;
	let y = 0;
	while ((y * y) % p !== f(x)) y++;
	let P2 = null;
	if (y !== 0) {
		const lam = mod((3 * x * x + a) * modinv(2 * y, p), p);
		const x3 = mod(lam * lam - 2 * x, p);
		const y3 = mod(lam * (x - x3) - y, p);
		P2 = [x3, y3];
	}
	return { a, b, P: [x, y], P2: P2 ?? [x, mod(-y, p)] };
}
// Lagrange–Gauss reduction of a two-dimensional lattice basis.
function reduce2(u, v) {
	const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
	let a = u.slice();
	let b = v.slice();
	if (dot(a, a) > dot(b, b)) [a, b] = [b, a];
	for (let i = 0; i < 64; i++) {
		const m = Math.round(dot(a, b) / Math.max(1, dot(a, a)));
		if (m === 0) break;
		b = [b[0] - m * a[0], b[1] - m * a[1]];
		if (dot(b, b) < dot(a, a)) [a, b] = [b, a];
		else break;
	}
	return [a, b];
}
// The continued fraction of n / d, its first `k` terms.
function contfrac(n, d, k = 6) {
	const out = [];
	for (let i = 0; i < k && d > 0; i++) {
		const q = Math.floor(n / d);
		out.push(q);
		[n, d] = [d, n - q * d];
	}
	return out;
}
const neg = (n) => String(n).replace('-', '−'); // the font has the minus, not the hyphen
const vec = ([x, y]) => `(${neg(x)}, ${neg(y)})`;

// The curve's points, counted the slow way: 1 + Σ (1 + (f(x) | p)) + the
// point at infinity (Hasse: within 2√p of p + 1).
function countPoints(a, b, p) {
	let n = 1;
	for (let x = 0; x < p; x++) n += 1 + legendre((((x * x * x + a * x + b) % p) + p) % p, p);
	return n;
}
// ── The almanac ──────────────────────────────────────────────────────────────
// The Julian day number of a Gregorian date (at noon).
function julian({ d, m, y }) {
	const a = Math.floor((14 - m) / 12);
	const yy = y + 4800 - a;
	const mm = m + 12 * a - 3;
	return (
		d +
		Math.floor((153 * mm + 2) / 5) +
		365 * yy +
		Math.floor(yy / 4) -
		Math.floor(yy / 100) +
		Math.floor(yy / 400) -
		32045
	);
}
const PHASES = [
	'NEW',
	'WAXING CRESCENT',
	'FIRST QUARTER',
	'WAXING GIBBOUS',
	'FULL',
	'WANING GIBBOUS',
	'LAST QUARTER',
	'WANING CRESCENT'
];
// The moon's phase from its age: a new moon at JD 2451550.1, a synodic
// month of 29.530588853 days.
function moonOf(jd) {
	const age = (((jd - 2451550.1) % 29.530588853) + 29.530588853) % 29.530588853;
	return PHASES[Math.floor((age / 29.530588853) * 8 + 0.5) % 8];
}
const SIGNS = [
	[1, 20, 'AQUARIUS'],
	[2, 19, 'PISCES'],
	[3, 21, 'ARIES'],
	[4, 20, 'TAURUS'],
	[5, 21, 'GEMINI'],
	[6, 21, 'CANCER'],
	[7, 23, 'LEO'],
	[8, 23, 'VIRGO'],
	[9, 23, 'LIBRA'],
	[10, 23, 'SCORPIO'],
	[11, 22, 'SAGITTARIUS'],
	[12, 22, 'CAPRICORN']
];
const sunOf = ({ d, m }) => {
	const i = SIGNS.findIndex(([mm, dd]) => m < mm || (m === mm && d < dd));
	return i < 0 ? 'CAPRICORN' : i === 0 ? 'CAPRICORN' : SIGNS[i - 1][2];
};
const ANIMALS = [
	'RAT',
	'OX',
	'TIGER',
	'RABBIT',
	'DRAGON',
	'SNAKE',
	'HORSE',
	'GOAT',
	'MONKEY',
	'ROOSTER',
	'DOG',
	'PIG'
];
const animalOf = (y) => ANIMALS[(((y - 4) % 12) + 12) % 12];
// The solar cycle a year falls in: the minima that open each, cycle 1 at 1755.
const MINIMA = [
	1755.2, 1766.5, 1775.5, 1784.7, 1798.3, 1810.6, 1823.3, 1833.9, 1843.5, 1855.9, 1867.2, 1878.9,
	1889.6, 1901.7, 1913.6, 1923.6, 1933.8, 1944.2, 1954.3, 1964.8, 1976.5, 1986.8, 1996.4, 2008.9,
	2019.9
];
const cycleOf = ({ d, m, y }) => MINIMA.filter((x) => x <= y + (m - 1 + d / 31) / 12).length;
const dayOfYear = ({ d, m, y }) => {
	let n = d;
	for (let k = 1; k < m; k++) n += DAYS(k, y);
	return n;
};

// That day, made up: what mum wore and what dad had done, picked by the
// Julian day (the lead's lists to edit; CAPITALS, the font's).
const MUM = [
	'A DENIM JACKET',
	'SHOULDER PADS',
	'THE PAISLEY DRESS',
	'LEG WARMERS',
	'A LEATHER SKIRT',
	'HIS SHIRT',
	'THE GOOD EARRINGS',
	'A PERM',
	'NOTHING SPECIAL',
	'THE RED ONE'
];
const DAD = [
	'HAD SHAVED',
	'HAD NOT SHAVED',
	'HAD DONE THE DISHES',
	'HAD PUT A RECORD ON',
	'HAD BEEN TO THE PUB',
	'HAD LIT A CANDLE',
	'HAD TAKEN THE BINS OUT',
	'HAD SAID SORRY',
	'HAD WORN THE AFTERSHAVE',
	'HAD COOKED'
];

// Every token the copy can use, from the answers' eight digits — and `extra`
// (the song's, from the sketch), laid over them.
export function fieldsOf(digits, extra = {}) {
	const b = birthOf(digits);
	const c = conceive(b);
	const z = zeller(c.date);
	const p = nextPrime(b.y);
	const ec = curve(b.d, b.m, p, b.d);
	const ddmm = b.d * 100 + b.m;
	const yy = b.y % 100;
	const cc = Math.floor(b.y / 100);
	const [r1, r2] = reduce2([b.d, b.m], [yy, cc]);
	const cf = contfrac(b.y, ddmm);
	const jd = julian(c.date);
	const doy = dayOfYear(c.date);
	return {
		...extra,
		birth: fmt(b),
		dd: pad2(b.d),
		mm: pad2(b.m),
		yyyy: String(b.y),
		yy: pad2(yy),
		conception: fmt(c.date),
		cdd: pad2(c.date.d),
		cmm: pad2(c.date.m),
		cyyyy: String(c.date.y),
		weekday: z.day,
		zq: z.terms[0],
		zt: z.terms[1],
		zK: z.terms[2],
		zK4: z.terms[3],
		zJ4: z.terms[4],
		z5J: z.terms[5],
		zsum: z.sum,
		zh: z.h,
		p,
		ecA: ec.a,
		ecB: ec.b,
		ecPx: ec.P[0],
		ecPy: ec.P[1],
		ec2x: ec.P2[0],
		ec2y: ec.P2[1],
		np: countPoints(ec.a, ec.b, p),
		inv: modinv(b.d, p),
		ddmm,
		leg: legendre(ddmm, p) < 0 ? '−1' : String(legendre(ddmm, p)),
		b1: vec([b.d, b.m]),
		b2: vec([yy, cc]),
		r1: vec(r1),
		r2: vec(r2),
		cf: `[${cf[0]}; ${cf.slice(1).join(', ')}]`,
		jd,
		doy,
		week: Math.ceil(doy / 7),
		moon: moonOf(jd),
		sun: sunOf(c.date),
		animal: animalOf(c.date.y),
		cycle: cycleOf(c.date),
		news: HEADLINES[c.date.y]?.[0] ?? '',
		mum: MUM[jd % MUM.length],
		dad: DAD[Math.floor(jd / 7) % DAD.length],
		// the structures the streams are built from
		_birth: b,
		_conceived: c,
		_zeller: z
	};
}

// `{token}`s filled in (an unknown token is left as it is).
export const fill = (text, F) =>
	String(text).replace(/\{(\w+)\}/g, (s, k) => (F[k] === undefined ? s : String(F[k])));
