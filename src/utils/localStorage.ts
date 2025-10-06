import type { BookColumn, BookReadingState } from '../types'

const STORAGE_KEY = 'book-reading-state'

export function loadReadingState(): BookReadingState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Failed to load reading state:', error)
    return {}
  }
}

export function saveReadingState(state: BookReadingState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    console.log('Saved reading state to localStorage:', state)
  } catch (error) {
    console.error('Failed to save reading state:', error)
  }
}

export function columnsToReadingState(columns: BookColumn[]): BookReadingState {
  const state: BookReadingState = {}

  columns.forEach((column) => {
    column.books.forEach((book) => {
      state[book.id] = {
        status: book.readingStatus,
        order: book.order,
      }
    })
  })

  console.log('Converted columns to reading state:', state)
  return state
}

export function clearReadingState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('Cleared reading state from localStorage')
  } catch (error) {
    console.error('Failed to clear reading state:', error)
  }
}
