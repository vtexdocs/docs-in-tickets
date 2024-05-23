// The processMessage function gets the ticket message from the context and formats its content to be saved in a database later.

import bodyParser from 'co-body'

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

  for (const comment of ticketComments.comments) {
    let urls = []
    let parsingArray = comment.html_body.split('href="')
    let parsingString = parsingArray[1]
    const id = comment.id

    if (typeof parsingString === 'undefined') {
      console.info('undefined')
      continue
    }

    console.info('Parsing comment: ' + id)
    while (parsingArray.length > 1) {
      console.info('loop')
      console.info('length ' + parsingArray.length)
      const parsedUrl = parsingArray[1].split('">')[0]

      urls.push(parsedUrl)
      parsingArray = parsingArray[2].split('href="')
      console.info('urls array')
      console.info(urls)
    }
  }

  ctx.status = 200
  ctx.response.body = {
    mensagem: 'ticket processado',
  }

  await next()
}
