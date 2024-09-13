// Getting comment data from the Data Lake

import { returnErrorUrl } from '../middlewares/errorLogs'

export async function getCommentData(
  ctx: Context,
  next: () => Promise<Record<string, unknown>>
) {
  console.log('Running getCommentData')

  const dataQuery = ctx.clients.dataQuery

  const params = ctx.state.body
  try{
    const dataQueryResponse = await dataQuery.fetchCommentData(params, ctx.request.headers.vtexidclientautcookie)

    // Passing the data to the body to get it in other middlewares
    ctx.state.body = {
      articleData: dataQueryResponse,
      queryParams: params
    }

  } catch (error) {
    returnErrorUrl(params.articleUrl, 500, `Error trying to get article data from the DQAPI >>> ${error}`, ctx)
    console.log('error: '+error)
    return
  }

  await next()
}
