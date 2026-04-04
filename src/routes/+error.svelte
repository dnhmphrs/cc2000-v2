<script>
	import ErrorScreen from '$lib/components/error/ErrorScreen.svelte';
	import { page } from '$app/stores';
</script>

<ErrorScreen status={$page.status} message={$page.error?.message} />
