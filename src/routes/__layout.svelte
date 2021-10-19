<script context="module">
	import query from './layout.query.js'
	import datoRequest from '$lib/utils/dato-request.js'

	export async function load({ page, fetch }) {
		const token = import.meta.env.VITE_DATO_API_TOKEN
		const { navigation, allSocials } = await datoRequest({ query, fetch, token })

		return { props: { navigation, socials: allSocials } }
	}
</script>

<script>
	import { onMount } from 'svelte'
	import themeHandler from '$lib/utils/themeHandler.js';
	import Header from '$lib/header/Header.svelte'
	import Footer from '$lib/footer/Footer.svelte'
	import Stage from '$lib/stage/Stage.svelte'
	import '../app.scss'
	
	export let navigation
	export let socials

	const { setRoot } = themeHandler()
	onMount(() => {
		setRoot(document.documentElement)
	})
</script>

<Stage />
<Header pages={navigation.links} socials={socials} />
<main class="gl-main gl-sections">
	<slot></slot>
</main>
<Footer pages="{navigation.links}" />
