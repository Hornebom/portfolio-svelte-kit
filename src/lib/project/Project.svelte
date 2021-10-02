<script>
  import StructuredText from '$lib/structured-text/StructuredText.svelte'
  import Image from '$lib/image/Image.svelte'

  export let title
  export let text
  export let url
  export let image
</script>

<article>
  {#if title}
    <h2>
      {title}
    </h2>
  {/if}

  {#if text}
    <div>
      <StructuredText text={text} />
    </div>
  {/if}

  {#if url}
    <a href={url} target="_blank" rel="noopener noreferrer">
      See it live
    </a>
  {/if}
  
  {#if image}
    <Image image={image} />
  {/if}
</article>
