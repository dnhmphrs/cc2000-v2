<script>
	export let error = {};
	export let status;

	import { page } from '$lib/store/store';
	import { goto } from '$app/navigation';

	let handleProgress = () => {
		page.set(1);
		goto('/', { replaceState: true });
	};
</script>

<svelte:head>
	<title>CC2000 | {status}</title>
	<link rel="preload" href="/gifs/500.gif" as="image/gif" />
</svelte:head>
<section>
	<img src="/gifs/500.gif" alt="404 error" />
	<div class="message" on:click={() => handleProgress()}>
		<h1>
			Our servers overheated. The algorithm found your moment of conception too hot for calculation.
			Your parents FUCK.
		</h1>
		<br />
		<h2>Error {status}</h2>
		<h6>{error.message}</h6>
	</div>
</section>

<style>
	section {
		width: 100%;
		height: 100%;
		display: flex;
	}

	.message {
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

	.message:hover {
		border-color: var(--white);
		color: var(--white);
	}
</style>
