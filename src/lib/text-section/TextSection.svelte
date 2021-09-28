<script>
  import StructuredText from '$lib/structured-text/StructuredText.svelte'
  
  export let title
  export let columnLeft
  export let columnRight
</script>

<section>
  {#if title}
    <h2>
      {title}
    </h2>
  {/if}

  {#if columnLeft}
    <StructuredText text={columnLeft} />
  {/if}
  
  {#if columnRight}
    <StructuredText text={columnRight} />
  {/if}
</section>