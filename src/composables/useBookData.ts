import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { getBooks, type PaginationParams } from '../data/books'
import type { Book } from '../types'
import { useErrorHandler } from './useErrorHandler'

interface PaginationState {
  currentPage: Ref<number>
  pageSize: Ref<number>
  totalItems: Ref<number>
  totalPages: Ref<number>
}

export function useBookData(searchTerm: Ref<string>, pagination: PaginationState) {
  const booksList = ref<Book[]>([])
  const isLoading = ref(true)
  const { error, withErrorHandling } = useErrorHandler()

  // Computed error message for better UX
  const errorMessage = computed(() =>
    error.value ? 'Failed to load books. Please try again later.' : null,
  )

  async function fetchBooks() {
    isLoading.value = true

    const result = await withErrorHandling(async () => {
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

      return result
    }, 'useBookData.fetchBooks')

    isLoading.value = false
    return result
  }

  return {
    booksList,
    isLoading,
    error: errorMessage,
    fetchBooks,
  }
}
