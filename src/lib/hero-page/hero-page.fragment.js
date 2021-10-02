import structuredText from '$lib/structured-text/structured-text.fragment'

const heroPage = `
  _modelApiKey
  title
  text {
    ${structuredText}
  }
`

export default heroPage
