import query from '../queries/slug.query.js'
import datoRequest from '$lib/utils/dato-request.js'

export async function get({ params }) {  
  const { slug } = params
  const { page } = await datoRequest({ query, variables: { slug } })

  if (page) {
    return { 
      body: { ...page }
    }
  }
 
  return {
    status: 404
  }
}
