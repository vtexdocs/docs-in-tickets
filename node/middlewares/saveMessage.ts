// The saveMessage function gets the message data and saves it to our RedShift database.

const url = 'https://analytics.vtex.com/api/analytics/schemaless-events'
const requestHeaders = {
  'Content-Type': 'application/json',
}

export async function saveMessage(messageData: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.log('Running saveMessage')

  const response = await fetch(url, {
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify(messageData),
  })

  // eslint-disable-next-line no-console
  console.log(response.status)
}
