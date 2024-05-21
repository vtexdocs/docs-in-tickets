// saveMessage gets the message data and saves it to our RedShift database.

import { InfraClient, IOContext, InstanceOptions } from '@vtex/api'

const url = 'https://analytics.vtex.com/api/analytics/schemaless-events'
const requestHeaders = {
  'Content-Type': 'application/json',
}

export default class RedshiftClient extends InfraClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('https://analytics.vtex.com', ctx, {
      ...options,
      retries: 2,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  public async saveMessage(messageData: Record<string, any>) {
    return this.http.post(url, messageData, {
      metric: 'save-ticket-message-doc-data',
      headers: requestHeaders,
    })
  }
}
