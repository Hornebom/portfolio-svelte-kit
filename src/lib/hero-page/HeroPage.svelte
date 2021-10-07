<script>
  import StructuredText from '$lib/structured-text/StructuredText.svelte'
  
  export let title
  export let text
</script>

<section class="gl-section root">
  <div class="gl-container gl-container--xlarge inner">
    <div class="col">
      {#if title}
        <h1 class="gl-h2">
          {title}
        </h1>
      {/if}
    </div>

    <div class="col">
      {#if text && text.value}
        <div class="gl-rich-text">
          <StructuredText text={text} />
        </div>
      {/if}
    </div>
  </div>
</section>

<style lang="scss">
  @import './hero-page.scss';
</style>
