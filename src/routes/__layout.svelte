<script context="module">
	import query from './layout.query.js'
	import datoRequest from '$lib/dato-request.js'

	export async function load({ page, fetch }) {
		const token = import.meta.env.VITE_DATO_API_TOKEN
		const { navigation, allSocials } = await datoRequest({ query, fetch, token })
		
		// @TODO: what is this check for?
		if(!navigation) {
			return
		}

		return { props: { navigation, socials: allSocials } }
	}
</script>

<script>
	import Header from '$lib/header/Header.svelte'
	import Footer from '$lib/footer/Footer.svelte'
	import '../app.css'
	
	export let navigation
	export let socials
</script>

<Header pages={navigation.links} socials={socials} />
<main>
	<slot />
</main>
<Footer pages={navigation.links} />

<style>
</style>
