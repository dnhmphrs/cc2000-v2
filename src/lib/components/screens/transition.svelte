<script>
	import { page } from '$lib/store/store';

	let handleProgress = () => {
		page.set(4);
	};
</script>

<section>
	<h3 on:click={() => handleProgress()}>Transitioning. Blah. Blah.</h3>
</section>

<style>
	section {
		width: 100%;
		height: 100%;
		display: flex;
	}

	h3 {
		text-align: center;

		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 0.5rem 1rem;

		background: var(--true-black);
		color: var(--white);
		border: solid 1px var(--pink);

		cursor: pointer;
	}

	h3:hover {
		border-color: var(--pink);
		color: var(--pink);
	}
</style>
