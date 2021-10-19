{#if themes}
  <div 
    class="root {$$restProps.class || ''}"
    use:trapFocus={{ active: open, onEscape: closeMenu }}
  >
    {#if open}
      <span class="backdrop" on:click={() => open = !open} />
    {/if}
    
    <button
      role="button"
      class="toggle"
      aria-label={open ? 'Hide theme selector' : 'Show theme selector'}
      on:click={() => open = !open}
    />
    
    <ul 
      class:open 
      class="list" 
      aria-hidden={!open}
      role="list"
    >
      {#each Object.entries(_themes) as [ key, value ]}
        <li>
          <button 
            role="button" 
            class="theme-button"
            aria-label="Use color theme: {key}"
            on:click={() => themeHandler(key)}
            style="--theme: {colorToHex(value)}"
            data-theme-button
          />
        </li>
      {/each}
    </ul>
  </div>
{/if}

<script>
  import { getContext } from 'svelte'
  import { get } from 'svelte/store'
  import trapFocus from '$lib/actions/trap-focus'

  const themes = getContext('themes')
  const theme = getContext('theme')

  let open
  let _themes = get(themes)

  function themeHandler(key) {
    theme.set(key)
  }

  function closeMenu() {
    open = false
	}

  function colorToHex([r, g, b]) {
    const channels = [ r * 255, g * 255, b * 255]
      .map(x => parseInt(x))
      .map(x => {
        const hex = x.toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
    .join('')
    
    return `#${channels}`
  }
</script>

<style lang="scss">
  @import './themes.scss';
</style>
