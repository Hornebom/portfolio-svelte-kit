<script context="module">
	import query from './slug.query.js'
	import datoRequest from '$lib/utils/dato-request.js'
	
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

		return { props: { data: data.page } }
	}
</script>

<script>
	import { page } from '$app/stores'
	import SeoHead from '$lib/seo-head/SeoHead.svelte'
	import Sections from '$lib/sections/Sections.svelte'

	export let data

	$: seoProps = {seo: data.seoMeta, slug: $page.params.slug}
</script>


{#key $page.path}
	<SeoHead {...seoProps} />

	{#if data.sections}
		<Sections sections={data.sections} />
	{/if}
{/key}
