import { initBuffer } from './initBuffer'
import { createProgram } from './createProgram'
import { vertexShaderSource, fragmentShaderSource } from './shaderSource'

function planeMesh(gl, colors) {

  const size = 1
  const segments = 30
  const padding = 0
  const unit = (size * 2 - padding * 2) / segments
  const vertices = []
  let x_start, x_end, y_start, y_end

  for(let i = 0; i < segments; i++) {
    x_start = -size + padding + unit * i
    x_end = x_start + unit
    
    for(let j = 0; j < segments; j++) {
      y_start = size - padding - unit * j
      y_end = y_start - unit

      vertices.push(
        // Triangle 1
        x_start, y_start, 
        x_end, y_start, 
        x_end, y_end,

        // Triangle 2
        x_start, y_start, 
        x_end, y_end, 
        x_start, y_end, 
      )
    }
    
  }

  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource)

  const vertexBuffer = initBuffer({
    gl, 
    program,
    data: vertices, 
    size: 2, 
    name: 'a_vertex', 
    mode: 'TRIANGLES' 
  })

  const colorPrimaryLocation = gl.getUniformLocation(program, "u_color_primary")
  const colorSecondaryLocation = gl.getUniformLocation(program, "u_color_secondary")
  const deltaLocation = gl.getUniformLocation(program, "u_delta")
  let delta = 0
  let direction = 1

  function render() {
    if(delta > 10) {
      direction = -1
    } else if(delta < 0) {
      direction = 1
    }
    delta += direction *  .005 // .001

    gl.useProgram(program)

    gl.uniform4fv(colorPrimaryLocation, colors.primary)
    gl.uniform4fv(colorSecondaryLocation, colors.secondary)

    gl.uniform1f(deltaLocation, delta + window.pageYOffset * .001)

    vertexBuffer.draw()
  }

  function updateUniformColors(newColors) {
    colors = newColors 
  }

  return { render, updateUniformColors }
}

export { planeMesh }
