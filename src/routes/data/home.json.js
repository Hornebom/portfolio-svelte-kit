import query from '../queries/home.query.js'
import datoRequest from '$lib/utils/dato-request.js'

export async function get() {
  const { home } = await datoRequest({ query })
 
  if (home) {
    return { body: home }
  }
 
  return {
    status: 404
  }
}