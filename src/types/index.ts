export interface Book {
  id: number
  title: string
  author: string
  cover?: string
  description?: string
  year?: number
}

// Kanban board types
export interface BookWithStatus extends Book {
  readingStatus: 'to-read' | 'currently-reading' | 'read'
  order: number
}

export interface BookColumn {
  id: 'to-read' | 'currently-reading' | 'read'
  title: string
  books: BookWithStatus[]
}

export interface BookReadingState {
  [bookId: number]: {
    status: 'to-read' | 'currently-reading' | 'read'
    order: number
  }
}

// User profile types
export interface User {
  name: string
  email: string
}

export interface ValidationError {
  field: string
  message: string
}
