<script>
  import StructuredText from '$lib/structured-text/StructuredText.svelte'
  import Image from '$lib/image/Image.svelte'

  export let title
  export let text
  export let url
  export let image
  export let flipped
</script>

<article class="gl-section gl-stacked" class:flipped>
  <div class="gl-container gl-container--xlarge inner">
    <div class="media">
      {#if image}
        <Image image={image} cover={true} />
      {/if}
    </div>
    
    <div class="content">
      {#if title}
        <h2 class="gl-h2">
          {title}
        </h2>
      {/if}

      {#if text}
        <div class="text gl-rich-text">
          <StructuredText text={text} />
        </div>
      {/if}

      {#if url}
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          class="link"
        >
          See it live
        </a>
      {/if}
    </div>
  </div>
</article>

<style lang="scss">
  @import './project.scss';
</style>
