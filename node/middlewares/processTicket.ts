// The processMessage function gets the ticket message from the context and formats its content to be saved in a database later.

import { or } from 'ramda'

import type { MessageData } from '../clients/redshift'
import { returnErrorTicket } from './errorLogs'

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
const helpAnnouncements = 'https://help.vtex.com/announcements'
const helpAnnouncementsSlash = 'https://help.vtex.com/announcements'
const helpAnnouncementsShort = 'help.vtex.com/announcements'
const helpAnnouncementsShortSlash = 'https://help.vtex.com/announcements'
const helpAnnouncementsPt = 'https://help.vtex.com/pt/announcements'
const helpAnnouncementsSlashPt = 'https://help.vtex.com/pt/announcements'
const helpAnnouncementsShortPt = 'help.vtex.com/pt/announcements'
const helpAnnouncementsShortSlashPt = 'https://help.vtex.com/pt/announcements'
const helpAnnouncementsEn = 'https://help.vtex.com/en/announcements'
const helpAnnouncementsSlashEn = 'https://help.vtex.com/en/announcements'
const helpAnnouncementsShortEn = 'help.vtex.com/en/announcements'
const helpAnnouncementsShortSlashEn = 'https://help.vtex.com/en/announcements'
const helpAnnouncementsEs = 'https://help.vtex.com/es/announcements'
const helpAnnouncementsSlashEs = 'https://help.vtex.com/es/announcements'
const helpAnnouncementsShortEs = 'help.vtex.com/es/announcements'
const helpAnnouncementsShortSlashEs = 'https://help.vtex.com/es/announcements'

export async function processTicket(
  ctx: Context,
  next: () => Promise<Record<string, unknown>>
) {
  console.log('Running processTicket')

  const requestBody = ctx.state.body
  const zendeskTicket = requestBody.ticketId

  const zendesk = ctx.clients.zendesk
  const redshift = ctx.clients.redshift

  let allCommentsWithUrls = []
  let page = 1
  interface Comment {
    html_body: string,
    id: number,
    author_id: number,
    created_at: string
  }
  let ticketComments: Array<Comment>
  let nextPage: number

  while (1==1) {

    try {
      const zendeskData = await zendesk.getComments(zendeskTicket, page)
      ticketComments = zendeskData.comments
      nextPage = zendeskData.next_page
    } catch (error) {
      returnErrorTicket(zendeskTicket, 500, `Error trying to get ticket data from Zendesk >>> ${error}`, ctx)
      return
    }

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
        .filter((url: string) => url !== helpAnnouncements)
        .filter((url: string) => url !== helpAnnouncementsSlash)
        .filter((url: string) => url !== helpAnnouncementsShort)
        .filter((url: string) => url !== helpAnnouncementsShortSlash)
        .filter((url: string) => url !== helpAnnouncementsPt)
        .filter((url: string) => url !== helpAnnouncementsSlashPt)
        .filter((url: string) => url !== helpAnnouncementsShortPt)
        .filter((url: string) => url !== helpAnnouncementsShortSlashPt)
        .filter((url: string) => url !== helpAnnouncementsEn)
        .filter((url: string) => url !== helpAnnouncementsSlashEn)
        .filter((url: string) => url !== helpAnnouncementsShortEn)
        .filter((url: string) => url !== helpAnnouncementsShortSlashEn)
        .filter((url: string) => url !== helpAnnouncementsEs)
        .filter((url: string) => url !== helpAnnouncementsSlashEs)
        .filter((url: string) => url !== helpAnnouncementsShortEs)
        .filter((url: string) => url !== helpAnnouncementsShortSlashEs)

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

        try {
          // console.log('try redshift')
          await redshift.saveMessage(messageData)
          console.log(messageData.numberOfArticleUrls)
        } catch (error) {
          returnErrorTicket(zendeskTicket, 500, `Error trying to save comment data to RedShift >>> ${error}`, ctx)
        }
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

  console.log(`comments processed: ${allCommentsWithUrls.length}`)
  console.log('processTicket done')

  await next()
}
