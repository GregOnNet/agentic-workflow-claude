import { ref, watch, type Ref } from 'vue'
import type { Book } from '@/types'

const API_BASE_URL = 'http://localhost:4730'

export interface UseBookDetailReturn {
  book: Ref<Book | null>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  fetchBook: () => Promise<void>
  refetch: () => Promise<void>
}

export function useBookDetail(bookId: Ref<number>): UseBookDetailReturn {
  const book = ref<Book | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchBook() {
    if (!bookId.value || bookId.value <= 0) {
      error.value = new Error('Invalid book ID')
      return
    }

    isLoading.value = true
    error.value = null
    book.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/books/${bookId.value}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Book not found')
        }
        throw new Error(`HTTP error: ${response.status}`)
      }

      book.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
      book.value = null
    } finally {
      isLoading.value = false
    }
  }

  // Auto-fetch when bookId changes
  watch(
    bookId,
    () => {
      fetchBook()
    },
    { immediate: true },
  )

  return {
    book,
    isLoading,
    error,
    fetchBook,
    refetch: fetchBook,
  }
}

