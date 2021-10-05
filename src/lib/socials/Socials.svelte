<script>
  import Icon from '$lib/icon/Icon.svelte'

  export let items
</script>

<ul class="root">
  {#each items as { key, title, url }}
    <li>
      <a 
        href={url} 
        aria-label={title} 
        target="_blank" 
        rel="noopener noreferrer"
        class="link"
      >
        <Icon name={key} />
      </a>
    </li>
  {/each}
</ul>

<style lang="scss">
  @import './socials.scss';
</style>