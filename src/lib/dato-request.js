async function datoRequest({ query, variables, fetch, token }) {
  const endpoint = 'https://graphql.datocms.com/preview'
  
  const data = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  })
    .then((response) => {
      if (response.status != 200) {
        throw new Error(`Invalid request (${response.status})`);
      } else {
        return response.json();
      }
    })
    .then((response) => {
      if (response.errors && response.errors.length) {
        throw new Error(response.errors[0].message);
      } else {
        return response.data;
      }
    });

  return data;
}

export default datoRequest
