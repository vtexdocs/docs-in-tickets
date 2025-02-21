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

export async function returnErrorQuery(
  params: {
    startDate: string | string[],
    endDate: string | string[],
    containsHelpArticle?: string | string[],
    containsDevArticle?: string | string[],
    articleUrl?: string | string[]
  },
  status: number,
  errorMessage: string,
  ctx: Context
) {
  // Making sure the returned url is not between %%
  var urlToReturn: string | undefined
  if (params.articleUrl) {
    urlToReturn = params.articleUrl.slice(1, -1) as string
  } else {
    urlToReturn = params.articleUrl
  }
  const slack = ctx.clients.slack
  slack.sendLog(`Query: ${JSON.stringify({...params, articleUrl: urlToReturn})}\n${errorMessage}`, 'error')

  ctx.status = status
  ctx.response.body = {
    query: {
      ...params,
      articleUrl: urlToReturn
    },
    message: errorMessage
  }
}
