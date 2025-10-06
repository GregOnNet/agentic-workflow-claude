import type { Book } from '../types'

const API_URL = 'http://localhost:4730'

export async function getBooks(searchTerm?: string): Promise<Book[]> {
  try {
    let url = `${API_URL}/books`
    if (searchTerm && searchTerm.trim()) {
      url += `?q=${encodeURIComponent(searchTerm.trim())}`
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch books:', error)
    return []
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
