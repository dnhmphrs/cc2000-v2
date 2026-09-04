<script>
	import { track, phase, sceneState, decade, edge } from '$lib/store/store';
	import { fade } from 'svelte/transition';

	// Beat 4: the landing. Either the resolved track, or the two out-of-range
	// verdicts — which used to navigate to /the-past and /the-future, routes this
	// build does not have, so they dumped the user on the 404 screen.
	$: uri = $track?.spotify_uri?.substring(14) ?? '';
	$: src = uri ? `https://open.spotify.com/embed/track/${uri}?utm_source=generator` : '';

	const EDGE = {
		past: {
			title: 'out of range — past',
			gif: '/gifs/the-past.gif',
			msg: 'the archive starts in 1958. your moment predates the broadcast record.'
		},
		future: {
			title: 'out of range — future',
			gif: '/gifs/the-future.gif',
			msg: 'that date has not happened yet. no signal has been transmitted for it.'
		}
	};

	function restart() {
		edge.set(null);
		sceneState.set(0);
		phase.set('boot');
	}
</script>

{#if $edge}
	<div class="shell" in:fade={{ duration: 400 }}>
		<div class="frame">
			<div class="frame-head">
				<span class="id">CC://2000</span>
				<span class="title">{EDGE[$edge].title}</span>
				<span class="stat"><i class="led warn" />no match</span>
			</div>
			<div class="frame-tape" />
			<div class="frame-body">
				<div class="plate"><img src={EDGE[$edge].gif} alt={EDGE[$edge].title} /></div>
				<p class="verdict"><span class="sig">&gt;</span> {EDGE[$edge].msg}</p>
				<button on:click={restart}>run again</button>
			</div>
			<div class="frame-foot">
				<span>status · aborted</span>
				<span>rec · 0</span>
				<span>sec//open</span>
			</div>
		</div>
	</div>
{:else if src}
	<div class="shell" in:fade={{ duration: 500, delay: 200 }}>
		<div class="frame">
			<div class="frame-head">
				<span class="id">CC://2000</span>
				<span class="title">match found</span>
				<span class="stat"><i class="led good" />{$decade ?? 'locked'}</span>
			</div>
			<div class="frame-tape" />
			<div class="frame-body">
				<p class="verdict"><span class="sig">&gt;</span> conception track resolved.</p>
				<div class="embed">
					<span class="tick tl" />
					<span class="tick tr" />
					<span class="tick bl" />
					<span class="tick br" />
					<iframe
						{src}
						frameBorder="0"
						allowfullscreen
						allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
						loading="lazy"
						title="Conception song"
					/>
				</div>
				<button on:click={restart}>run again</button>
			</div>
			<div class="frame-foot">
				<span>status · resolved</span>
				<span>rec · 1 of 11,486,203</span>
				<span>sec//open</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.shell {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1.5rem;
		pointer-events: none;
	}

	.frame {
		width: 100%;
		max-width: 380px;
		pointer-events: auto;
	}

	.frame-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.2rem;
	}

	.verdict {
		align-self: flex-start;
		font-family: var(--mono);
		font-size: 11px;
		color: var(--fg-dim);
		line-height: 1.65;
		margin: 0;
	}
	.verdict .sig {
		color: var(--fg);
		margin-right: 6px;
	}

	/* Bezel around the embed: hairline box with inset corner ticks. */
	.embed {
		position: relative;
		border: 1px solid var(--fg-ghost);
		padding: 6px;
		background: rgba(0, 0, 0, 0.4);
		width: 100%;
	}

	.tick {
		position: absolute;
		width: 6px;
		height: 6px;
		border-color: var(--fg-faint);
		border-style: solid;
		border-width: 0;
	}
	.tick.tl {
		top: -1px;
		left: -1px;
		border-top-width: 1px;
		border-left-width: 1px;
	}
	.tick.tr {
		top: -1px;
		right: -1px;
		border-top-width: 1px;
		border-right-width: 1px;
	}
	.tick.bl {
		bottom: -1px;
		left: -1px;
		border-bottom-width: 1px;
		border-left-width: 1px;
	}
	.tick.br {
		bottom: -1px;
		right: -1px;
		border-bottom-width: 1px;
		border-right-width: 1px;
	}

	iframe {
		width: 100%;
		height: 152px;
		border: none;
		display: block;
	}

	.plate {
		width: 100%;
		border: 1px solid var(--fg-ghost);
		background: #000;
		overflow: hidden;
	}
	.plate img {
		display: block;
		width: 100%;
		height: 150px;
		object-fit: cover;
		filter: grayscale(1) contrast(1.05);
		opacity: 0.85;
	}
</style>
