// ── Domain helpers ───────────────────────────────────────────────────────────
// Dates, and the site's one piece of pseudo-science. Easing and interpolation
// live in config/ease.js; screen shape lives in config/space.js.

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
