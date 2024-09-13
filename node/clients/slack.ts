// sendLog sends a message to the slack channel #docs-in-tickets-logs.
// ref: https://api.slack.com/messaging/webhooks

import { ExternalClient } from '@vtex/api'
import type { IOContext, InstanceOptions } from '@vtex/api'

const url = 'https://hooks.slack.com/services/{secret}'
const requestHeaders = {
  'Content-Type': 'application/json',
}

export default class SlackClient extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super('https://hooks.slack.com', ctx, {
      ...options,
      retries: 2,
      timeout: 2000,
      headers: requestHeaders,
    })
  }

  public async sendLog(log: string, type: string) {

    const logTypeMap: { [key: string]: string} = {
      info: ':ms_information_3d:',
      warning: ':warning: *Warning*',
      error: ':error: *Error*'
    }
    const typeMarker = logTypeMap[type] || ''

    return this.http.post(
      url,
      {
        text: `${typeMarker}\n${log}`
      },
      {
        headers: requestHeaders,
      }
    )
  }
}
