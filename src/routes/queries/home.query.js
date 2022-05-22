import seoMeta from '$lib/seo-head/seo-meta.fragment'
import heroMain from '$lib/hero-main/hero-main.fragment'
import textSection from '$lib/text-section/text-section.fragment'

const query = `
  query Home {
    home {
      title
      ${seoMeta}
      sections {
        ...on HeroMainRecord {
          ${heroMain}
        }
        ...on TextSectionRecord {
          ${textSection}
        }
      }
    }
  }
`
export default query
