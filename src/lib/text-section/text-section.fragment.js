import structuredText from '$lib/structured-text/structured-text.fragment'

const textSection = `
  _modelApiKey
  title
  columnLeft {
    ${structuredText}
  }
  columnRight {
    ${structuredText}
  }
`

export default textSection
