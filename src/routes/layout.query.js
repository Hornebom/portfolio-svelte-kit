const query = `
  query Navigation {
    navigation {
      links {
        slug
        title
      }
    }
    allSocials {
      key
      title
      url
    }
  }
`
export default query
