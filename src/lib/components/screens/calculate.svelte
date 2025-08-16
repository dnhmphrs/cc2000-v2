<script>
	import { spicy, page, date, track, gender } from '$lib/store/store';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import ProgressBar from '$lib/components/progress-bar.svelte';

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
		terminalVisible = true;
	});
</script>

{#if terminalVisible}
	<ProgressBar currentStep={currentScreen} totalSteps={3} />
	
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
{/if}

<style>
	.question-container {
		text-align: center;
		width: 100%;
		max-width: 400px;
	}

	.terminal-text {
		color: #000000;
		font-size: 18px;
		margin-bottom: 30px;
		text-shadow: none;
		letter-spacing: 2px;
	}

	.gender-options {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.gender-btn {
		background: #c0c0c0;
		border: 2px outset #ffffff;
		border-right-color: #808080;
		border-bottom-color: #808080;
		color: #000000;
		padding: 15px 30px;
		font-family: 'Courier New', monospace;
		font-size: 16px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.1s ease;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.gender-btn:hover {
		background: #d4d4d4;
		border: 2px inset #ffffff;
		border-right-color: #808080;
		border-bottom-color: #808080;
	}

	.gender-btn:active {
		background: #a0a0a0;
		border: 2px inset #808080;
		border-right-color: #ffffff;
		border-bottom-color: #ffffff;
	}

	.input-container {
		margin-bottom: 30px;
	}

	.terminal-input {
		background: #ffffff;
		border: 2px inset #808080;
		border-right-color: #ffffff;
		border-bottom-color: #ffffff;
		color: #000000;
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
		border: 2px outset #ffffff;
		border-right-color: #808080;
		border-bottom-color: #808080;
		background: #ffffff;
	}

	.spicy-container {
		margin-bottom: 30px;
	}

	.spicy-display {
		margin-bottom: 20px;
	}

	.spicy-value {
		color: #000080;
		font-size: 48px;
		font-weight: bold;
		text-shadow: none;
	}

	.spicy-label {
		color: #000000;
		font-size: 24px;
		font-weight: bold;
	}

	.spicy-slider {
		width: 100%;
		max-width: 300px;
		height: 8px;
		background: #c0c0c0;
		border: 2px inset #808080;
		border-right-color: #ffffff;
		border-bottom-color: #ffffff;
		border-radius: 0;
		outline: none;
		margin-bottom: 10px;
		-webkit-appearance: none;
		appearance: none;
	}

	.spicy-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 15px;
		height: 20px;
		background: #c0c0c0;
		border: 2px outset #ffffff;
		border-right-color: #808080;
		border-bottom-color: #808080;
		cursor: pointer;
		border-radius: 0;
	}

	.spicy-slider::-webkit-slider-thumb:hover {
		background: #d4d4d4;
	}

	.spicy-slider::-webkit-slider-thumb:active {
		background: #a0a0a0;
		border: 2px inset #808080;
		border-right-color: #ffffff;
		border-bottom-color: #ffffff;
	}

	.spicy-slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		background: #c0c0c0;
		border: 2px outset #ffffff;
		border-right-color: #808080;
		border-bottom-color: #808080;
		cursor: pointer;
		border-radius: 0;
	}

	.spicy-slider::-moz-range-thumb:hover {
		background: #d4d4d4;
	}

	.spicy-slider::-moz-range-thumb:active {
		background: #a0a0a0;
		border: 2px inset #808080;
		border-right-color: #ffffff;
		border-bottom-color: #ffffff;
	}

	.spicy-labels {
		display: flex;
		justify-content: space-between;
		color: #000000;
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
		background: #c0c0c0;
		border: 2px outset #ffffff;
		border-right-color: #808080;
		border-bottom-color: #808080;
		color: #000000;
		padding: 12px 20px;
		font-family: 'Courier New', monospace;
		font-size: 14px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.1s ease;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.terminal-btn:hover:not(:disabled) {
		background: #d4d4d4;
		border: 2px inset #ffffff;
		border-right-color: #808080;
		border-bottom-color: #808080;
	}

	.terminal-btn:active:not(:disabled) {
		background: #a0a0a0;
		border: 2px inset #808080;
		border-right-color: #ffffff;
		border-bottom-color: #ffffff;
	}

	.terminal-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: #e0e0e0;
		color: #808080;
	}

	.back-btn {
		background: #c0c0c0;
		border: 2px outset #ffffff;
		border-right-color: #808080;
		border-bottom-color: #808080;
		color: #000000;
	}

	.back-btn:hover {
		background: #d4d4d4;
		border: 2px inset #ffffff;
		border-right-color: #808080;
		border-bottom-color: #808080;
	}

	.back-btn:active {
		background: #a0a0a0;
		border: 2px inset #808080;
		border-right-color: #ffffff;
		border-bottom-color: #ffffff;
	}

	.calculate-btn {
		background: #c0c0c0;
		border: 2px outset #ffffff;
		border-right-color: #808080;
		border-bottom-color: #808080;
		color: #000000;
	}

	.calculate-btn:hover {
		background: #d4d4d4;
		border: 2px inset #ffffff;
		border-right-color: #808080;
		border-bottom-color: #808080;
	}

	.calculate-btn:active {
		background: #a0a0a0;
		border: 2px inset #808080;
		border-right-color: #ffffff;
		border-bottom-color: #ffffff;
	}

	.btn-text {
		display: block;
	}

	@media (max-width: 600px) {
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
