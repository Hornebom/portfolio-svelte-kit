<script context="module">
	import loadData from '../lib/utils/loadData.js'
	export const prerender = true

	export const load = async({ fetch, page }) => loadData(fetch, `data/${page.params.slug}.json`)
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
