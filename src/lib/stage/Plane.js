import { Buffer } from './Buffer'
import { Program } from './Program'
import { vertexShaderSource, fragmentShaderSource } from './shaderSource'

function Plane({ gl, colors, vertices }) {
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
