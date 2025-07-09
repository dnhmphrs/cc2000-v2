<script>
	import { spicy, page, date, track } from '$lib/store/store';
	import { goto } from '$app/navigation';

	import data from '$lib/data/cc2000_data.json';

	let isCalculating = false;
	let calculationProgress = 0;

	let conceptionDate = (date_str) => {
		let date = new Date(date_str);
		date.setDate(date.getDate() - 268);
		let dateString = date.toISOString().slice(0, 10);
		return dateString;
	};

	let previousDay = (date_str) => {
		let date = new Date(date_str);
		date.setDate(date.getDate() - 1);
		let dateString = date.toISOString().slice(0, 10);
		return dateString;
	};

	let handleEdgeCases = (date) => {
		let error = false;
		let today = new Date();
		let todayString = today.toISOString().slice(0, 10);

		if (date <= '1958-06-01') {
			goto('/the-past', { replaceState: true });
			error = true;
		}
		if (date >= todayString) {
			goto('/the-future', { replaceState: true });
			error = true;
		}

		return error;
	};

	let handleProgress = () => {
		if (isCalculating) return;
		
		let conception_date = conceptionDate($date);
		let error = handleEdgeCases(conception_date);

		if (!error) {
			isCalculating = true;
			
			// Simulate calculation progress
			let progressInterval = setInterval(() => {
				calculationProgress += Math.random() * 15 + 5;
				
				if (calculationProgress >= 100) {
					clearInterval(progressInterval);
					calculationProgress = 100;
					
					// Complete the calculation
					setTimeout(() => {
						while (true) {
							try {
								track.set(data[conception_date][$spicy]);
								break;
							} catch (error) {
								conception_date = previousDay(conception_date);
							}
						}

						track.set(data[conception_date][9 - $spicy]);
						console.log($track);
						page.set(3); // Go to time travel animation
					}, 500);
				}
			}, 100);
		}
	};

	// Check if form is valid
	$: isFormValid = $date && $spicy !== undefined;
</script>

<section class="calculate-screen">
	<div class="form-container">
		<div class="header">
			<h3>CONCEPTION CALCULATOR 2000</h3>
			<div class="status-indicator">
				{#if isCalculating}
					<div class="calculating">
						<div class="progress-bar">
							<div class="progress-fill" style="width: {calculationProgress}%"></div>
						</div>
						<span>CALCULATING... {Math.floor(calculationProgress)}%</span>
					</div>
				{:else}
					<span class="ready">READY FOR BIOMETRIC INPUT</span>
				{/if}
			</div>
		</div>

		<div class="input-section">
			<div class="dob">
				<label for="birthdate">
					<h4>DATE OF BIRTH</h4>
					<input 
						id="birthdate"
						type="date" 
						bind:value={$date} 
						disabled={isCalculating}
						max={new Date().toISOString().slice(0, 10)}
						min="1958-06-01"
					/>
				</label>
			</div>

			<div class="spicy">
				<label for="spice-level">
					<h4>CONCEPTION INTENSITY</h4>
					<div class="slider-container">
						<input 
							id="spice-level"
							type="range" 
							bind:value={$spicy} 
							min="0" 
							max="9" 
							disabled={isCalculating}
						/>
						<div class="slider-labels">
							<span>Gentle</span>
							<span>Passionate</span>
						</div>
					</div>
				</label>
			</div>
		</div>

		<div class="action-section">
			<button 
				class="calculate-btn"
				class:calculating={isCalculating}
				class:disabled={!isFormValid}
				disabled={!isFormValid || isCalculating}
				on:click={handleProgress}
			>
				{#if isCalculating}
					<span>PROCESSING...</span>
				{:else}
					<span>INITIATE CALCULATION</span>
				{/if}
			</button>
		</div>
	</div>

	<div class="room-status">
		<div class="room-indicator">
			<div class="room-icon">🏠</div>
			<span>Room construction: {isCalculating ? 'ACTIVE' : 'STANDBY'}</span>
		</div>
	</div>
</section>

<style>
	.calculate-screen {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: rgba(0, 0, 0, 0.8);
		border: 2px solid var(--white);
		border-radius: 8px;
		backdrop-filter: blur(10px);
		
		opacity: 0;
		animation: fadein 0.5s 1s ease;
		animation-fill-mode: forwards;
	}

	.form-container {
		width: 100%;
		max-width: 400px;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.header {
		text-align: center;
	}

	.header h3 {
		color: var(--white);
		margin: 0 0 1rem 0;
		font-size: 1.2rem;
		letter-spacing: 0.1em;
	}

	.status-indicator {
		font-size: 0.8rem;
		color: var(--white-50);
	}

	.calculating {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
	}

	.progress-bar {
		width: 200px;
		height: 4px;
		background: var(--white-50);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--blue), var(--pink));
		transition: width 0.3s ease;
	}

	.ready {
		color: #00ff00;
		text-shadow: 0 0 10px #00ff00;
	}

	.input-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.dob, .spicy {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.dob label, .spicy label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.dob h4, .spicy h4 {
		color: var(--white);
		margin: 0;
		font-size: 0.9rem;
	}

	.dob input[type='date'] {
		background: var(--white);
		border: 2px solid var(--white);
		color: var(--black);
		padding: 12px;
		border-radius: 4px;
		font-family: nb-architekt;
		font-size: 1rem;
		transition: all 0.3s ease;
	}

	.dob input[type='date']:focus {
		outline: none;
		border-color: var(--blue);
		box-shadow: 0 0 10px rgba(21, 13, 247, 0.3);
	}

	.dob input[type='date']:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.slider-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.spicy input[type='range'] {
		appearance: none;
		-webkit-appearance: none;
		cursor: pointer;
		background: none;
		width: 100%;
		height: 4px;
		border-radius: 2px;
		background: var(--white-50);
		outline: none;
		transition: background 0.3s ease;
	}

	.spicy input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--white);
		border: 2px solid var(--blue);
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.spicy input[type='range']::-webkit-slider-thumb:hover {
		background: var(--blue);
		box-shadow: 0 0 10px rgba(21, 13, 247, 0.5);
	}

	.spicy input[type='range']:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.slider-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.8rem;
		color: var(--white-50);
	}

	.action-section {
		display: flex;
		justify-content: center;
		margin-top: 1rem;
	}

	.calculate-btn {
		background: var(--white);
		border: 2px solid var(--white);
		color: var(--black);
		padding: 1rem 2rem;
		font-family: nb-architekt;
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		cursor: pointer;
		border-radius: 4px;
		transition: all 0.3s ease;
		min-width: 200px;
		text-align: center;
	}

	.calculate-btn:hover:not(:disabled) {
		background: var(--black);
		color: var(--white);
		box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
	}

	.calculate-btn.calculating {
		background: var(--blue);
		color: var(--white);
		border-color: var(--blue);
		animation: pulse 1s infinite;
	}

	.calculate-btn.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.room-status {
		position: absolute;
		bottom: 1rem;
		right: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: var(--white-50);
	}

	.room-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.room-icon {
		font-size: 1rem;
		opacity: 0.7;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
	}

	@media (max-width: 800px) {
		.calculate-screen {
			padding: 1rem;
		}
		
		.form-container {
			max-width: 350px;
		}
		
		.calculate-btn {
			min-width: 160px;
			padding: 0.8rem 1.5rem;
		}
	}
</style>