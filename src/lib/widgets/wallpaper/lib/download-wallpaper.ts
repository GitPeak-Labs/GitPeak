import { requestWithRetries } from '$lib/shared/lib/retrying-fetch'

const DOWNLOAD_RETRY_POLICY = { attempts: 2, delayMilliseconds: 800 }

export async function downloadWallpaper(wallpaperUrl: string, filename: string): Promise<void> {
  const response = await requestWithRetries(() => fetch(wallpaperUrl), DOWNLOAD_RETRY_POLICY)
  saveBlob(await response.blob(), filename)
}

function saveBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.setAttribute('href', objectUrl)
  anchor.setAttribute('download', filename)
  document.body.append(anchor)
  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(objectUrl)
}
