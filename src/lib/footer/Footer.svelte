<script>
	import { page } from '$app/stores'

	export let pages 
</script>

<footer class="root gl-section">
  <ul class="list gl-container gl-container--xlarge">
    {#each pages as { slug, title }}
      <li class="item">
        <a 
          sveltekit:prefetch 
          href={`/${slug}`}
          class:active={$page.path === `/${slug}`}
          class="link gl-typo-outline"
        >
          {title}
        </a>
      </li>
    {/each}
  </ul>
</footer>

<style lang="scss">
  @import './footer.scss';
</style>
