import { defaultMapImageUrl } from 'notion-utils'

import { defaultPageCover, defaultPageIcon } from './config'

export const mapImageUrl = (url: string | undefined, block: any) => {
  if (!url) {
    return url
  }

  if (url === defaultPageCover || url === defaultPageIcon) {
    return url
  }

  // Let react-notion-x handle attachment: URLs directly
  // It has built-in logic to convert them to signed Notion URLs
  if (url.startsWith('attachment:')) {
    return url
  }

  // For other URLs, use notion-utils mapping
  return defaultMapImageUrl(url, block)
}
