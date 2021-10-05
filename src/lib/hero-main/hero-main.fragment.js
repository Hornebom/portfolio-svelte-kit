import structuredText from '$lib/structured-text/structured-text.fragment'
import socials from '$lib/socials/socials.fragment'

const heroMain = `
  _modelApiKey
  title
  text {
    ${structuredText}
  }
  socials {
    ${socials}
  }
`

export default heroMain
