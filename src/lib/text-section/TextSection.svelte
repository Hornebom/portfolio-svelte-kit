<script>
  import StructuredText from '$lib/structured-text/StructuredText.svelte'
  
  export let title
  export let columnLeft
  export let columnRight
</script>

<section class="gl-section">
  <div class="inner gl-container gl-container--xlarge">
    {#if title}
      <h2 class="gl-h2">
        {title}
      </h2>
    {/if}
      
    <div class="cols">
      {#if columnLeft}
        <div class="gl-rich-text">
          <StructuredText text={columnLeft} />
        </div>
        {/if}
        
        {#if columnRight}
        <div class="gl-rich-text">
          <StructuredText text={columnRight} />
        </div>
      {/if}
    </div>
  </div>
</section>

<style lang="scss">
  @import './text-section.scss';
</style>
