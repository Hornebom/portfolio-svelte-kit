import seoMeta from '$lib/seo-head/seo-meta.fragment'
import heroPage from '$lib/hero-page/hero-page.fragment'
import project from '$lib/project/project.fragment'
import textSection from '$lib/text-section/text-section.fragment'

const query = `
  query Page($slug: String) {
    page(filter: {slug: {eq: $slug}}) {
      title
      ${seoMeta}
      sections {
        ...on HeroPageRecord {
          ${heroPage}
        }
        ...on ProjectRecord {
          ${project}
        }
        ...on TextSectionRecord {
          ${textSection}
        }
      }
    }
  }
`
export default query
