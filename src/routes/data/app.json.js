import query from '../queries/app.query.js'
import datoRequest from '$lib/utils/dato-request.js'

export async function get() {
  const { navigation, allSocials } = await datoRequest({ query })

  if (navigation && allSocials) {
    return { 
      body: { navigation, socials: allSocials }
    }
  }
 
  return {
    status: 404
  }
}
