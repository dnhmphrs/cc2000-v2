<script>
	import { page, track } from '$lib/store/store';
	import { onMount } from 'svelte';

	let uri = '';
	let src = '';
	let accuracy = 0;
	let decade = '';
	let isLoaded = false;

	onMount(() => {
		if ($track && $track.spotify_uri) {
			uri = $track.spotify_uri.substring(14);
			src = `https://open.spotify.com/embed/track/${uri}?utm_source=generator&theme=0`;
			
			// Calculate accuracy (mock calculation)
			accuracy = (Math.random() * 14.999 + 85).toFixed(3);
			
			// Get decade from track date
			const trackDate = new Date($track.chart_date);
			decade = Math.floor(trackDate.getFullYear() / 10) * 10;
			
			// Show results after brief delay
			setTimeout(() => {
				isLoaded = true;
			}, 500);
		}
	});

	let handleRestart = () => {
		window.location.reload();
	};

	let handleShare = (platform) => {
		const shareText = `I was conceived to "${$track.song}" by ${$track.artist} in the ${decade}s! Find out your conception song at ConceptionCalculator2000.com`;
		
		switch(platform) {
			case 'twitter':
				window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`);
				break;
			case 'instagram':
				// Copy to clipboard for Instagram
				navigator.clipboard.writeText(shareText);
				alert('Copied to clipboard! Paste in your Instagram story.');
				break;
			case 'email':
				window.open(`mailto:?subject=Conception Calculator 2000 Results&body=${encodeURIComponent(shareText)}`);
				break;
		}
	};
</script>

<section class="output-screen" class:loaded={isLoaded}>
	<div class="results-container">
		<div class="results-header">
			<h2>CONCEPTION ANALYSIS COMPLETE</h2>
			<div class="accuracy-badge">
				<span class="accuracy-value">{accuracy}%</span>
				<span class="accuracy-label">STATISTICAL ACCURACY</span>
			</div>
		</div>

		{#if $track}
			<div class="track-info">
				<h3>You were conceived to...</h3>
				<div class="track-details">
					<div class="track-title">"{$track.song}"</div>
					<div class="track-artist">by {$track.artist}</div>
					<div class="track-date">Chart Date: {new Date($track.chart_date).toLocaleDateString()}</div>
				</div>
			</div>

			<div class="spotify-container">
				<iframe
					style="border-radius:12px"
					{src}
					width="100%"
					height="352"
					frameBorder="0"
					allowfullscreen=""
					allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
					loading="lazy"
					title="Spotify player"
				/>
			</div>

			<div class="decade-info">
				<div class="decade-badge">
					<span class="decade-number">{decade}s</span>
					<span class="decade-label">CONCEPTION ERA</span>
				</div>
			</div>
		{/if}

		<div class="actions">
			<div class="share-actions">
				<h4>Share Your Results</h4>
				<div class="share-buttons">
					<button class="share-btn twitter" on:click={() => handleShare('twitter')}>
						<span>𝕏</span>
					</button>
					<button class="share-btn instagram" on:click={() => handleShare('instagram')}>
						<span>📷</span>
					</button>
					<button class="share-btn email" on:click={() => handleShare('email')}>
						<span>📧</span>
					</button>
				</div>
			</div>

			<button class="restart-btn" on:click={handleRestart}>
				<span>🔄</span>
				<span>Calculate Another</span>
			</button>
		</div>
	</div>

	<div class="room-completion">
		<div class="completion-indicator">
			<div class="room-icon">🏠</div>
			<span>Room construction: COMPLETE</span>
		</div>
	</div>
</section>

<style>
	.output-screen {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background: rgba(0, 0, 0, 0.85);
		border: 2px solid var(--white);
		border-radius: 8px;
		backdrop-filter: blur(10px);
		overflow-y: auto;
		
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.8s ease;
	}

	.output-screen.loaded {
		opacity: 1;
		transform: translateY(0);
	}

	.results-container {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		flex: 1;
	}

	.results-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		text-align: center;
	}

	.results-header h2 {
		color: var(--white);
		font-size: 1.1rem;
		margin: 0;
		letter-spacing: 0.1em;
	}

	.accuracy-badge {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5rem 1rem;
		background: rgba(0, 255, 0, 0.1);
		border: 1px solid #00ff00;
		border-radius: 4px;
	}

	.accuracy-value {
		font-size: 1.5rem;
		font-weight: 600;
		color: #00ff00;
		text-shadow: 0 0 10px #00ff00;
	}

	.accuracy-label {
		font-size: 0.7rem;
		color: var(--white-50);
		letter-spacing: 0.1em;
	}

	.track-info {
		text-align: center;
	}

	.track-info h3 {
		color: var(--white);
		margin: 0 0 1rem 0;
		font-size: 1rem;
		font-weight: 300;
	}

	.track-details {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.track-title {
		font-size: 1.3rem;
		font-weight: 600;
		color: var(--white);
		text-shadow: 0 0 10px var(--blue);
	}

	.track-artist {
		font-size: 1rem;
		color: var(--white-50);
		font-style: italic;
	}

	.track-date {
		font-size: 0.8rem;
		color: var(--white-50);
	}

	.spotify-container {
		margin: 1rem 0;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.decade-info {
		display: flex;
		justify-content: center;
		margin: 1rem 0;
	}

	.decade-badge {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
		background: rgba(208, 208, 208, 0.1);
		border: 1px solid var(--white-50);
		border-radius: 8px;
	}

	.decade-number {
		font-size: 2rem;
		font-weight: 600;
		color: var(--white);
		text-shadow: 0 0 15px var(--pink);
	}

	.decade-label {
		font-size: 0.7rem;
		color: var(--white-50);
		letter-spacing: 0.1em;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-top: auto;
		padding-top: 1rem;
		border-top: 1px solid var(--white-50);
	}

	.share-actions {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}

	.share-actions h4 {
		color: var(--white);
		margin: 0;
		font-size: 0.9rem;
		letter-spacing: 0.05em;
	}

	.share-buttons {
		display: flex;
		gap: 1rem;
	}

	.share-btn {
		width: 50px;
		height: 50px;
		border: 2px solid var(--white-50);
		background: rgba(255, 255, 255, 0.1);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s ease;
		font-size: 1.2rem;
	}

	.share-btn:hover {
		transform: scale(1.1);
		box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
	}

	.share-btn.twitter:hover {
		border-color: #1da1f2;
		background: rgba(29, 161, 242, 0.2);
	}

	.share-btn.instagram:hover {
		border-color: #e4405f;
		background: rgba(228, 64, 95, 0.2);
	}

	.share-btn.email:hover {
		border-color: #34495e;
		background: rgba(52, 73, 94, 0.2);
	}

	.restart-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem 2rem;
		background: var(--white);
		border: 2px solid var(--white);
		color: var(--black);
		border-radius: 4px;
		cursor: pointer;
		font-family: nb-architekt;
		font-size: 0.9rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		transition: all 0.3s ease;
	}

	.restart-btn:hover {
		background: var(--black);
		color: var(--white);
		box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
	}

	.room-completion {
		position: absolute;
		bottom: 1rem;
		right: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: #00ff00;
		text-shadow: 0 0 5px #00ff00;
	}

	.completion-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.room-icon {
		font-size: 1rem;
		opacity: 0.8;
	}

	@media (max-width: 800px) {
		.results-container {
			padding: 1.5rem;
		}
		
		.track-title {
			font-size: 1.1rem;
		}
		
		.decade-number {
			font-size: 1.5rem;
		}
		
		.share-btn {
			width: 45px;
			height: 45px;
		}
		
		.restart-btn {
			padding: 0.8rem 1.5rem;
			font-size: 0.8rem;
		}
	}
</style>