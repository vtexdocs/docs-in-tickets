// Getting comment data from the Data Lake

interface Comment {
  ticketid: string
  commentid: number
  authorid: number
  createdat: string
  containshelparticle: boolean
  containsdevarticle: boolean
  numberofdocsportalsurls: number
  docsportalsurls: string[]
  numberofarticleurls: number
  articleurls: string[]
}

export async function processCommentData(
  ctx: Context,
  next: () => Promise<Record<string, unknown>>
) {
  console.log('Running processUniqueTicketIds')

  const articleData = ctx.state.body.articleData

  // Get unique tickets
  const uniqueTicketIds = [...new Set(articleData.map((item: Comment) => item.ticketid))];

  // Calculate number of tickets comments given that "empty" means an empty object in the array and still counts as 1.
  var numberOfComments = 0
  var numberOfTickets
  if (articleData[0].ticketid) {
    numberOfComments = articleData.length
    numberOfTickets = uniqueTicketIds.length
  }

  // Set a max quantity and return a sample of the comments. The goal is to set up pagination to return all results, but first we must set up pagination in the DQAPI metric.
  const sampleSize = 20
  var sampleQuantity = 0
  var sampleData: Comment[] = []
  if (numberOfComments > sampleSize) {
    sampleQuantity = sampleSize,
    sampleData = articleData.slice(0,sampleSize)
  } else {
    sampleQuantity = numberOfComments,
    sampleData = articleData
  }

  // Assembling response

  // Making sure the returned url is not between %%
  const queryParams = ctx.state.body.queryParams
  var urlToReturn: string | undefined
  if (queryParams.articleUrl) {
    urlToReturn = queryParams.articleUrl.slice(1, -1)
  } else {
    urlToReturn = queryParams.articleUrl
  }

  ctx.status = 200
  ctx.response.body = {
    query: {
      startDate: queryParams.startDate,
      endDate: queryParams.endDate,
      containsHelpArticle: queryParams.containsHelpArticle,
      containsDevArticle: queryParams.containsDevArticle,
      articleUrl: urlToReturn
    },
    tickets : {
      quantity: numberOfTickets,
      ids: uniqueTicketIds,
    },
    comments: {
      quantity: numberOfComments,
      sample: {
        quantity: sampleQuantity,
        data: sampleData
      }
    }
  }
  await next()
}
