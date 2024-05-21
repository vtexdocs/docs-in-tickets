// The processMessage function gets the ticket message from the context and formats its content to be saved in a database later.

import bodyParser from 'co-body'

export async function processTicket(
  ctx: Context,
  next: () => Promise<Record<string, unknown>>
) {
  console.info('Running processTicket')

  // const requestReceived = ctx.request
  const ticketId = await bodyParser(ctx.req)

  console.info(ticketId)
  console.info(typeof ticketId)

  ctx.status = 200
  ctx.response.body = {
    mensagem: 'ticket id recebido',
  }

  await next()
}
