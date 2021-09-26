import seoMeta from '$lib/seo-head/seo-meta.fragment'

const query = `
  query Page($slug: String) {
    page(filter: {slug: {eq: $slug}}) {
      title
      ${seoMeta}
    }
  }
`
export default query
