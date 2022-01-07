import { Buffer } from './Buffer'
import { Program } from './Program'
import { vertexShaderSource, fragmentShaderSource } from './shaderSource'

function Plane(gl, colors) {

  const size = 1
  const segments = 30
  const unit = (size * 2) / segments
  const vertices = []
  let x_start, x_end, y_start, y_end

  for(let i = 0; i < segments; i++) {
    x_start = -size + unit * i
    x_end = x_start + unit
    
    for(let j = 0; j < segments; j++) {
      y_start = size - unit * j
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

  const { program } = new Program(gl, vertexShaderSource, fragmentShaderSource)

  const buffer = new Buffer({
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
  const offsetLocation = gl.getUniformLocation(program, "u_offset")

  this.render = (delta) => {
    gl.useProgram(program)

    gl.uniform4fv(colorPrimaryLocation, colors.primary)
    gl.uniform4fv(colorSecondaryLocation, colors.secondary)

    gl.uniform1f(deltaLocation, delta * .0003)
    gl.uniform1f(offsetLocation, window.pageYOffset * -.0005)

    buffer.draw()
  }

  this.updateUniformColors = (newColors) => {
    colors = newColors 
  }
}

export { Plane }
