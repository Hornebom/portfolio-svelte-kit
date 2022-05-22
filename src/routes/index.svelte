<script context="module">
	import loadData from '../lib/utils/loadData.js'

	export const load = async({ fetch }) => loadData(fetch, 'data/home.json')
</script>

<script>
	import { page } from '$app/stores'
	import SeoHead from '$lib/seo-head/SeoHead.svelte'
	import Sections from '$lib/sections/Sections.svelte'
	
	export let data
	
	$: ({ seoMeta, sections } = data)
	$: seoProps = {seo: seoMeta, slug: $page.params.slug}
</script>

<SeoHead {...seoProps} />

{#if sections}
	<Sections sections={sections} />
{/if}
