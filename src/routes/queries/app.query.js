import socials from '$lib/socials/socials.fragment'

const query = `
  query App {
    navigation {
      links {
        slug
        title
      }
    }
    allSocials {
      ${socials}
    }
  }
`
export default query
