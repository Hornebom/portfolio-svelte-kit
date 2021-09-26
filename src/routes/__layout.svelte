<script context="module">
	import query from './layout.query.js'
	import datoRequest from '$lib/dato-request.js'

	export async function load({ page, fetch }) {
		const token = import.meta.env.VITE_DATO_API_TOKEN
		const { navigation } = await datoRequest({ query, fetch, token })
		
		if(!navigation) {
			return
		}

		return { props: { navigation } }
	}
</script>

<script>
	import Header from '$lib/header/Header.svelte'
	import Footer from '$lib/footer/Footer.svelte'
	import '../app.css'
	
	export let navigation
</script>

<Header pages={navigation.links} />

<main>
	<slot />
</main>

<Footer pages={navigation.links} />

<style>
</style>
