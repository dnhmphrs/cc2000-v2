<script>
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { scene, gate } from '$lib/store/store';
	import { recover } from '$lib/scenes/director';

	// ── The verdict screens ──────────────────────────────────────────────────
	// Three of them, each with its gif and the machine's own line: too old for
	// the archive, too young for it, and the page that does not exist. The two
	// verdicts are the end of a run — the tunnel broke down on the way to a
	// room that was never there (world/kaleido.js) — and "calculate again"
	// hands the run back to the flight (director.recover()). 404 and 500 are
	// the route's error page (routes/+error.svelte) and go home.
	export let status = 500;
	export let message = '';
	export let verdict = null; // 'past' | 'future' | null

	const VERDICT = {
		past: {
			gif: '/gifs/the-past.gif',
			line: 'you were born in the time of dinosaurs. there was no music.',
			detail: 'the archive starts in 1958. your moment predates the broadcast record.'
		},
		future: {
			gif: '/gifs/the-future.gif',
			line:
				'you were born in the After Time. those lucky enough to be born were ' +
				'conceived to "Baby" by Justin Bieber, as it is the only remaining ' +
				'music allowed by The Council.',
			detail: 'that date has not happened yet. no signal has been transmitted for it.'
		}
	};
	$: v = verdict ? VERDICT[verdict] : null;

	function goHome() {
		scene.set('approach');
		gate.set('prelude');
		goto(resolve('/'), { replaceState: true });
	}
</script>

<div class="error-screen" in:fade={{ duration: 400 }}>
	<div class="col">
		{#if v}
			<img src={v.gif} alt="" />
			<p class="msg verdict">{v.line}</p>
			<p class="detail">{v.detail}</p>
			<button class="go" on:click={recover}>calculate again</button>
		{:else}
			<img src={status === 404 ? '/gifs/404.gif' : '/gifs/500.gif'} alt="" />
			{#if status === 404}
				<p class="msg">you shouldn't be here. run.</p>
			{:else}
				<p class="msg">
					our servers overheated. the algorithm found your moment of conception too hot for
					calculation. your parents FUCK.
				</p>
				{#if message}<p class="detail">{message}</p>{/if}
			{/if}
			<button class="go" on:click={goHome}>calculate again</button>
		{/if}
	</div>
</div>

<style>
	.error-screen {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg);
		z-index: 100;
		padding: 2rem;
		pointer-events: auto;
	}
	.col {
		width: 100%;
		max-width: 380px;
	}
	img {
		display: block;
		width: 100%;
		height: 170px;
		object-fit: cover;
		margin-bottom: 18px;
	}
	.msg {
		font-size: 16px;
		line-height: 1.5;
		color: var(--ink);
		margin: 0 0 10px;
	}
	.detail {
		font-size: 12px;
		color: var(--ink-dim);
		margin: 0 0 18px;
	}
	button {
		margin-top: 12px;
	}
</style>
