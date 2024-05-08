// The processMessage function gets the ticket message from the context and formats its content to be saved in a database later.

import bodyParser from 'co-body'
// import { saveMessage } from './saveMessage'

export async function processMessage (ctx: Context, next: () => Promise<any>) {

  console.info('Running processMessage')

  //const request = ctx.request
  const body = await bodyParser(ctx.req)

  console.info(body)

  // const response = await saveMessage(body)
  // console.info('response')
  // console.info(response)

  ctx.status = 200

  await next()

}
