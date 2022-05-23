<div class="root" bind:this={container}>
  <canvas 
    bind:this={canvas}
    width={width}
    height={height}
    class="canvas"
  ></canvas>
</div>

<script>
  import { onMount } from 'svelte'
  import { Plane } from './Plane'
  import { getContext } from 'svelte'
  import VerticesWorker from './vertices-worker?worker'
  
	let container
	let canvas
  let width = 30
  let height = 30
  let resizeTimeout
  let colors
  let gl 
  let plane  

  const colorContext = getContext('colors')
  colorContext.subscribe(value => {
    colors = value

    if(plane) {
      plane.updateUniformColors(colors)
    }
  })

  onMount(() => {
		gl = canvas.getContext('webgl', {
      alpha: false
    })

    if (gl === null) {
      alert("Unable to initialize WebGL. Your browser or machine may not support it.")
      return
    }

    setSize(0)
    setViewport()
    let frame = requestAnimationFrame(loop)
    
    const worker = new VerticesWorker()
    worker.onmessage = ({ data }) => {
      plane = new Plane({ gl, colors, vertices: data })
      worker.terminate()
    }

		function loop(timeStamp) {
      if(width !== container.clientWidth || height !== container.clientHeight) {
        setSize()
      }
      setViewport()

      gl.clearColor(...colors.primary)
      gl.disable(gl.DEPTH_TEST)
      gl.clear(gl.COLOR_BUFFER_BIT)

      if(plane) {
        plane.render(timeStamp)
      }

      frame = requestAnimationFrame(loop)
		}

		return () => {
			cancelAnimationFrame(frame)
		}
	})

  function setSize(delay = 500) {
    if(resizeTimeout === undefined) {
      resizeTimeout = setTimeout(() => {
        width = container.clientWidth
        height = container.clientHeight
        resizeTimeout = undefined
      }, delay)
    }
  }

  function setViewport() {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  }
</script>

<style lang="scss">
  @import './stage.scss';
</style>
