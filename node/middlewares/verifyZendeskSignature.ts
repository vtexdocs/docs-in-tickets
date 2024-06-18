// Verifying that the request actually comes from Zendesk
// https://developer.zendesk.com/documentation/webhooks/verifying/#verifying-the-signature
import bodyParser from 'co-body'
import * as crypto from 'crypto'

const ZENDESK_SECRET_KEY = "sTrLIuJluacG6z7gfrHSwECq7Nw-RzFj6yGgGyOrR5w="
const SIGNING_SECRET_ALGORITHM = "sha256"

export async function verifyZendeskSignature (
  ctx: Context,
  next: () => Promise<Record<string, unknown>>
  ) {
  console.info('Running verifyZendeskSignature')

  // Determining whether the signature is compatible with the expected, according to the secret key provided by zendesk. This key is exclusive to this webhook.
  function isValidSignature(signature: string, body: string, timestamp: string): boolean {

    console.info('Running isValidSignature')
    let hmac = crypto.createHmac(SIGNING_SECRET_ALGORITHM, ZENDESK_SECRET_KEY)
    let sig = hmac.update(timestamp + body).digest('base64')
    const comparison = Buffer.compare(
      Buffer.from(signature, 'base64'),
      Buffer.from(sig.toString(), 'base64')
    )
    console.info(signature)
    console.info(sig)
    console.info(comparison)

    return (
       comparison === 0
    )
  }

  if (ctx.request.headers['x-zendesk-webhook-signature'] !== undefined) {
    const requestBody = await bodyParser(ctx.req, { returnRawBody: true })
    console.info('body >>> '+requestBody)
    const requestSignature: string = ctx.request.headers["x-zendesk-webhook-signature"] as string
    const requestSignatureTimestamp: string = ctx.request.headers["x-zendesk-webhook-signature-timestamp"] as string

    if (isValidSignature(requestSignature, requestBody.toString(), requestSignatureTimestamp)) {

      console.info('Zendesk signature verified successfully.')
      await next()

    } else {
      ctx.status = 400
      ctx.response.body = {
        message: 'Zendesk signature not valid.'
      }
      console.info('Zendesk signature not valid.')
      return
    }
  } else {
    ctx.status = 400
    ctx.response.body = {
      message: 'Zendesk signature not found.'
    }
    console.info('Zendesk signature not found')
    return
  }
}
