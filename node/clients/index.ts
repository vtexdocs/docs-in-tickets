import { IOClients } from '@vtex/api'

import RedshiftClient from './redshift'
import ZendeskClient from './zendesk'
import SlackClient from './slack'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get redshift() {
    return this.getOrSet('redshift', RedshiftClient)
  }

  public get zendesk() {
    return this.getOrSet('zendesk', ZendeskClient)
  }

  public get slack() {
    return this.getOrSet('slack', SlackClient)
  }
}
