// The zendesk client is used to get comment information for each ticket.

import { ExternalClient, IOContext, InstanceOptions } from '@vtex/api'

// These are the real credentials
const username = '{secret}'
const token = '{secret}'
const authValue = btoa(`${username}/token:${token}`)

// Below are sandbox auth variables, just to facilitate debugging. Note that the authvalue format is different.
// const username = '{secret}'
// const token = '{secret}'
// const authValue = btoa(`${username}:${token}`)

const requestHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Basic ${authValue}`,
}

export default class ZendeskClient extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('https://vtexhelp.zendesk.com', ctx, {
      ...options,
      retries: 2,
      timeout: 2000,
      headers: requestHeaders,
    })
  }

  public async getComments(ticketId: string, page: number=1) {
    const url = `https://vtexhelp.zendesk.com/api/v2/tickets/${ticketId}/comments.json?page=${page}`

    return this.http.get(
      url,
      {
      headers: requestHeaders,
      }
    )
  }
}
