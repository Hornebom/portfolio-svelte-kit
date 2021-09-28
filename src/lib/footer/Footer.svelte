<script>
	import { page } from '$app/stores'

	export let pages 
</script>

<footer>
  <ul>
    {#each pages as { slug, title }}
      <li class:active={$page.path === `/${slug}`}>
        <a sveltekit:prefetch href={`/${slug}`}>
          {title}
        </a>
      </li>
    {/each}
  </ul>
</footer>

<style>
</style>
