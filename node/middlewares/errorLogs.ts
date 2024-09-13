// Returning and logging errors

export async function returnErrorTicket(
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

export async function returnErrorUrl(
  articleUrl: string | undefined,
  status: number,
  errorMessage: string,
  ctx: Context
) {
  // Making sure the returned url is not between %%
  var urlToReturn: string | undefined
  if (articleUrl) {
    urlToReturn = articleUrl.slice(1, -1)
  } else {
    urlToReturn = articleUrl
  }
  const slack = ctx.clients.slack
  slack.sendLog(`Article: ${urlToReturn}\n${errorMessage}`, 'error')

  ctx.status = status
  ctx.response.body = {
    article: urlToReturn,
    message: errorMessage
  }
}
