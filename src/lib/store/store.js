import { writable } from 'svelte/store';

export const userType = writable(null);
export const screenType = writable(null);
export const isIframe = writable(true);

export const mousePosition = writable({ x: 0, y: 0, z: 0 });
export const screenSize = writable({ width: 0, height: 0 });

export const spicy = writable(5);
export const date = writable('2000-01-01');
export const page = writable(1);

export const track = writable(null);
