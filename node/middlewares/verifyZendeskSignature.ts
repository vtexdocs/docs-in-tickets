// Verifying that the request actually comes from Zendesk
// https://developer.zendesk.com/documentation/webhooks/verifying/#verifying-the-signature
import bodyParser from 'co-body'
import * as crypto from 'crypto'

const ZENDESK_SECRET_KEY = 'Svsr2aAkNENHpOKgAey-Nd2BG-UeN5mvnmKXvExcpRg='
const SIGNING_SECRET_ALGORITHM = 'sha256'

export async function verifyZendeskSignature (
  ctx: Context,
  next: () => Promise<Record<string, unknown>>
  ) {
  console.info('Running verifyZendeskSignature')

  const requestBody = await bodyParser(ctx.req)
  const requestSignature = ctx.request.headers.x-zendesk-webhook-signature
  const requestSignatureTimestamp = ctx.request.headers.x-zendesk-webhook-signature-timestamp
  console.info('zendesk signature')
  console.info(requestSignature)
  console.info('zendesk signature timestamp')
  console.info(requestSignatureTimestamp)

  function isValidSignature(signature: string, body: string, timestamp: string): boolean {

    const hmac = crypto.createHmac(SIGNING_SECRET_ALGORITHM, ZENDESK_SECRET_KEY)
    const sig = hmac.update(timestamp + body).digest('base64')

    return (
      Buffer.compare(
        Buffer.from(signature, 'base64'),
        Buffer.from(sig, 'base64')
      ) === 0
    )
  }

  if (!(isValidSignature(requestSignature, requestBody, requestSignatureTimestamp))) {
    ctx.status = 400
    ctx.response.body = {
      message: 'Zendesk signature not found or not valid.'
    }
  }

  await next()
}
