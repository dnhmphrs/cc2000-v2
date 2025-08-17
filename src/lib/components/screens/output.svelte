<script>
	import { page, track } from '$lib/store/store';

	let uri = $track.spotify_uri.substring(14);
	console.log(uri);
	let src = `https://open.spotify.com/embed/track/${uri}?utm_source=generator`;

	let handleProgress = () => {
		// page.set(1);#
		window.location.reload();
	};
</script>

<div class="output-container">
	<div class="result-header">
		<h2 class="result-title">🎵 CONCEPTION SONG FOUND! 🎵</h2>
		<!-- <div class="loading-dots">
			<span class="dot">.</span>
			<span class="dot">.</span>
			<span class="dot">.</span>
		</div> -->
	</div>

	<div class="iframe-container">
		<!-- svelte-ignore a11y-missing-attribute -->
		<iframe
			{src}
			frameBorder="0"
			allowfullscreen=""
			allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
			loading="lazy"
			height="200px"
		/>
	</div>

	<button class="restart-btn" on:click={() => handleProgress()} on:keydown={() => handleProgress()}>
		<span class="btn-text">[RESTART]</span>
	</button>
</div>

<style>
	.output-container {
		position: relative;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background: none;
		color: var(--black);
		padding: 0rem;
		gap: 2rem;
	}

	.result-header {
		text-align: center;
		margin-bottom: 0rem;
	}

	.result-title {
		color: #2d5aa0;
		font-family: 'Courier New', monospace;
		font-size: 14px;
		font-weight: normal;
		letter-spacing: 1px;
		margin-bottom: 0rem;
		text-shadow: 1px 1px 0px #e6f3ff;
		animation: pulse 2s infinite;
	}

	.loading-dots {
		display: flex;
		justify-content: center;
		gap: 4px;
	}

	.dot {
		color: #2d5aa0;
		font-size: 24px;
		font-weight: bold;
		animation: bounce 1.5s infinite;
	}

	.dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	.iframe-container {
		height: 154px;
		border: 3px outset #ffffff;
		border-right-color: #4a90e2;
		border-bottom-color: #4a90e2;
		padding: 8px;
		background: linear-gradient(135deg, #e6f3ff 0%, #cce7ff 100%);
	}

	iframe {
		width: 100%;
		border-radius: 0;
		display: block;
	}

	.restart-btn {
		background: linear-gradient(135deg, #e6f3ff 0%, #cce7ff 100%);
		border: 1px outset #ffffff;
		border-right-color: #4a90e2;
		border-bottom-color: #4a90e2;
		color: #2d5aa0;
		padding: 10px 18px;
		font-family: 'Courier New', monospace;
		font-size: 11px;
		font-weight: normal;
		cursor: pointer;
		transition: all 0.1s ease;
		text-transform: uppercase;
		letter-spacing: 1px;
		text-align: center;
		border-radius: 3px;
		box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
	}

	.restart-btn:hover {
		background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
		border: 1px inset #ffffff;
		border-right-color: #4a90e2;
		border-bottom-color: #4a90e2;
		transform: translateY(-2px);
		box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.15);
	}

	.restart-btn:active {
		background: linear-gradient(135deg, #cce7ff 0%, #b3dbff 100%);
		border: 1px inset #4a90e2;
		border-right-color: #ffffff;
		border-bottom-color: #ffffff;
		transform: translateY(0);
		box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
	}

	.btn-text {
		display: block;
	}

	@keyframes pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.05); }
	}

	@keyframes bounce {
		0%, 60%, 100% { transform: translateY(0); }
		30% { transform: translateY(-10px); }
	}
</style>
