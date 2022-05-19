<script>
  import StructuredText from '$lib/structured-text/StructuredText.svelte'
  
  export let title
  export let text
</script>

<section class="gl-section root">
  <div class="gl-container gl-container--xlarge inner">
    {#if title}
      <h1 class="gl-h1 gl-typo-outline">
        {title}
      </h1>
    {/if}

    {#if text && text.value}
      <div class="gl-rich-text text">
        <StructuredText text={text} />
      </div>
    {/if}
  </div>
</section>

<style lang="scss">
  @import './hero-page.scss';
</style>
