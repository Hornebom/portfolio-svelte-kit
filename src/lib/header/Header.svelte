<script>
	import { page } from '$app/stores'

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

	<ul>
		{#each socials as { url, title }}
			<li>
				<a href={url} target="_blank" rel="noopener noreferrer">
					{title}
				</a>
			</li>
		{/each}
	</ul>
</header>

<style>
</style>
