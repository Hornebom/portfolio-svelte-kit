const query = `
  query Page($slug: String) {
    page(filter: {slug: {eq: $slug}}) {
      title
    }
  }
`
export default query
