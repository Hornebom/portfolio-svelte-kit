<script context="module">
	import loadData from '../lib/utils/loadData.js'

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
	$: ({ navigation, socials } = data)

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
