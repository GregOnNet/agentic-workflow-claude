import { type Page, type Locator } from '@playwright/test'

export class BookDetailPage {
  readonly page: Page
  readonly backButton: Locator
  readonly bookTitle: Locator
  readonly bookAuthor: Locator
  readonly bookCover: Locator
  readonly bookDescription: Locator
  readonly statusSelect: Locator
  readonly loadingIndicator: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.backButton = page.getByRole('button', { name: /back to book list/i })
    this.bookTitle = page.getByRole('heading', { level: 1 })
    this.bookAuthor = page.getByTestId('book-author')
    this.bookCover = page.getByRole('img', { name: /cover image/i })
    this.statusSelect = page.getByLabel('Reading Status')
    this.loadingIndicator = page.getByText('Loading book details...')
    this.errorMessage = page.getByRole('alert')
    this.bookDescription = page.getByText(/Description/i)
  }

  async goto(bookId: number) {
    await this.page.goto(`/books/${bookId}`)
  }

  async changeStatus(status: string) {
    await this.statusSelect.selectOption(status)
  }

  async clickBack() {
    await this.backButton.click()
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle')
  }

  async getBookTitle(): Promise<string | null> {
    return await this.bookTitle.textContent()
  }

  async getBookAuthor(): Promise<string | null> {
    return await this.bookAuthor.textContent()
  }

  async getCurrentStatus(): Promise<string | null> {
    return await this.statusSelect.inputValue()
  }
}

