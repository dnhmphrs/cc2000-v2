<script>
	import { page } from '$lib/store/store';
	import { goto } from '$app/navigation';

	let handleProgress = () => {
		page.set(1);
		goto('/', { replaceState: true });
	};
</script>

<svelte:head>
	<title>CC2000 | 404</title>
	<link rel="preload" href="/gifs/404.gif" as="image/gif" />
</svelte:head>
<section>
	<img src="/gifs/404.gif" alt="404 error" />
	<h1 on:click={() => handleProgress()}>You shouldn’t be here. Run.</h1>
</section>

<style>
	section {
		width: 100%;
		height: 100%;
		display: flex;
	}

	h1 {
		text-align: center;

		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: black;
		padding: 0.5rem 1rem;

		border: solid 1px var(--white-50);
		color: var(--white-50);

		cursor: pointer;
	}

	h1:hover {
		border-color: var(--white);
		color: var(--white);
	}
</style>
