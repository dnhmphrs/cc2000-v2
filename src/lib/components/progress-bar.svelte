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
		border-right-color: #808080;
		border-bottom-color: #808080;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 14px;
		color: #000000;
		background: #c0c0c0;
	}

	.progress-step.completed {
		background: #000080;
		color: #ffffff;
		border: 2px inset #808080;
		border-right-color: #ffffff;
		border-bottom-color: #ffffff;
	}

	.progress-line {
		width: 40px;
		height: 2px;
		background: #808080;
		border: 1px inset #808080;
		border-right-color: #ffffff;
		border-bottom-color: #ffffff;
	}
</style>
