import { test, expect } from '@playwright/test'

const KNOWN_GITHUB_USERNAME = 'octocat'
const MISSING_GITHUB_USERNAME = 'gitpeak-e2e-nonexistent-user-zzz9999'
const STATS_LOAD_TIMEOUT_MILLISECONDS = 20_000

test.describe('profile search', () => {
  test('finds a known profile and renders the dashboard', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('username').fill(KNOWN_GITHUB_USERNAME)
    await page.getByRole('button', { name: 'peek' }).click()

    await expect(page).toHaveURL(`/?username=${KNOWN_GITHUB_USERNAME}`)
    await expect(page.getByLabel('Export wallpaper')).toBeVisible({
      timeout: STATS_LOAD_TIMEOUT_MILLISECONDS,
    })
  })

  test('shows an empty state for a profile that does not exist', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('username').fill(MISSING_GITHUB_USERNAME)
    await page.getByRole('button', { name: 'peek' }).click()

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /user not found|connection failed|something went wrong/i,
      }),
    ).toBeVisible({ timeout: STATS_LOAD_TIMEOUT_MILLISECONDS })
  })
})
