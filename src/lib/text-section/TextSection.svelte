<script>
  import StructuredText from '$lib/structured-text/StructuredText.svelte'
  
  export let title
  export let columnLeft
  export let columnRight
  export let singleColumn
</script>

<section class="gl-section">
  <div class="inner gl-container { singleColumn ? 'gl-container--medium' : 'gl-container--xlarge'}">
    {#if title}
      <h2 class="gl-h2">
        {title}
      </h2>
    {/if}
      
    <div class="{ singleColumn ? 'col' : 'cols'}">
      <div class="gl-rich-text">
        <StructuredText text={columnLeft} />
      </div>
        
      {#if !singleColumn}
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
