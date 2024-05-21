// The processMessage function gets the ticket message from the context and formats its content to be saved in a database later.

import bodyParser from 'co-body'

export async function processTicket(
  ctx: Context,
  next: () => Promise<Record<string, unknown>>
) {
  console.info('Running processTicket')

  // const requestReceived = ctx.request
  const messageReceived = await bodyParser(ctx.req)

  console.info(messageReceived)
  console.info(typeof messageReceived)

  // const redshift = ctx.clients.redshift

  // const saveResponse = await redshift.saveMessage(messageReceived)

  console.info('saveResponse')
  // console.info(saveResponse)

  ctx.status = 200
  ctx.response.body = {
    mensagem: 'deu certo',
  }

  await next()
}
