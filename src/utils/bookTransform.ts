import type { Book, BookColumn, BookReadingState, BookWithStatus } from '../types'

export function bookToBookWithStatus(book: Book, readingState: BookReadingState): BookWithStatus {
  const state = readingState[book.id] || { status: 'to-read', order: 0 }
  return {
    ...book,
    readingStatus: state.status,
    order: state.order,
  }
}

export function booksToColumns(books: Book[], readingState: BookReadingState): BookColumn[] {
  const booksWithStatus = books.map((book) => bookToBookWithStatus(book, readingState))

  const columns: BookColumn[] = [
    { id: 'to-read', title: 'To Read', books: [] },
    { id: 'currently-reading', title: 'Currently Reading', books: [] },
    { id: 'read', title: 'Read', books: [] },
  ]

  booksWithStatus.forEach((book) => {
    const column = columns.find((col) => col.id === book.readingStatus)
    if (column) {
      column.books.push(book)
    }
  })

  // Sort books by order within each column
  columns.forEach((column) => {
    column.books.sort((a, b) => a.order - b.order)
  })

  return columns
}

export function updateBookOrder(
  columns: BookColumn[],
  sourceColumnId: string,
  targetColumnId: string,
  bookId: number,
  targetIndex: number,
): BookColumn[] {
  const newColumns = columns.map((column) => ({ ...column, books: [...column.books] }))

  // Find and remove book from source column
  const sourceColumn = newColumns.find((col) => col.id === sourceColumnId)
  if (!sourceColumn) return columns

  const bookIndex = sourceColumn.books.findIndex((book) => book.id === bookId)
  if (bookIndex === -1) return columns

  const [book] = sourceColumn.books.splice(bookIndex, 1)
  if (!book) return columns

  // Update book status if moving to different column
  if (sourceColumnId !== targetColumnId) {
    book.readingStatus = targetColumnId as 'to-read' | 'currently-reading' | 'read'
  }

  // Add book to target column
  const targetColumn = newColumns.find((col) => col.id === targetColumnId)
  if (!targetColumn) return columns

  targetColumn.books.splice(targetIndex, 0, book)

  // Update order for all books in both columns
  newColumns.forEach((column) => {
    column.books.forEach((book, index) => {
      book.order = index
    })
  })

  return newColumns
}
