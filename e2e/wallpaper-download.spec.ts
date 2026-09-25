import { test, expect } from '@playwright/test'
import { ALLOWED_WALLPAPER_FORMATS } from '../src/lib/widgets/wallpaper/lib/wallpaper-formats'

const KNOWN_GITHUB_USERNAME = 'octocat'
const PREVIEW_READY_TIMEOUT_MILLISECONDS = 20_000
const DOWNLOAD_TIMEOUT_MILLISECONDS = 45_000

test.describe('wallpaper export', () => {
  for (const format of ALLOWED_WALLPAPER_FORMATS) {
    test(`downloads the ${format.name} (${format.subtitle}) wallpaper`, async ({ page }) => {
      await page.goto(`/wallpaper/export?username=${KNOWN_GITHUB_USERNAME}`)

      const downloadButton = page.getByRole('button', { name: /download png/i })
      await expect(downloadButton).toBeEnabled({ timeout: PREVIEW_READY_TIMEOUT_MILLISECONDS })

      await page.locator('.format-grid button').filter({ hasText: format.name }).click()
      await expect(page.getByText(`${format.width} × ${format.height}`)).toBeVisible()

      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: DOWNLOAD_TIMEOUT_MILLISECONDS }),
        downloadButton.click(),
      ])

      expect(download.suggestedFilename()).toBe(`gitpeak-${KNOWN_GITHUB_USERNAME}-${format.id}.png`)

      const downloadedPath = await download.path()
      expect(downloadedPath).toBeTruthy()
    })
  }
})
