import { IOClients } from '@vtex/api'

import RedshiftClient from './redshift'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get redshift() {
    return this.getOrSet('redshift', RedshiftClient)
  }
}
