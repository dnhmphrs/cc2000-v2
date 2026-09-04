export function getDeviceType() {
	const ua = navigator.userAgent;
	if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
	if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/.test(ua))
		return 'mobile';
	return 'desktop';
}

export function getScreenSize() {
	return { width: window.innerWidth, height: window.innerHeight };
}

export function getIsPortrait() {
	return window.innerHeight > window.innerWidth;
}

export function conceptionDate(dateStr) {
	const d = new Date(dateStr);
	d.setDate(d.getDate() - 268);
	return d.toISOString().slice(0, 10);
}

export function previousDay(dateStr) {
	const d = new Date(dateStr);
	d.setDate(d.getDate() - 1);
	return d.toISOString().slice(0, 10);
}

export function dateToDecade(dateStr) {
	const year = new Date(dateStr).getFullYear();
	if (year < 1965) return '50s';
	if (year < 1975) return '60s';
	if (year < 2005) return '90s';
	return '10s';
}

export function lerp(a, b, t) {
	return a + (b - a) * t;
}

export function clamp(v, min, max) {
	return Math.max(min, Math.min(max, v));
}

export function easeInOutCubic(t) {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const MONTHS = [
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december'
];

// '1990-10-14' → '14 october 1990'. Parsed as UTC so the day never slips a
// timezone either side of midnight.
export function formatDay(dateStr) {
	const d = new Date(`${dateStr}T00:00:00Z`);
	return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
