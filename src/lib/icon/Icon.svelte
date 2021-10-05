<script>
  import Twitter from './Twitter.svelte'
  import Github from './Github.svelte'
  import CodePen from './CodePen.svelte'
  import Linkedin from './Linkedin.svelte'

  export let name

  const icons = {
    'twitter': Twitter,
    'github': Github,
    'codepen': CodePen,
    'linkedin': Linkedin
  }
</script>

{#if icons[name]}
  <svelte:component this={icons[name]} />
{:else}
  <p>no icon of type {icons[name]}</p>
{/if}
