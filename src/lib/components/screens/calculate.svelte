<script>
	import { spicy, page, date, track, gender } from '$lib/store/store';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	import data from '$lib/data/cc2000_data.json';

	let currentScreen = 1; // 1 = gender, 2 = birthday, 3 = spicy
	let terminalVisible = false;

	let conceptionDate = (date_str) => {
		// get conception date
		let date = new Date(date_str);
		date.setDate(date.getDate() - 268);
		let dateString = date.toISOString().slice(0, 10);
		return dateString;
	};

	let previousDay = (date_str) => {
		// get previous day
		let date = new Date(date_str);
		date.setDate(date.getDate() - 1);
		let dateString = date.toISOString().slice(0, 10);
		return dateString;
	};

	let handleEdgeCases = (date) => {
		let error = false;
		let today = new Date();
		let todayString = today.toISOString().slice(0, 10);

		// if date is before 1958-06-01
		if (date <= '1958-06-01') {
			goto('/the-past', { replaceState: true });
			error = true;
		}
		// if date is after 2023-03-05
		if (date >= todayString) {
			goto('/the-future', { replaceState: true });
			error = true;
		}

		return error;
	};

	let handleGenderSelect = (selectedGender) => {
		gender.set(selectedGender);
		currentScreen = 2;
	};

	let handleBirthdayNext = () => {
		if ($date) {
			currentScreen = 3;
		}
	};

	let handleSpicyNext = () => {
		let conception_date = conceptionDate($date);
		let error = handleEdgeCases(conception_date);

		if (!error) {
			while (true) {
				try {
					track.set(data[conception_date][$spicy]);
					break;
				} catch (error) {
					conception_date = previousDay(conception_date);
				}
			}

			track.set(data[conception_date][9 - $spicy]); // fix ordering
			console.log($track);
			page.set(3);
		}
	};

	let handleBack = () => {
		if (currentScreen === 3) {
			currentScreen = 2;
		} else if (currentScreen === 2) {
			currentScreen = 1;
		} else {
			page.set(2);
		}
	};

	onMount(() => {
		setTimeout(() => {
			terminalVisible = true;
		}, 2000);
	});
</script>

