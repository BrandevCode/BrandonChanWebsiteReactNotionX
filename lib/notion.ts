import {
  type ExtendedRecordMap,
  type SearchParams,
  type SearchResults
} from 'notion-types'
import { mergeRecordMaps } from 'notion-utils'
import pMap from 'p-map'
import pMemoize from 'p-memoize'

import {
  isPreviewImageSupportEnabled,
  navigationLinks,
  navigationStyle
} from './config'
import { getTweetsMap } from './get-tweets'
import { notion } from './notion-api'
import { getPreviewImageMap } from './preview-images'

const getNavigationLinkPages = pMemoize(
  async (): Promise<ExtendedRecordMap[]> => {
    const navigationLinkPageIds = (navigationLinks || [])
      .map((link) => link?.pageId)
      .filter(Boolean)

    if (navigationStyle !== 'default' && navigationLinkPageIds.length) {
      return pMap(
        navigationLinkPageIds,
        async (navigationLinkPageId) =>
          notion.getPage(navigationLinkPageId, {
            chunkLimit: 1,
            fetchMissingBlocks: false,
            fetchCollections: false,
            signFileUrls: false
          }),
        {
          concurrency: 4
        }
      )
    }

    return []
  }
)

export async function getPage(pageId: string): Promise<ExtendedRecordMap> {
  const maxAttempts = 5

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      let recordMap = await notion.getPage(pageId)

      if (navigationStyle !== 'default') {
        // ensure that any pages linked to in the custom navigation header have
        // their block info fully resolved in the page record map so we know
        // the page title, slug, etc.
        const navigationLinkRecordMaps = await getNavigationLinkPages()

        if (navigationLinkRecordMaps?.length) {
          recordMap = navigationLinkRecordMaps.reduce(
            (map, navigationLinkRecordMap) =>
              mergeRecordMaps(map, navigationLinkRecordMap),
            recordMap
          )
        }
      }

      if (isPreviewImageSupportEnabled) {
        const previewImageMap = await getPreviewImageMap(recordMap)
        ;(recordMap as any).preview_images = previewImageMap
      }

      await getTweetsMap(recordMap)

      return recordMap
    } catch (err: any) {
      const is429 =
        (err && err.message && err.message.includes('429')) || err?.status === 429

      if (!is429 || attempt === maxAttempts) {
        throw err
      }

      const delay = Math.min(30_000, Math.pow(2, attempt) * 1000 + Math.random() * 1000)
      console.warn(`notion.getPage ${pageId} attempt ${attempt} failed (${err.message}). retrying in ${delay}ms`)
      await new Promise((r) => setTimeout(r, delay))
    }
  }

  // should never reach here
  throw new Error('Failed to load page')
}

export async function search(params: SearchParams): Promise<SearchResults> {
  return notion.search(params)
}
