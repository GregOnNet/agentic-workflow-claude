import { expect, test } from '@playwright/test'

test.describe('Book Details View', () => {
  test('should navigate from list to detail and back', async ({ page }) => {
    // Arrange: Go to book list
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Book Collection' })).toBeVisible()

    // Wait for books to load
    await expect(page.getByText('Loading books...')).toBeHidden()

    // Act: Click first book
    const firstBookCard = page.getByTestId('book-card').first()
    const firstBookTitle = await firstBookCard.getByRole('heading', { level: 3 }).textContent()
    await firstBookCard.click()

    // Assert: Detail page loads with correct book
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toContainText(firstBookTitle!)

    // Act: Click back button
    await page.getByRole('button', { name: /back to book list/i }).click()

    // Assert: Returns to list
    await expect(page.getByRole('heading', { name: 'Book Collection' })).toBeVisible()
  })
})
