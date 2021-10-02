<script>
  export let image

  const width = image.format === 'svg' ? image.width : image.responsiveImage.width 
  const height = image.format === 'svg' ? image.height : image.responsiveImage.height 
  const altText = image.alt || ''
</script>

<div>
  <span
    style="padding-top: {height / width * 100}%"
  />

  {#if image.format === 'svg'}
    <img
      src={image.url}
      alt={altText}
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
    >
  {/if}
</div>