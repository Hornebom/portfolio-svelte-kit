<script>
	import { page } from '$app/stores'
	import trapFocus from '$lib/actions/trap-focus'
	import Socials from '$lib/socials/Socials.svelte'
	import Burger from '$lib/burger/Burger.svelte'
	import Logo from '$lib/logo/Logo.svelte'
	import Themes from '$lib/themes/Themes.svelte'

	export let pages
	export let socials
	let open = false

	function closeNavigation() {
		open = false
	}
</script>

<header 
	class="root" 
	use:trapFocus={{ active: open, onEscape: closeNavigation }}
>
	<a 
		sveltekit:prefetch href="/"
		aria-label="home"
		class="logo"
		on:click={closeNavigation}
	>
		<Logo />
	</a>

	<Themes class="controls" />

	<Burger 
		clickHandler={() => open = !open} 
		open={open} 
		class="burger"
	/>

	<div class="container" class:open aria-hidden={!open}>
		<div class="clipper">
			<div class="content">
				<nav class="nav">
					<ul>
						{#each pages as { slug, title }}
							<li>
								<a 
									sveltekit:prefetch 
									href={`/${slug}`} 
									class="link gl-typo-outline"
									class:active={$page.path === `/${slug}`}
									on:click={closeNavigation}
								>
									{title}
								</a>
							</li>
						{/each}
					</ul>
				</nav>

				{#if socials}
					<Socials items={socials} />
				{/if}
			</div>
		</div>
	</div>
</header>

<style lang="scss">
	@import './header.scss';
</style>
