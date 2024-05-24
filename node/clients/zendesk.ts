// The zendesk client is used to get comment information for each ticket.

import { ExternalClient, IOContext, InstanceOptions } from '@vtex/api'

const username = 'pedro.costa@vtex.com'
const password = 'MUZa7N_FcPyE'
const authValue = btoa(`${username}:${password}`)
const requestHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Basic ${authValue}`,
}

export default class ZendeskClient extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('https://vtexhelp1704480599.zendesk.com', ctx, {
      ...options,
      retries: 2,
      headers: requestHeaders,
    })
  }

  public async getComments(ticketId: string) {
    const url = `https://vtexhelp1704480599.zendesk.com/api/v2/tickets/${ticketId}/comments.json`

    return this.http.get(
      url,
      {
      headers: requestHeaders,
      }
    )
  }
}
