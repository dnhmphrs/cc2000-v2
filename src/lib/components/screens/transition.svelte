<script>
	import { page, track } from '$lib/store/store';
	import { onMount } from 'svelte';

	let timeProgress = 0;
	let currentDecade = 2020;
	let isComplete = false;

	const decades = [2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950];
	const decadeMessages = {
		2020: "Scanning modern databases...",
		2010: "Accessing social media archives...",
		2000: "Connecting to Y2K-era servers...",
		1990: "Diving into grunge-era data...",
		1980: "Surfing synth-wave frequencies...",
		1970: "Grooving through disco archives...",
		1960: "Tuning into psychedelic signals...",
		1950: "Reaching rock 'n' roll origins..."
	};

	let currentMessage = decadeMessages[2020];

	onMount(() => {
		// Start the time travel animation
		const duration = 2500;
		const startTime = Date.now();
		
		const animateTimeTravel = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			
			timeProgress = progress * 100;
			
			// Calculate current decade based on progress
			const decadeIndex = Math.floor(progress * decades.length);
			const newDecade = decades[Math.min(decadeIndex, decades.length - 1)];
			
			if (newDecade !== currentDecade) {
				currentDecade = newDecade;
				currentMessage = decadeMessages[newDecade];
			}
			
			if (progress < 1) {
				requestAnimationFrame(animateTimeTravel);
			} else {
				// Animation complete
				isComplete = true;
				currentMessage = "Calculation complete! Displaying results...";
				
				// Brief pause before showing results
				setTimeout(() => {
					page.set(4);
				}, 1000);
			}
		};
		
		animateTimeTravel();
	});

	// Calculate target decade based on track data
	$: targetDecade = $track ? Math.floor(new Date($track.chart_date).getFullYear() / 10) * 10 : 1960;
</script>

<section class="transition-screen">
	<div class="time-machine">
		<div class="machine-header">
			<h2>TEMPORAL CALCULATION ENGINE</h2>
			<div class="status-light" class:complete={isComplete}></div>
		</div>

		<div class="time-display">
			<div class="decade-counter">
				<span class="decade-number">{currentDecade}</span>
				<span class="decade-label">ANALYZING DECADE</span>
			</div>
			
			<div class="progress-container">
				<div class="progress-bar">
					<div class="progress-fill" style="width: {timeProgress}%"></div>
				</div>
				<span class="progress-text">{Math.floor(timeProgress)}% COMPLETE</span>
			</div>
		</div>

		<div class="time-tunnel">
			<div class="tunnel-rings">
				{#each Array(8) as _, i}
					<div 
						class="ring" 
						class:active={i <= Math.floor(timeProgress / 12.5)}
						style="animation-delay: {i * 0.1}s"
					></div>
				{/each}
			</div>
		</div>

		<div class="status-message">
			<div class="message-text">{currentMessage}</div>
			{#if isComplete}
				<div class="result-preview">
					Target decade: {targetDecade}s
				</div>
			{/if}
		</div>

		<div class="scan-lines"></div>
	</div>
</section>

<style>
	.transition-screen {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.9);
		border: 2px solid var(--white);
		border-radius: 8px;
		overflow: hidden;
	}

	.time-machine {
		width: 100%;
		max-width: 400px;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		text-align: center;
	}

	.machine-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.machine-header h2 {
		color: var(--white);
		font-size: 1rem;
		margin: 0;
		letter-spacing: 0.1em;
	}

	.status-light {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #ff4444;
		box-shadow: 0 0 10px #ff4444;
		animation: pulse 1s infinite;
	}

	.status-light.complete {
		background: #00ff00;
		box-shadow: 0 0 10px #00ff00;
		animation: none;
	}

	.time-display {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.decade-counter {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.decade-number {
		font-size: 3rem;
		font-weight: 600;
		color: var(--white);
		text-shadow: 0 0 20px var(--blue);
		animation: flicker 0.5s infinite alternate;
	}

	.decade-label {
		font-size: 0.8rem;
		color: var(--white-50);
		letter-spacing: 0.2em;
	}

	.progress-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
	}

	.progress-bar {
		width: 100%;
		height: 6px;
		background: var(--white-50);
		border-radius: 3px;
		overflow: hidden;
		position: relative;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--blue), var(--pink), var(--blue));
		background-size: 200% 100%;
		animation: progressShine 2s infinite;
		transition: width 0.3s ease;
	}

	.progress-text {
		font-size: 0.8rem;
		color: var(--white);
		letter-spacing: 0.1em;
	}

	.time-tunnel {
		position: relative;
		height: 150px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 1rem 0;
	}

	.tunnel-rings {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ring {
		position: absolute;
		border: 2px solid var(--white-50);
		border-radius: 50%;
		opacity: 0.3;
		transition: all 0.3s ease;
	}

	.ring.active {
		border-color: var(--blue);
		opacity: 1;
		box-shadow: 0 0 20px var(--blue);
	}

	.ring:nth-child(1) { width: 20px; height: 20px; }
	.ring:nth-child(2) { width: 40px; height: 40px; }
	.ring:nth-child(3) { width: 60px; height: 60px; }
	.ring:nth-child(4) { width: 80px; height: 80px; }
	.ring:nth-child(5) { width: 100px; height: 100px; }
	.ring:nth-child(6) { width: 120px; height: 120px; }
	.ring:nth-child(7) { width: 140px; height: 140px; }
	.ring:nth-child(8) { width: 160px; height: 160px; }

	.status-message {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-height: 60px;
	}

	.message-text {
		color: var(--white);
		font-size: 0.9rem;
		letter-spacing: 0.05em;
		animation: typewriter 1s infinite;
	}

	.result-preview {
		color: var(--blue);
		font-size: 0.8rem;
		font-weight: 600;
		text-shadow: 0 0 10px var(--blue);
	}

	.scan-lines {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			180deg,
			transparent 0%,
			rgba(0, 255, 0, 0.05) 50%,
			transparent 100%
		);
		background-size: 100% 4px;
		animation: scanlines 2s infinite;
		pointer-events: none;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	@keyframes flicker {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.8; }
	}

	@keyframes progressShine {
		0% { background-position: 0% 50%; }
		100% { background-position: 100% 50%; }
	}

	@keyframes typewriter {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
	}

	@keyframes scanlines {
		0% { transform: translateY(-100%); }
		100% { transform: translateY(100vh); }
	}

	@media (max-width: 800px) {
		.time-machine {
			padding: 1.5rem;
		}
		
		.decade-number {
			font-size: 2.5rem;
		}
		
		.time-tunnel {
			height: 120px;
		}
		
		.ring:nth-child(8) { width: 120px; height: 120px; }
		.ring:nth-child(7) { width: 100px; height: 100px; }
		.ring:nth-child(6) { width: 80px; height: 80px; }
	}
</style>