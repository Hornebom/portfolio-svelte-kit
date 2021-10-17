import { snoise } from './snoise.js'

const vertexShaderSource = `
  ${snoise}
  attribute vec4 a_vertex;
  
  uniform vec4 u_color_primary;
  uniform vec4 u_color_secondary;

  uniform float u_delta;

  varying vec4 v_color;

  vec4 noiseColor(vec4 color_1, vec4 color_2) {
    vec4 seed = vec4(-.5) + color_1 * vec4( vec3(2.), 1.);
    seed = mix(seed, a_vertex, .5);
    float noise = snoise( vec3(seed.xyz) + vec3(0.0, 0.0, u_delta));
    
    return mix(color_1, color_2, noise);
  }

  void main() {
    v_color = noiseColor(u_color_primary, u_color_secondary);

    gl_Position = a_vertex;
  }
`
const fragmentShaderSource = `
  precision mediump float;

  varying vec4 v_color;

  void main() {
    gl_FragColor = v_color;
  }
`

export { vertexShaderSource, fragmentShaderSource }
