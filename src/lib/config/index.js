// One import for the whole config layer:
//
//     import { SCENES, span, TUNNEL, MACHINE } from '$lib/config';
//
// The four files behind it split by what you are tuning, not by who uses them:
//
//   timing.js   when things happen        (scene durations + fraction windows)
//   ease.js     the shapes they happen in (span, easings)
//   space.js    3D distances and cameras
//   layout.js   screen-space sizes        (monitor glass, chassis)
//   palette.js  colour
//   dev.js      the dev harness switch (off in production)
export * from './timing';
export * from './ease';
export * from './space';
export * from './layout';
export * from './palette';
export * from './dev';
