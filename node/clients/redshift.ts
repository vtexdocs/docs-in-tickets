// saveMessage gets the message data and saves it to our RedShift database.

import { ExternalClient } from '@vtex/api'
import type { IOContext, InstanceOptions } from '@vtex/api'

const url = 'https://rc.vtex.com/api/analytics/schemaless-events'
const requestHeaders = {
  'Content-Type': 'application/json',
}

export interface MessageData {
  ticketId: string
  commentId: number
  authorId: number
  createdAt: string
  containsHelpArticle: boolean
  containsDevArticle: boolean
  numberOfDocsPortalsUrls: number
  docsPortalsUrls: string[]
  numberOfArticleUrls: number
  articleUrls: string[]
}

export default class RedshiftClient extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('https://rc.vtex.com', ctx, {
      ...options,
      retries: 2,
      timeout: 2000,
      headers: requestHeaders,
    })
  }

  public async saveMessage(messageData: MessageData) {

    return this.http.post(
      url,
      {
        name: 'support-ticket-messages',
        description: 'Information about a support ticket message containing documentation links.',
        account: 'vtexhelp',
        fields: messageData,
      },
      {
        headers: requestHeaders,
      }
    )
  }
}
