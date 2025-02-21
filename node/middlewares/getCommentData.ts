// Getting comment data from the Data Lake

import { returnErrorQuery } from '../middlewares/errorLogs'
import type { Comment } from '../middlewares/processCommentData'

export async function getCommentData(
  ctx: Context,
  next: () => Promise<Record<string, unknown>>
) {
  console.log('Running getCommentData')

  const dataQuery = ctx.clients.dataQuery

  const params = ctx.state.body
  const pagLimit = 1000
  let pagOffset = 0
  let totalSize = 1
  const dataLimit = 30000
  let data = []

  while (data.length < totalSize) {
    try{
      const dataQueryResponse: Comment[] = await dataQuery.fetchCommentData(pagLimit, pagOffset, params, ctx.request.headers.vtexidclientautcookie, ctx)

      for (const commentItem of dataQueryResponse) {
        data.push(commentItem)
      }

      totalSize = dataQueryResponse[0].total_records

      pagOffset = pagOffset + pagLimit
      if (totalSize >= dataLimit) {
        returnErrorQuery(params, 500, `Data limit (${dataLimit}) reached. Total number of ticket comments found: ${totalSize}. Try reducing the time interval or searching for a specific article URL.`, ctx)
        return
      }

    } catch (error) {
      returnErrorQuery(params, 500, `Error trying to get data from the DQAPI >>> ${error}`, ctx)
      console.log('error: '+error)
      return
    }
  }

  // Passing the data to the body to get it in other middlewares
  ctx.state.body = {
    articleData: data,
    queryParams: params
  }

  await next()
}
