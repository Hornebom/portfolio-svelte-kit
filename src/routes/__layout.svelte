<script context="module">
	import query from './layout.query.js'
	import datoRequest from '$lib/dato-request.js'

	export async function load({ page, fetch }) {
		const token = import.meta.env.VITE_DATO_API_TOKEN
		const { allPages } = await datoRequest({ query, fetch, token })
		
		if(!allPages) {
			return
		}

		return { props: { allPages } }
	}
</script>

<script>
	import Header from '$lib/header/Header.svelte'
	import Footer from '$lib/footer/Footer.svelte'
	import '../app.css'
	
	export let allPages
</script>

<Header pages={allPages} />

<main>
	<slot />
</main>

<Footer pages={allPages} />

<style>
</style>
