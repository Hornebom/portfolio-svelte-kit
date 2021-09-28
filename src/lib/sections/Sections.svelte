<script>
  import HeroMain from '$lib/hero-main/HeroMain.svelte'
  import TextSection from '$lib/text-section/TextSection.svelte'
  
  export let sections

  const types = {
    'hero_main': HeroMain,
    'text_section': TextSection
  }
</script>

{#each sections as { _modelApiKey, ...rest }}
  {#if types[_modelApiKey]}
    <svelte:component this={types[_modelApiKey]} {...rest} />
  {:else}
    <p>No section of type: {_modelApiKey}</p>
  {/if}
{/each}
