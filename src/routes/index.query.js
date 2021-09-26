import seoMeta from '$lib/seo-head/seo-meta.fragment'

const query = `
  query Home {
    home {
      title
      ${seoMeta}
    }
  }
`
export default query
