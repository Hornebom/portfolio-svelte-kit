<script context="module">
	// import query from './layout.query.js'
	// import datoRequest from '$lib/utils/dato-request.js'
	import loadData from '../lib/utils/loadData.js'

	// export async function load({ page, fetch }) {
	// 	const token = import.meta.env.VITE_DATO_API_TOKEN
	// 	const { navigation, allSocials } = await datoRequest({ query, fetch, token })

	// 	return { props: { navigation, socials: allSocials } }
	// }
	export const load = async({ fetch }) => loadData(fetch, 'data/app.json')
</script>

<script>
	import { onMount } from 'svelte'
	import themeHandler from '$lib/utils/themeHandler.js';
	import Header from '$lib/header/Header.svelte'
	import Footer from '$lib/footer/Footer.svelte'
	import Stage from '$lib/stage/Stage.svelte'
	import '../app.scss'
	
	export let data

	const { setRoot } = themeHandler()
	onMount(() => {
		setRoot(document.documentElement)
	})
</script>

<Stage />
<Header pages={data.navigation.links} socials={data.socials} />
<main class="gl-main gl-sections">
	<slot></slot>
</main>
<Footer pages="{data.navigation.links}" />