{#if terminalVisible}
	<section class="terminal-window">
		<div class="terminal-header">
			<!-- <div class="terminal-buttons">
				<div class="button red"></div>
				<div class="button yellow"></div>
				<div class="button green"></div>
			</div> -->
			<div class="terminal-title">CC2000 : CONCEPTION CALCULATOR 2000</div>
		</div>
		
		<div class="terminal-content">
			<div class="progress-bar">
				<div class="progress-step {currentScreen >= 1 ? 'completed' : ''}">1</div>
				<div class="progress-line"></div>
				<div class="progress-step {currentScreen >= 2 ? 'completed' : ''}">2</div>
				<div class="progress-line"></div>
				<div class="progress-step {currentScreen >= 3 ? 'completed' : ''}">3</div>
			</div>
			
			{#if currentScreen === 1}
				<div class="question-container">
					<h2 class="terminal-text">SELECT GENDER:</h2>
					<div class="gender-options">
						<button class="gender-btn" on:click={() => handleGenderSelect('male')}>
							<span class="btn-text">[1] MALE</span>
						</button>
						<button class="gender-btn" on:click={() => handleGenderSelect('female')}>
							<span class="btn-text">[2] FEMALE</span>
						</button>
						<button class="gender-btn" on:click={() => handleGenderSelect('other')}>
							<span class="btn-text">[3] OTHER</span>
						</button>
					</div>
				</div>
			{:else if currentScreen === 2}
				<div class="question-container">
					<h2 class="terminal-text">ENTER DATE OF BIRTH:</h2>
					<div class="input-container">
						<input 
							type="date" 
							bind:value={$date} 
							class="terminal-input"
							max="2023-03-05"
							min="1958-06-01"
						/>
					</div>
					<div class="button-container">
						<button class="terminal-btn back-btn" on:click={handleBack}>
							<span class="btn-text">[ESC] BACK</span>
						</button>
						<button class="terminal-btn next-btn" on:click={handleBirthdayNext} disabled={!$date}>
							<span class="btn-text">[ENTER] NEXT</span>
						</button>
					</div>
				</div>
			{:else if currentScreen === 3}
				<div class="question-container">
					<h2 class="terminal-text">SELECT SPICY LEVEL:</h2>
					<div class="spicy-container">
						<div class="spicy-display">
							<span class="spicy-value">{$spicy}</span>
							<span class="spicy-label">/ 9</span>
						</div>
						<input 
							type="range" 
							bind:value={$spicy} 
							min="0" 
							max="9" 
							class="spicy-slider"
						/>
						<div class="spicy-labels">
							<span>MILD</span>
							<span>HOT</span>
						</div>
					</div>
					<div class="button-container">
						<button class="terminal-btn back-btn" on:click={handleBack}>
							<span class="btn-text">[ESC] BACK</span>
						</button>
						<button class="terminal-btn calculate-btn" on:click={handleSpicyNext}>
							<span class="btn-text">[ENTER] CALCULATE</span>
						</button>
					</div>
				</div>
			{/if}
		</div>
	</section>
{/if}

<style>
	.terminal-window {
		width: 100%;
		height: 100%;
		background: var(--black);
		border: 2px solid var(--white);
		border-radius: 8px;
		/* box-shadow: 0 0 20px rgba(0, 255, 0, 0.3); */
		display: flex;
		flex-direction: column;
		font-family: 'Courier New', monospace;
		overflow: hidden;

		opacity: 0;
		animation: fadein .5s ease-out;
		animation-fill-mode: forwards;
	}

	.terminal-header {
		background: var(--white);
		color: var(--black);
		padding: 8px 12px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-weight: bold;
		font-size: 12px;
	}

	/* .terminal-buttons {
		display: flex;
		gap: 6px;
	}

	.button {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 1px solid var(--black);
	}

	.button.red { background: #ff5f56; }
	.button.yellow { background: #ffbd2e; }
	.button.green { background: #27ca3f; } */

	.terminal-title {
		font-size: 11px;
		letter-spacing: 1px;
	}

	.terminal-content {
		flex: 1;
		padding: 20px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 30px;
	}

	.progress-bar {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 20px;
	}

	.progress-step {
		width: 30px;
		height: 30px;
		border: 2px solid var(--white);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 14px;
		color: var(--white);
		background: transparent;
	}

	.progress-step.completed {
		background: var(--white);
		color: var(--black);
	}

	.progress-line {
		width: 40px;
		height: 2px;
		background: var(--white);
	}

	.question-container {
		text-align: center;
		width: 100%;
		max-width: 400px;
	}

	.terminal-text {
		color: var(--white);
		font-size: 18px;
		margin-bottom: 30px;
		text-shadow: 0 0 10px var(--white);
		letter-spacing: 2px;
	}

	.gender-options {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.gender-btn {
		background: transparent;
		border: 2px solid var(--white);
		color: var(--white);
		padding: 15px 30px;
		font-family: 'Courier New', monospace;
		font-size: 16px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s ease;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.gender-btn:hover {
		background: var(--white);
		color: var(--black);
		box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
		transform: scale(1.05);
	}

	.input-container {
		margin-bottom: 30px;
	}

	.terminal-input {
		background: transparent;
		border: 2px solid var(--white);
		color: var(--white);
		padding: 15px;
		font-family: 'Courier New', monospace;
		font-size: 16px;
		font-weight: bold;
		text-align: center;
		width: 100%;
		max-width: 250px;
	}

	.terminal-input:focus {
		outline: none;
		box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
	}

	.spicy-container {
		margin-bottom: 30px;
	}

	.spicy-display {
		margin-bottom: 20px;
	}

	.spicy-value {
		color: var(--white);
		font-size: 48px;
		font-weight: bold;
		text-shadow: 0 0 20px var(--white);
	}

	.spicy-label {
		color: var(--white);
		font-size: 24px;
		font-weight: bold;
	}

	.spicy-slider {
		width: 100%;
		max-width: 300px;
		height: 8px;
		background: transparent;
		border: 2px solid var(--white);
		border-radius: 4px;
		outline: none;
		margin-bottom: 10px;
	}

	.spicy-slider::-webkit-slider-thumb {
		appearance: none;
		width: 20px;
		height: 20px;
		background: var(--white);
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
	}

	.spicy-slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		background: var(--white);
		border-radius: 50%;
		cursor: pointer;
		border: none;
		box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
	}

	.spicy-labels {
		display: flex;
		justify-content: space-between;
		color: var(--white);
		font-size: 12px;
		font-weight: bold;
		letter-spacing: 1px;
	}

	.button-container {
		display: flex;
		gap: 15px;
		justify-content: center;
	}

	.terminal-btn {
		background: transparent;
		border: 2px solid var(--white);
		color: var(--white);
		padding: 12px 20px;
		font-family: 'Courier New', monospace;
		font-size: 14px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s ease;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.terminal-btn:hover:not(:disabled) {
		background: var(--white);
		color: var(--black);
		box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
		transform: scale(1.05);
	}

	.terminal-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.back-btn {
		border-color: #ff6b6b;
		color: #ff6b6b;
	}

	.back-btn:hover {
		background: #ff6b6b;
		color: var(--black);
		box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
	}

	.calculate-btn {
		border-color: #4ecdc4;
		color: #4ecdc4;
	}

	.calculate-btn:hover {
		background: #4ecdc4;
		color: var(--black);
		box-shadow: 0 0 20px rgba(78, 205, 196, 0.5);
	}

	.btn-text {
		display: block;
	}

	@keyframes fadein {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@media (max-width: 600px) {
		.terminal-content {
			padding: 15px;
		}
		
		.terminal-text {
			font-size: 16px;
		}
		
		.spicy-value {
			font-size: 36px;
		}
		
		.button-container {
			flex-direction: column;
			gap: 10px;
		}
		
		.terminal-btn {
			padding: 10px 15px;
			font-size: 12px;
		}
	}
</style>
