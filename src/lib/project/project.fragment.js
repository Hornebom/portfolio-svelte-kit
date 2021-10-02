import structuredText from '$lib/structured-text/structured-text.fragment'
import image from '$lib/image/image.fragment.js'
import responsiveImage from '$lib/image/responsive-image.fragment.js'

const project = `
  _modelApiKey
  title
  text {
    ${structuredText}
  }
  url
  image {
    ${image}
    responsiveImage(imgixParams: {  fit: crop, w: 1177, h: 730, auto: format }) {
      ${responsiveImage}
    }
  }
`
export default project
