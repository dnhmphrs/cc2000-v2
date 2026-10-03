<script>
	import { resolve } from '$app/paths';
	import { BOARD, REELS, EARLIER, RUNS } from '$lib/data/experiments';

	// ── /log — every experiment, indexed ─────────────────────────────────────
	// The list is data/experiments.js, which the small bar on the lab and the
	// reels (components/LabBar.svelte) reads too. First the blackboard rebuild
	// (docs/explore-03.md, -04, -05) in the run's order, every variant a link
	// into the lab (a pure function of its progress, so ?at= pins any frame);
	// then the reels; then the rounds before the board and the site's runs.
	// Nothing here is the run.
	const lab = (sketch, v) => `${resolve('/lab')}?sketch=${sketch}${v ? `&v=${v}` : ''}`;
	const href = (h) => {
		const [path, q] = h.split('?');
		return `${resolve(path)}${q ? `?${q}` : ''}`;
	};
	const latest = Math.max(...BOARD.map((b) => b.round));
</script>

<svelte:head>
	<title>The log of everything · every experiment</title>
</svelte:head>

<div class="board">
	<header>
		<h1>The log of everything</h1>
		<p>
			The next rebuild as maths on a blackboard: the complex logarithm turns scaling into sliding,
			so a zoom is a flight down a tunnel, a golden spiral is a swimmer, and the rooms are a loop
			round a torus. Every beat of the run, a few ways each, in the run’s order — then the reels,
			and every experiment before the board. The small bar in the corner of any of them steps
			through the lot.
		</p>
	</header>

	<ol class="beats">
		{#each BOARD as beat, i (beat.sketch)}
			<li>
				<h2>
					<span class="n">{i + 1}</span>{beat.name}{#if beat.round === latest}<span class="new"
							>new</span
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

	<section>
		<h2>The reels</h2>
		<p class="what">
			One variant of each, end to end, hard cuts between; ?at= pins the reel as a whole.
		</p>
		<ul>
			{#each REELS as [h, name, line] (h)}
				<li>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={href(h)} data-sveltekit-reload>{name}</a>
					<span>{line}</span>
				</li>
			{/each}
		</ul>
	</section>

	<section class="earlier">
		<h2>Before the board</h2>
		{#each EARLIER as group (group.name)}
			<h3>
				{group.name}{#if group.doc}<span class="doc">{group.doc}</span>{/if}
			</h3>
			<ul>
				{#each group.sketches as [s, line] (s)}
					<li>
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
						<a href={lab(s)} data-sveltekit-reload>{s}</a>
						<span>{line}</span>
					</li>
				{/each}
			</ul>
		{/each}
		<h3>The runs</h3>
		<ul>
			{#each RUNS as [h, name, line] (h)}
				<li>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={href(h)} data-sveltekit-reload>{name}</a>
					<span>{line}</span>
				</li>
			{/each}
		</ul>
	</section>
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
		padding: 64px max(16px, 6vw) 120px;
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
		margin: 0;
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
	.beats {
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
	h3 {
		font-weight: 400;
		font-style: italic;
		font-size: 19px;
		margin: 1.6em 0 0.3em;
		opacity: 0.9;
	}
	.doc {
		font-family: ui-monospace, monospace;
		font-style: normal;
		font-size: 12px;
		opacity: 0.5;
		margin-left: 0.9em;
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
	section {
		margin-top: 4rem;
		max-width: 46rem;
		padding-top: 2rem;
		border-top: 1px solid rgba(236, 230, 218, 0.12);
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	ul li {
		margin: 0.35em 0;
		line-height: 1.4;
	}
	ul a {
		font-family: ui-monospace, monospace;
		font-size: 14px;
		margin-right: 0.6em;
	}
	ul span {
		opacity: 0.65;
	}
</style>
