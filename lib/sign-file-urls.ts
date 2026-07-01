import { type Block, type ExtendedRecordMap } from 'notion-types'

/**
 * Manually sign file URLs in a record map that may contain attachment: URLs
 * This is necessary for attachment URLs that weren't automatically signed by the Notion API
 */
export async function signFileUrlsInRecordMap(
  recordMap: ExtendedRecordMap
): Promise<ExtendedRecordMap> {
  if (!recordMap) {
    return recordMap
  }

  // Process blocks to find and sign attachment URLs
  if (recordMap.block) {
    for (const [_blockId, blockEntry] of Object.entries(recordMap.block)) {
      const block = blockEntry?.value as Block | undefined

      if (!block) {
        continue
      }

      // Check cover image
      if ((block as any).format?.page_cover?.startsWith?.('attachment:')) {
        (block as any).format.page_cover = convertAttachmentUrlToNotion(
          (block as any).format.page_cover
        )
      }

      // Check icon
      if ((block as any).format?.page_icon?.startsWith?.('attachment:')) {
        (block as any).format.page_icon = convertAttachmentUrlToNotion(
          (block as any).format.page_icon
        )
      }

      // Check collection cover for database blocks
      if ((block as any).format?.collection_cover_page_properties) {
        const coverProp = (block as any).format.collection_cover_page_properties
        if (
          typeof coverProp === 'string' &&
          coverProp.includes('attachment:')
        ) {
          (block as any).format.collection_cover_page_properties =
            convertAttachmentUrlToNotion(coverProp)
        }
      }
    }
  }

  return recordMap
}

/**
 * Convert attachment: URL to a Notion-served URL
 * Format: attachment:UUID:filename
 * Output: https://www.notion.so/api/v3/getSignedFileUrl?blockId=UUID
 */
function convertAttachmentUrlToNotion(url: string): string {
  if (!url.startsWith('attachment:')) {
    return url
  }

  try {
    const parts = url.split(':')
    if (parts.length >= 2) {
      const attachmentId = parts[1]
      // This endpoint should return a redirect or signed URL for the attachment
      return `https://www.notion.so/api/v3/getSignedFileUrl?blockId=${attachmentId}`
    }
  } catch (err) {
    console.warn('Failed to convert attachment URL:', url, err)
  }

  return url
}
