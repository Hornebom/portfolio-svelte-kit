const size = 1
const segments = 30
const unit = (size * 2) / segments

const vertices = getVertices()
postMessage(vertices)

function getVertices() {
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

  return vertices
}
