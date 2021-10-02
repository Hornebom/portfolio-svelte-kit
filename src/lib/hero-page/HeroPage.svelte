<script>
  import StructuredText from '$lib/structured-text/StructuredText.svelte'
  
  export let title
  export let text
</script>

<section>
  {#if title}
    <h1>
      {title}
    </h1>
  {/if}

  {#if text && text.value}
    <div>
      <StructuredText text={text} />
    </div>
  {/if}
</section>