import { expect, test } from '@playwright/test'

test.describe('When the book list is loaded', () => {
  test('displays at least one book in the list', async ({ page }) => {
    // Arrange: Navigate to the books page
    await page.goto('/')

    // Assert: Verify page heading is visible
    await expect(page.getByRole('heading', { name: 'Book Collection' })).toBeVisible()

    // Act: Books should be loaded automatically on mount
    // Wait for loading to complete by checking that loading indicator is hidden
    await expect(page.getByText('Loading books...')).toBeHidden()

    // Assert: Verify at least one book card is displayed
    // Get all book cards - each should have an h3 heading (book title)
    const bookCards = page.getByRole('heading', { level: 3 })

    // Verify at least one book is displayed
    await expect(bookCards.first()).toBeVisible()

    // Verify expected count (default page size is 10)
    await expect(bookCards).toHaveCount(10)
  })

  test('displays at least 2 books when searching for "Angular"', async ({ page }) => {
    // Arrange: Navigate to the books page
    await page.goto('/')

    // Wait for initial load
    await expect(page.getByRole('heading', { name: 'Book Collection' })).toBeVisible()
    await expect(page.getByText('Loading books...')).toBeHidden()

    // Act: Search for "Angular"
    const searchInput = page.getByTestId('book-search-input')
    await searchInput.fill('Angular')

    // Assert: Verify at least 2 books are displayed
    // Wait for search results by checking the count has changed from initial 10
    const bookCards = page.getByRole('heading', { level: 3 })

    // Wait for results to update (should not be the initial 10)
    await expect(async () => {
      const count = await bookCards.count()
      expect(count).not.toBe(10)
      expect(count).toBeGreaterThanOrEqual(2)
    }).toPass({ timeout: 10000 })

    // Verify first two book cards are visible
    await expect(bookCards.first()).toBeVisible()
    await expect(bookCards.nth(1)).toBeVisible()
  })
})
