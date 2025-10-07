import { computed, ref } from 'vue'
import type { Book, BookColumn, BookReadingState } from '../types'
import { booksToColumns } from '../utils/bookTransform'
import { useErrorHandler } from './useErrorHandler'

export function useKanbanColumns(books: Book[], initialReadingState: BookReadingState) {
  const columns = ref<BookColumn[]>([])
  const { safeExecute } = useErrorHandler()

  // Computed properties
  const isLoading = computed(() => columns.value.length === 0)

  function updateColumns(readingState: BookReadingState) {
    return safeExecute(
      () => {
        console.log(
          'Updating columns with books:',
          books.length,
          'and reading state:',
          readingState,
        )

        if (books.length === 0) {
          // If no books, create empty columns
          columns.value = [
            { id: 'to-read', title: 'To Read', books: [] },
            { id: 'currently-reading', title: 'Currently Reading', books: [] },
            { id: 'read', title: 'Read', books: [] },
          ]
        } else {
          columns.value = booksToColumns(books, readingState)
        }

        console.log('Updated columns:', columns.value)
        return columns.value
      },
      'useKanbanColumns.updateColumns',
      columns.value, // Fallback to current columns if error
    ) as BookColumn[]
  }

  // Initialize columns
  updateColumns(initialReadingState)

  return {
    columns,
    isLoading,
    updateColumns,
  }
}
