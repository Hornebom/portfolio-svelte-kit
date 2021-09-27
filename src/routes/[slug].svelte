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

		return { props: { data: data.page } }
	}
</script>

<script>
	import { page } from '$app/stores'
	import SeoHead from '$lib/seo-head/SeoHead.svelte'
	export let data

	$: seoProps = {seo: data.seoMeta, slug: $page.params.slug}
</script>


{#key $page.path}
	<SeoHead {...seoProps} />
{/key}

<section>
	{#if data.title }
		<h1>
			{data.title}
		</h1>
	{/if}
</section>

<style>
</style>
