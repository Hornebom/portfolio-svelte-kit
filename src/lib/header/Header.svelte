<script>
	import { page } from '$app/stores'
	import Socials from '$lib/socials/Socials.svelte'

	export let pages
	export let socials
</script>

<header>
	<div>
		<a sveltekit:prefetch href="/">Home</a>
	</div>

	<nav>
		<ul>
			{#each pages as { slug, title }}
				<li class:active={$page.path === `/${slug}`}>
					<a sveltekit:prefetch href={`/${slug}`}>
						{title}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	{#if socials}
		<Socials items={socials} />
	{/if}
</header>

<style>
</style>
