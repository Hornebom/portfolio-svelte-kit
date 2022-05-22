async function loadData(fetch, endpoint) {
  const response = await fetch(endpoint)
  const data = await response.json()

  return {
    props: { data }
  }
}

export default loadData
