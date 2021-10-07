<script>
  export let image
  export let cover = false

  const width = image.format === 'svg' ? image.width : image.responsiveImage.width 
  const height = image.format === 'svg' ? image.height : image.responsiveImage.height 
  const altText = image.alt || ''
</script>

<div class="root {$$restProps.class || ''}" class:cover>
  {#if !cover}
    <span
      style="padding-top: {height / width * 100}%"
      class="spacer"
    />
  {/if}

  {#if image.format === 'svg'}
    <img
      src={image.url}
      alt={altText}
      class="image"
    >

  {:else}
  
    <img
      src={image.url}
      alt={altText}
      title={image.title}
      width={width}
      height={height}
      srcset={image.responsiveImage.srcSet}
      sizes={image.responsiveImage.sizes}
      loading="lazy"
      class="image"
    >
  {/if}
</div>

<style lang="scss">
  @import './image.scss';
</style>