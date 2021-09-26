<script context="module">
	import query from './index.query.js'
	import datoRequest from '$lib/dato-request.js'

	export const prerender = true;
	
	export async function load({ fetch }) {
		const token = import.meta.env.VITE_DATO_API_TOKEN
		const { home } = await datoRequest({ query, fetch, token })
		return { props: { page: home } }
	}
</script>

<script>
	export let page
</script>

<svelte:head>
	{#if page.title}
		<title>{page.title}</title>
	{/if}
</svelte:head>

<section>
	{#if page.title}
		<h1>
			{page.title}
		</h1>
	{/if}
</section>

<style>
</style>
