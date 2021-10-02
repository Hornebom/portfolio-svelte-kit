<script>
  import HeroMain from '$lib/hero-main/HeroMain.svelte'
  import HeroPage from '$lib/hero-page/HeroPage.svelte'
  import TextSection from '$lib/text-section/TextSection.svelte'
  import Project from '$lib/project/Project.svelte'
  
  export let sections

  const types = {
    'hero_main': HeroMain,
    'hero_page': HeroPage,
    'text_section': TextSection,
    'project': Project
  }
</script>

{#each sections as { _modelApiKey, ...rest }}
  {#if types[_modelApiKey]}
    <svelte:component this={types[_modelApiKey]} {...rest} />
  {:else}
    <p>No section of type: {_modelApiKey}</p>
  {/if}
{/each}
