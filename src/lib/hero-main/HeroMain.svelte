<script>
  import StructuredText from '$lib/structured-text/StructuredText.svelte'
  export let title
  export let text

  $: formattedTitle = title.replace(/(<p)/igm, '<h1').replace(/<\/p>/igm, '</h1>')
</script>

<section>
  {@html formattedTitle}

  {#if text}
    <div>
      <StructuredText text={text} />
    </div>
  {/if}
</section>
