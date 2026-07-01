import { defaultMapImageUrl } from 'notion-utils'

import { defaultPageCover, defaultPageIcon } from './config'

export const mapImageUrl = (url: string | undefined, block: any) => {
  if (!url) {
    return url
  }

  if (url === defaultPageCover || url === defaultPageIcon) {
    return url
  }

  // Ensure attachment URLs are properly converted through notion-utils
  // which handles signing and converting attachment: URLs to accessible HTTPS URLs
  const mapped = defaultMapImageUrl(url, block)

  // Log if we're getting attachment: URLs in output (indicates a mapping issue)
  if (mapped && mapped.startsWith('attachment:')) {
    console.warn(
      'Warning: attachment URL was not converted to HTTPS URL',
      mapped,
      'block:',
      block?.id
    )
  }

  return mapped
}
