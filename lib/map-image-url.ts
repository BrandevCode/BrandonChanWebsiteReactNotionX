import { defaultMapImageUrl } from 'notion-utils'

import { defaultPageCover, defaultPageIcon } from './config'

function getAttachmentImageUrl(url: string, block: any) {
  if (!url.startsWith('attachment:') || !block?.id) {
    return defaultMapImageUrl(url, block)
  }

  const notionImageUrl = new URL(
    `https://www.notion.so/image/${encodeURIComponent(url)}`
  )

  const table =
    block?.parent_table === 'space'
      ? 'block'
      : block?.parent_table || 'block'
  const normalizedTable =
    table === 'collection' || table === 'team' ? 'block' : table

  notionImageUrl.searchParams.set('table', normalizedTable)
  notionImageUrl.searchParams.set('id', block.id)
  notionImageUrl.searchParams.set('cache', 'v2')

  return notionImageUrl.toString()
}

export const mapImageUrl = (url: string | undefined, block: any) => {
  if (!url) {
    return url
  }

  if (url === defaultPageCover || url === defaultPageIcon) {
    return url
  }

  if (url.startsWith('attachment:')) {
    return getAttachmentImageUrl(url, block)
  }

  return defaultMapImageUrl(url, block)
}
