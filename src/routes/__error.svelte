<script context="module">
  export function load({ error, status }) {
		return {
			props: {
				props: { error, status },
			}
		}
	}
</script>

<script>
	export let error
	export let status
</script>

<svelte:head>
  <title>{status}</title>
</svelte:head>

<h1>
	{status}
	{#if error}
	: {error.message}
	{/if}
</h1>
<a sveltekit:prefetch href="/">Home</a>

<style>
</style>
