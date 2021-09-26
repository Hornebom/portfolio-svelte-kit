<script context="module">
	import query from './slug.query.js'
	import datoRequest from '$lib/dato-request.js'
	
	export const prerender = true;
	
	export async function load({ page, fetch }) {
    const { slug } = page.params
		const token = import.meta.env.VITE_DATO_API_TOKEN
		const data = await datoRequest({ 
      query, variables: { slug }, fetch, token 
    })
		
		if(!data.page) {
			return
		}

		return { props: { page: data.page } }
	}
</script>

<script>
	export let page
</script>

<svelte:head>
	{#if page.title }
		<title>{page.title}</title>
	{/if}
</svelte:head>

<section>
	{#if page.title }
		<h1>
			{page.title}
		</h1>
	{/if}
</section>

<style>
</style>
