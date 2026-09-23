// ── Variants ─────────────────────────────────────────────────────────────────
// Cuts of the run to compare on ONE build, picked from the URL, so a creative
// note can be answered with a link rather than a rebuild. Each is read once at
// module load, as ?speed and ?seed are, and every window a variant changes is
// still a pure function of progress — ?at= pins any of them.
//
//   ?flight=empty|few      nothing flies by in space | a few dead sets after
//                          the first answer, and nothing else
//   ?on=crt|fade           the set's glass switches on with a CRT hairline
//                          that opens onto the tunnel | simply lights
//   ?beat=rest|flow|black  what happens between the search and the fall:
//                          the search STOPS on the found room and the fall
//                          drops from rest | it hands over at one pace, as it
//                          did | the picture switches OFF through black and
//                          the found room switches back on
//   ?rest=short|mid|long   how long the stop holds
//   ?cap=located|date|none what the machine types as it stops
//
// The defaults are the cut being proposed.
const q = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search);
const pick = (key, allowed, fallback) => {
	const v = q?.get(key);
	return allowed.includes(v) ? v : fallback;
};

export const VARIANT = {
	flight: pick('flight', ['empty', 'few'], 'empty'),
	on: pick('on', ['crt', 'fade'], 'crt'),
	beat: pick('beat', ['rest', 'flow', 'black'], 'rest'),
	rest: pick('rest', ['short', 'mid', 'long'], 'mid'),
	cap: pick('cap', ['located', 'date', 'none'], 'located')
};
