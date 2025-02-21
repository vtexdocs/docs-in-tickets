// getCommentData fetches Zendesk comment data from the data lake via Data Query API.
// https://internal-docs.vtex.com/Analytics/VTEX-Data-Platform/data-query-API/
// DQAPI Metric:
// https://github.com/vtex/analytics-platform/blob/main/lambdas/functions/data_consumption_entrypoint_v2/metrics/docs-in-tickets.yaml

import { ExternalClient } from '@vtex/api'
import type { IOContext, InstanceOptions } from '@vtex/api'
import { returnErrorQuery } from '../middlewares/errorLogs'

// These types must be `string | string[]` because technically querystrings can be arrays of strings. But we plan to deal only with simple strings.
export interface fetchCommentsParams {
  startDate: string | string[],
  endDate: string | string[],
  containsHelpArticle?: string | string[],
  containsDevArticle?: string | string[],
  articleUrl?: string | string[]
}

export default class DataQueryClient extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(`http://data-consumption.vtex.com`, ctx, {
      ...options,
      retries: 4,
      timeout: 8000
    })
  }

  public async fetchCommentData (
    pagLimit: number,
    pagOffset: number,
    params: fetchCommentsParams,
    token: string | undefined | string[],
    ctx: Context
    ) {

    // Assembling URL considering optional query params
    var queryParams = `an=vtexhelp&startDate=${params.startDate}&endDate=${params.endDate}&limit=${pagLimit}&offset=${pagOffset}`

    if (params.containsHelpArticle) {
      queryParams = `${queryParams}&contains_help_article=${params.containsHelpArticle}`
    }
    if (params.containsDevArticle) {
      queryParams = `${queryParams}&contains_dev_article=${params.containsDevArticle}`
    }
    if (params.articleUrl) {
      queryParams = `${queryParams}&article_url=${params.articleUrl}`
    }

    const url = `http://data-consumption.vtex.com/api/analytics/consumption/docs-in-tickets?${queryParams}`

    // Making the request
    try {
      const dataQuery = await this.http.get(url, {
        headers: {
          'cookie': `VtexIdclientAutCookie=${token}`
        }
      })

      return dataQuery

    } catch (error) {
      returnErrorQuery(params, 500, `Error trying to get data from the DQAPI.\nQuery: ${params}\nError: ${error}`, ctx)
      console.log('error: '+error)
      throw error
    }
  }
}
