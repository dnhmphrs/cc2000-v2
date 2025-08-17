<script>
	export let currentStep = 1;
	export let totalSteps = 3;
</script>

<div class="progress-bar">
	{#each Array(totalSteps) as _, index}
		<div class="progress-step {index + 1 <= currentStep ? 'completed' : ''}">{index + 1}</div>
		{#if index < totalSteps - 1}
			<div class="progress-line"></div>
		{/if}
	{/each}
</div>

<style>
	.progress-bar {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 20px;
	}

	.progress-step {
		width: 30px;
		height: 30px;
		border: 2px outset #ffffff;
		border-right-color: #4a90e2;
		border-bottom-color: #4a90e2;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 14px;
		color: #2d5aa0;
		background: linear-gradient(135deg, #e6f3ff 0%, #cce7ff 100%);
	}

	.progress-step.completed {
		background: linear-gradient(135deg, #4a90e2 0%, #2d5aa0 100%);
		color: #ffffff;
		border: 2px inset #2d5aa0;
		border-right-color: #ffffff;
		border-bottom-color: #ffffff;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
	}

	.progress-line {
		width: 40px;
		height: 2px;
		background: linear-gradient(to right, #4a90e2, #6bb0ff);
		border: 1px inset #4a90e2;
		border-right-color: #ffffff;
		border-bottom-color: #ffffff;
	}
</style>
