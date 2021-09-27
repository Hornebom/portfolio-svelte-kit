<script>
  export let seo = {}
  export let slug = ''

  const title = seo.title || 'Hornebom'
  const description = seo.description || 'Portfolio of Hornebom, frontend and creative developer, based in Rotterdam, The Netherlands.'
</script>

<svelte:head>
  <title>{title}</title>

  <meta 
    key="og:title" 
    property="og:title" 
    name="twitter:title" 
    content={title} 
  />

  <meta 
    key="og:type" 
    property="og:type" 
    content="website" 
  />

  <meta 
    key="description" 
    name="description" 
    content={description} 
  />
  <meta 
    key="og:description" 
    property="og:description" 
    name="twitter:description" 
    content={description} 
  />

  {#if seo && seo.image && seo.image.responsiveImage}
    <meta 
      key="og:image" 
      property="og:image" 
      content={ `${seo.image.responsiveImage.src}?auto=format&fm=jpg&auto=quality` }
    />
    
    <meta 
      key="og:image:width" 
      property="og:image:width" 
      content={ `${seo.image.responsiveImage.width}` }
    />
    
    <meta 
      key="og:image:height" 
      property="og:image:height" 
      content={ `${seo.image.responsiveImage.height}` } 
    />
  {/if}

  <meta 
    key="og:url" 
    property="og:url" 
    content={`https://www.hornebom.com/${slug ? slug : ''}`} 
  />

  <meta 
    key="twitter:card" 
    name="twitter:card" 
    content={ seo && seo.twitterCard || 'summary_large_image' } 
  />
</svelte:head>
