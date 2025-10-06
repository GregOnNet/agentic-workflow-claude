import type { Book } from '../types'

const API_URL = 'http://localhost:4730'

export interface PaginationParams {
  page?: number
  limit?: number
  searchTerm?: string
}

export interface PaginationResult {
  books: Book[]
  totalPages: number
  totalItems: number
  currentPage: number
}

export async function getBooks(params: PaginationParams = {}): Promise<PaginationResult> {
  try {
    const { page = 1, limit = 10, searchTerm = '' } = params
    const queryParams = new URLSearchParams()

    // Add pagination parameters
    queryParams.append('_page', page.toString())
    queryParams.append('_limit', limit.toString())

    // Add search term if provided
    if (searchTerm && searchTerm.trim()) {
      queryParams.append('q', searchTerm.trim())
    }

    const url = `${API_URL}/books?${queryParams.toString()}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    // Get total count from headers
    const totalItems = parseInt(response.headers.get('X-Total-Count') || '0', 10)
    const totalPages = Math.ceil(totalItems / limit)

    const books = await response.json()

    return {
      books,
      totalPages,
      totalItems,
      currentPage: page,
    }
  } catch (error) {
    console.error('Failed to fetch books:', error)
    return {
      books: [],
      totalPages: 0,
      totalItems: 0,
      currentPage: 1,
    }
  }
}

export async function getBookById(id: number): Promise<Book | null> {
  try {
    const response = await fetch(`${API_URL}/books/${id}`)
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch book with id ${id}:`, error)
    return null
  }
}
