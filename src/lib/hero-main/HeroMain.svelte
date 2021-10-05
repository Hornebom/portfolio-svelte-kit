<script>
  import StructuredText from '$lib/structured-text/StructuredText.svelte'
  import Socials from '$lib/socials/Socials.svelte'
  
  export let title
  export let text
  export let socials

  $: titleInnerText = title.replace(/(<p>)/igm, '').replace(/<\/p>/igm, '')
</script>

<section class="gl-section root">
  <div class="gl-container gl-container--xlarge">
    <h1 class="title typo-bold">
      {@html titleInnerText}
    </h1>

    <div class="content">
      {#if text}
        <div class="text">
          <StructuredText text={text} />
        </div>
      {/if}
      
      {#if socials}
        <Socials items={socials} />
      {/if}
    <div>
  </div>
</section>

<style lang="scss">
  @import './hero-main.scss';
</style>