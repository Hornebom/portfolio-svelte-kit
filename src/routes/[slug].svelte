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
	import SeoHead from '$lib/seo-head/SeoHead.svelte'
	export let page
</script>

<svelte:head>
	{#if page.seoMeta}
		<SeoHead seo={page.seoMeta} slug={page.slug} />
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
