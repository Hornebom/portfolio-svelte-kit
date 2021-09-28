const structuredText = `
  value
  links {
    ... on HomeRecord {
      id
      _modelApiKey
    }
    ... on PageRecord {
      id
      _modelApiKey
      slug
    }
  }
`

export default structuredText
