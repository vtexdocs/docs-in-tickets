// Returning and logging errors

export async function returnError(
  zendeskTicket: string,
  status: number,
  errorMessage: string,
  ctx: Context
) {

  const slack = ctx.clients.slack
  slack.sendLog(`ticket: ${zendeskTicket}\n${errorMessage}`, 'error')

  ctx.status = status
  ctx.response.body = {
    ticketId: zendeskTicket,
    message: errorMessage
  }
}
