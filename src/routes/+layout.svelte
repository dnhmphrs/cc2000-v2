<script>
	import './styles.css';
	import { version } from '$app/environment';

	// The frame round every page: the stylesheet, the faces, and the corner's
	// label. The label is the build — package.json's version and the commit it
	// was built from (vite.config.js) — so one deploy can be told from the one
	// before at a glance. It is the only thing in the corner: no links out.
</script>

<svelte:head>
	<title>Conception Calculator 2000</title>
	<meta
		name="description"
		content="Calculate the song playing at your exact moment of conception."
	/>
	<!-- The faces, at the head of the queue. They are declared font-display:block
	     (styles.css) so nothing paints in a stand-in and re-flows when the real
	     one lands, which means the block period has to be over before the first
	     paint wants them, and a preload is what makes that true. Same origin,
	     but a font fetch is anonymous whatever its origin, so crossorigin is
	     required or the browser fetches the file twice and the preload buys
	     nothing. -->
	<link
		rel="preload"
		href="/fonts/NB-Architekt-Pro-Light.woff"
		as="font"
		type="font/woff"
		crossorigin="anonymous"
	/>
	<link
		rel="preload"
		href="/fonts/NB-Architekt-Pro-Regular.woff"
		as="font"
		type="font/woff"
		crossorigin="anonymous"
	/>
	<link
		rel="preload"
		href="/fonts/NB-Architekt-Pro-Bold.woff"
		as="font"
		type="font/woff"
		crossorigin="anonymous"
	/>
</svelte:head>

<slot />
<span class="build" aria-hidden="true">{version}</span>

<style>
	.build {
		position: fixed;
		top: 8px;
		left: 10px;
		z-index: 35; /* over the board (11) and the output (30) */
		font-family: var(--tech);
		font-size: 10px;
		letter-spacing: 0.14em;
		color: var(--yellow);
		opacity: 0.35;
		user-select: none;
		pointer-events: none;
		white-space: nowrap;
	}
</style>
