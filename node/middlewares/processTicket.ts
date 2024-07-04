// The processMessage function gets the ticket message from the context and formats its content to be saved in a database later.

import { or } from 'ramda'

import type { MessageData } from '../clients/redshift'

// Defining URLs that will be used to parse and process the comment data
// Substrings to look for and to exclude
const helpUrlShort = 'help.vtex.com'
const devUrlShort = 'developers.vtex.com'
// URLs to exclude
const helpUrl = 'https://help.vtex.com'
const devUrl = 'https://developers.vtex.com'
const helpUrlSlash = 'https://help.vtex.com/'
const devUrlSlash = 'https://developers.vtex.com/'
const helpUrlHttp = 'http://help.vtex.com'
const devUrlHttp = 'http://developers.vtex.com'
const helpUrlSlashHttp = 'http://help.vtex.com/'
const devUrlSlashHttp = 'http://developers.vtex.com/'
const helpUrlShortSlash = 'help.vtex.com/'
const devUrlShortSlash = 'developers.vtex.com/'

export async function processTicket(
  ctx: Context,
  next: () => Promise<Record<string, unknown>>
) {
  console.info('Running processTicket')

  const requestBody = ctx.state.body
  console.info(requestBody)
  const zendeskTicket = requestBody.ticketId

  const zendesk = ctx.clients.zendesk
  const redshift = ctx.clients.redshift

  let allCommentsWithUrls = []
  let page = 1

  while (1==1) {
    const zendeskData = await zendesk.getComments(zendeskTicket, page)
    const ticketComments = zendeskData.comments
    const nextPage = zendeskData.next_page

    // Iterate over comments
    for (const comment of ticketComments) {
      // Get an array of all urls in the comment
      const allUrls = comment.html_body
        .split('href="')
        .slice(1)
        .map((x: string) => x.split('"')[0])

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
        .filter((url: string) => url !== helpUrlHttp)
        .filter((url: string) => url !== devUrlHttp)
        .filter((url: string) => url !== helpUrlSlashHttp)
        .filter((url: string) => url !== devUrlSlashHttp)

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

        allCommentsWithUrls.push(messageData)

        await redshift.saveMessage(messageData)
      }
    }

    if (nextPage == null) {
      break
    }

    page = page + 1
  }

  ctx.status = 200
  ctx.response.body = {
    message: 'ticket processed',
    docsUrlsData: allCommentsWithUrls,
  }
  console.info(allCommentsWithUrls)

  await next()
}
