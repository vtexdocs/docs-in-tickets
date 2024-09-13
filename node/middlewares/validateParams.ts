// Getting params and validating them

import { fetchCommentsParams } from '../clients/dataQuery'
import { returnErrorUrl } from './errorLogs'
// import { returnErrorUrl } from '../middlewares/errorLogs'

// Date validation function
function isValidDate(date: string): boolean {

  // Regular expression to match yyyy-mm-dd format
  const regex = /^\d{4}-\d{2}-\d{2}$/

  // Check if the string matches the format
  if (!regex.test(date)) {
    return false
  }

  // Check date basic attributes
  const year = parseInt(date.split('-')[0])
  if (year<2010) {
    return false
  }

  const month = parseInt(date.split('-')[1])
  if (month>12) {
    return false
  }

  const day = parseInt(date.split('-')[2])
  if (day>31) {
    return false
  }

  return true
}

export async function validateParams(
  ctx: Context,
  next: () => Promise<Record<string, unknown>>
) {
  console.log('Running validateParams')

  // Getting params from querystring
  const receivedQueryStrings = ctx.request.query

  // Making sure the article url is either a string between %% or undefined
  const receivedArticleUrl = receivedQueryStrings.articleUrl !== undefined
    ? `%${receivedQueryStrings.articleUrl}%`
    : undefined

  // Validate dates
  const receivedStartDate = JSON.stringify(receivedQueryStrings.startDate).replace(/"/g, '')
  if (!isValidDate(receivedStartDate)) {
    returnErrorUrl(receivedArticleUrl, 500, `${receivedStartDate} is not a valid startDate value. Use the format yyyy-mm-dd.`, ctx)
    return
  }

  const receivedEndDate = JSON.stringify(receivedQueryStrings.endDate).replace(/"/g, '')
  if (!isValidDate(receivedEndDate)) {
    returnErrorUrl(receivedArticleUrl, 500, `${receivedEndDate} is not a valid endDate value. Use the format yyyy-mm-dd.`, ctx)
    return
  }

  // Validate boolean params
  const receivedContainsHelpArticle = receivedQueryStrings.containsHelpArticle
  if (receivedContainsHelpArticle && !(receivedContainsHelpArticle == 'true' || receivedContainsHelpArticle == 'false')) {
    returnErrorUrl(receivedArticleUrl, 500, `${receivedContainsHelpArticle} is not a valid containsHelpArticle value. Use true or false.`, ctx)
    return
  }


  const receivedContainsDevArticle = receivedQueryStrings.containsDevArticle
  if (receivedContainsDevArticle && !(receivedContainsDevArticle == 'true' || receivedContainsDevArticle == 'false')) {
    returnErrorUrl(receivedArticleUrl, 500, `${receivedContainsDevArticle} is not a valid containsDevArticle value. Use true or false.`, ctx)
    return
  }

  // Assembling params
  const params: fetchCommentsParams = {
    startDate: receivedStartDate,
    endDate: receivedEndDate,
    containsHelpArticle: receivedContainsHelpArticle,
    containsDevArticle: receivedContainsDevArticle,
    articleUrl: receivedArticleUrl
  }

  // Passing the params to the state body to get it in other middlewares
  ctx.state.body = params

  await next()
}
