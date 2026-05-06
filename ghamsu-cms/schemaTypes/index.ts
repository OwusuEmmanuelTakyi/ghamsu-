import event from './event'
import author from './author'
import blog from './blog'
import sermon from './sermon'
import { testimonial, department, scriptureQuote, ghamsuToday } from './misc'
import executive from './executive'
import { gallery } from './gallery'
import news from './news'
import article from './article'
import subscriber from './subscriber'

export const schemaTypes = [
  // Core content
  event,
  author,
 blog,
  sermon,
  news,
  article,
  subscriber,
  // Supporting content
  testimonial,
  gallery,
  executive,
  department,
  scriptureQuote,
  ghamsuToday,
]
