// Verifying that the request actually comes from Zendesk
// https://developer.zendesk.com/documentation/webhooks/verifying/#verifying-the-signature
import bodyParser from 'co-body'
import * as crypto from 'crypto'
import { returnError } from './errorLogs'

const ZENDESK_SECRET_KEY_PRODUCTION = "xxxxxxxxxx"
const ZENDESK_SECRET_KEY_SANDBOX = "xxxxxxxxxx"
const SIGNING_SECRET_ALGORITHM = "sha256"

export async function verifyZendeskSignature (
  ctx: Context,
  next: () => Promise<Record<string, unknown>>
  ) {
  console.info('Running verifyZendeskSignature')

  // Determining whether the signature is compatible with the expected, according to the secret key provided by zendesk. This key is exclusive to this webhook.
  function isValidSignature(signature: string, body: object, timestamp: string, key: string): boolean {

    console.info('Running isValidSignature')
    let hmac = crypto.createHmac(SIGNING_SECRET_ALGORITHM, key)
    let sig = hmac.update(timestamp + body).digest('base64')
    const comparison = Buffer.compare(
      Buffer.from(signature, 'base64'),
      Buffer.from(sig.toString(), 'base64')
    )

    return (comparison === 0)
  }

  const requestBody = await bodyParser(ctx.req, { returnRawBody: true })
  ctx.state.body = requestBody.parsed
  console.log(requestBody.parsed.ticketId)

  if (requestBody.parsed.ticketId == undefined) {
    returnError('undefined', 400, 'ticketId not found.', ctx)
  }

  const zendeskTicket = requestBody.parsed.ticketId

  if (ctx.request.headers['x-zendesk-webhook-signature'] !== undefined) {

    const requestSignature: string = ctx.request.headers["x-zendesk-webhook-signature"] as string
    const requestSignatureTimestamp: string = ctx.request.headers["x-zendesk-webhook-signature-timestamp"] as string

    if (isValidSignature(requestSignature, requestBody.raw, requestSignatureTimestamp, ZENDESK_SECRET_KEY_PRODUCTION)) {

      // console.info('Zendesk production signature verified successfully.')
      await next()

    } else {

      if (isValidSignature(requestSignature, requestBody.raw, requestSignatureTimestamp, ZENDESK_SECRET_KEY_SANDBOX)) {

      // console.info('Zendesk sandbox signature verified successfully.')
      await next()

      } else {
      returnError(zendeskTicket, 400, 'Zendesk signature not valid.', ctx)
      return
      }

    }
  } else {
    returnError(zendeskTicket, 400, `Zendesk signature not found.`, ctx)
    return
  }
}
