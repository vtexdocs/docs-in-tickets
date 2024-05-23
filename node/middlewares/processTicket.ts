// The processMessage function gets the ticket message from the context and formats its content to be saved in a database later.

import bodyParser from 'co-body'
import { or } from 'ramda'

export async function processTicket(
  ctx: Context,
  next: () => Promise<Record<string, unknown>>
) {
  console.info('Running processTicket')

  // const requestReceived = ctx.request
  const requestBody = await bodyParser(ctx.req)
  const ticketId = requestBody.ticketId

  console.info('Ticket ID: ')
  console.info(ticketId)

  const zendesk = ctx.clients.zendesk

  const ticketComments = await zendesk.getComments(ticketId)

  // Iterate over comments
  for (const comment of ticketComments.comments) {
    // Get an array of all urls in the comment
    const allUrls = comment.html_body
      .split('href="')
      .slice(1)
      .map((x: string) => x.split('">')[0])

    let docUrls = []

    // Substrings to look for and to exclude
    const helpUrl = 'https://help.vtex.com/'
    const devUrl = 'https://developers.vtex.com/'
    // URLs to exclude
    const helpUrlNoSlash = 'https://help.vtex.com'
    const devUrlNoSlash = 'https://developers.vtex.com'

    // Select only public docs articles
    for (const url of allUrls) {
      console.info(url)
      if (or(url.includes(helpUrl), url.includes(devUrl))) {
        console.info('yep')
        docUrls.push(url)
      } else {
        console.info('nope')
      }
    }

    console.info(docUrls)
  }

  ctx.status = 200
  ctx.response.body = {
    mensagem: 'ticket processado',
  }

  await next()
}
