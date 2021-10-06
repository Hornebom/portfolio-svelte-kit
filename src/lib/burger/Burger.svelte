<script>
  export let clickHandler = () => {}
  export let open
</script>

<button 
  on:click={clickHandler} 
  aria-label={open ? 'Close navigation' : 'Open navigation'}
  class="root {$$restProps.class || ''}"
  class:open={open}
/>

<style lang="scss">
  @import './burger.scss';
</style>
