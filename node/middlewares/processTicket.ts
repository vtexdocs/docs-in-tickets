// The processMessage function gets the ticket message from the context and formats its content to be saved in a database later.

import bodyParser from 'co-body'
import { or } from 'ramda'

// Defining MessageData type, to send data to Redshift
interface MessageData {
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

// Defining URLs that will be used to parse and process the comment data
// Substrings to look for and to exclude
const helpUrlShort = 'help.vtex.com'
const devUrlShort = 'developers.vtex.com'
// URLs to exclude
const helpUrl = 'https://help.vtex.com'
const devUrl = 'https://developers.vtex.com'
const helpUrlSlash = 'https://help.vtex.com/'
const devUrlSlash = 'https://developers.vtex.com/'
const helpUrlShortSlash = 'help.vtex.com/'
const devUrlShortSlash = 'developers.vtex.com/'

export async function processTicket(
  ctx: Context,
  next: () => Promise<Record<string, unknown>>
) {
  console.info('Running processTicket')

  // const requestReceived = ctx.request
  const requestBody = await bodyParser(ctx.req)
  const zendeskTicket = requestBody.ticketId

  console.info('Ticket ID: ')
  console.info(zendeskTicket)

  const zendesk = ctx.clients.zendesk

  const ticketComments = await zendesk.getComments(zendeskTicket)

  // Iterate over comments
  for (const comment of ticketComments.comments) {
    // Get an array of all urls in the comment
    const allUrls = comment.html_body
      .split('href="')
      .slice(1)
      .map((x: string) => x.split('">')[0])

    let vtexPortalsUrls = []

    // Select only urls from our public docs portals
    for (const url of allUrls) {
      if (or(url.includes(helpUrlShort), url.includes(devUrlShort))) {
        vtexPortalsUrls.push(url)
      }
    }

    // Generating new array that does not contain the portals' homepages
    const docUrls = vtexPortalsUrls
      .filter((url: string) => url !== helpUrl)
      .filter((url: string) => url !== devUrl)
      .filter((url: string) => url !== helpUrlSlash)
      .filter((url: string) => url !== devUrlSlash)
      .filter((url: string) => url !== helpUrlShort)
      .filter((url: string) => url !== devUrlShort)
      .filter((url: string) => url !== helpUrlShortSlash)
      .filter((url: string) => url !== devUrlShortSlash)

    // Checking to see which portals the articles pertain to
    const hasHelpArticle = docUrls.some((url: string) =>
      url.includes(helpUrlShort)
    )

    const hasDevArticle = docUrls.some((url: string) =>
      url.includes(devUrlShort)
    )

    if (vtexPortalsUrls.length > 0) {
      // Assemble messageData body that will be saved to Redshift
      const messageData: MessageData = {
        ticketId: zendeskTicket,
        commentId: comment.id,
        authorId: comment.author_id,
        createdAt: comment.created_at,
        containsHelpArticle: hasHelpArticle,
        containsDevArticle: hasDevArticle,
        numberOfDocsPortalsUrls: vtexPortalsUrls.length,
        docsPortalsUrls: vtexPortalsUrls,
        numberOfArticleUrls: docUrls.length,
        articleUrls: docUrls,
      }

      console.info(messageData)
    }
  }

  ctx.status = 200
  ctx.response.body = {
    mensagem: 'ticket processado',
  }

  await next()
}
