import { snoise } from './snoise.js'

const vertexShaderSource = `
  attribute vec4 a_vertex;
  varying vec4 v_vertex;

  void main() {
    v_vertex = a_vertex;

    gl_Position = a_vertex;
  }
`
const fragmentShaderSource = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
  #else
    precision mediump float;
  #endif

  ${snoise}

  uniform vec4 u_color_primary;
  uniform vec4 u_color_secondary;
  uniform float u_delta;
  uniform float u_offset;
  uniform float u_opacity;

  varying vec4 v_vertex;

  vec4 noiseColor(vec4 color_1, vec4 color_2) {
    vec4 seed = vec4(vec3(u_delta * .1), 1.);
    seed = mix(seed, v_vertex, .5);
    float noise = snoise( vec3(seed.xyz) + vec3(0.0, u_offset, u_delta));
    
    return mix(color_1, color_2, noise * u_opacity);
  }

  void main() {
    vec4 color = noiseColor(u_color_primary, u_color_secondary);
    gl_FragColor = color;
  }
`

export { vertexShaderSource, fragmentShaderSource }
