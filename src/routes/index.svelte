<script context="module">
	import query from './index.query.js'
	import datoRequest from '$lib/dato-request.js'

	export const prerender = true;
	
	export async function load({ fetch, page }) {
		const { slug } = page.params
		const token = import.meta.env.VITE_DATO_API_TOKEN
		const { home } = await datoRequest({ query, fetch, token })
		return { props: { page: { ...home, slug }} }
	}
</script>

<script>
	import SeoHead from '$lib/seo-head/SeoHead.svelte'
	import Sections from '$lib/sections/Sections.svelte'
	
	export let page
</script>

<SeoHead seo={page.seoMeta} slug={page.slug} />

{#if page.sections}
	<Sections sections={page.sections} />
{/if}

<style>
</style>
