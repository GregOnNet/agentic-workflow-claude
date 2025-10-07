import { ref, Ref } from 'vue'
import { getBooks, type PaginationParams } from '../data/books'
import type { Book } from '../types'

interface PaginationState {
  currentPage: Ref<number>
  pageSize: Ref<number>
  totalItems: Ref<number>
  totalPages: Ref<number>
}

export function useBookData(searchTerm: Ref<string>, pagination: PaginationState) {
  const booksList = ref<Book[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  async function fetchBooks() {
    try {
      isLoading.value = true
      error.value = null

      const params: PaginationParams = {
        page: pagination.currentPage.value,
        limit: pagination.pageSize.value,
        searchTerm: searchTerm.value,
      }

      const result = await getBooks(params)
      booksList.value = result.books
      pagination.totalItems.value = result.totalItems
      pagination.totalPages.value = result.totalPages

      // Adjust current page if it exceeds total pages
      if (pagination.currentPage.value > result.totalPages && result.totalPages > 0) {
        pagination.currentPage.value = result.totalPages
        await fetchBooks()
      }
    } catch (err) {
      error.value = 'Failed to load books. Please try again later.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    booksList,
    isLoading,
    error,
    fetchBooks,
  }
}
