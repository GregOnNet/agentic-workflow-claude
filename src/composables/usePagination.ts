import { ref } from 'vue'

export function usePagination(fetchCallback: () => void) {
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalItems = ref(0)
  const totalPages = ref(0)
  const pageSizeOptions = [5, 10, 50, 100]

  function handlePageChange(page: number) {
    currentPage.value = page
    fetchCallback()
  }

  function changePageSize(event: Event) {
    const newSize = Number((event.target as HTMLSelectElement).value)
    pageSize.value = newSize
    currentPage.value = 1 // Reset to first page when changing page size
    fetchCallback()
  }

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    pageSizeOptions,
    handlePageChange,
    changePageSize,
  }
}
