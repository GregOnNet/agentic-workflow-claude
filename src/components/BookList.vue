<script setup lang="ts">
import { computed, onErrorCaptured, onMounted } from 'vue'
import { useBookData } from '../composables/useBookData'
import { useErrorHandler } from '../composables/useErrorHandler'
import { usePagination } from '../composables/usePagination'
import { useSearch } from '../composables/useSearch'
import BookCard from './BookCard.vue'
import Pagination from './Pagination.vue'

// Error handling
const { error: componentError, handleError, clearError } = useErrorHandler()

// Component-level error boundary
onErrorCaptured((err, instance, info) => {
  handleError(err, `BookList.${info}`)
  // Prevent error from propagating to global handler
  return false
})

const pagination = usePagination(() => {
  fetchBooks()
})

const { searchTerm, handleSearch } = useSearch(() => {
  pagination.currentPage.value = 1 // Reset to first page on new search
  fetchBooks()
})

const { booksList, isLoading, error, fetchBooks } = useBookData(searchTerm, pagination)

// Computed properties
const showingCount = computed(
  () => `Showing ${booksList.value.length} of ${pagination.totalItems.value} books`,
)

onMounted(() => {
  fetchBooks()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-5 py-5">
    <h1 class="text-4xl font-bold mb-6">Book Collection</h1>

    <!-- Error Banner -->
    <div
      v-if="componentError"
      class="mb-5 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between"
      role="alert"
    >
      <div class="flex items-center">
        <svg
          class="h-5 w-5 text-red-600 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="text-red-800">{{ componentError.message }}</span>
      </div>
      <button
        @click="clearError"
        class="text-red-600 hover:text-red-800 font-medium"
        aria-label="Dismiss error"
      >
        Dismiss
      </button>
    </div>

    <div class="mb-6">
      <div class="relative">
        <input
          type="text"
          :value="searchTerm"
          @input="handleSearch"
          placeholder="Search books..."
          class="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Search books"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="p-5 text-center mt-5 rounded-lg bg-blue-50 text-blue-600">
      Loading books...
    </div>

    <div v-else-if="error" class="p-5 text-center mt-5 rounded-lg bg-red-50 text-red-600">
      {{ error }}
    </div>

    <div
      v-else-if="booksList.length === 0"
      class="p-5 text-center mt-5 rounded-lg bg-gray-100 text-gray-600"
    >
      No books available.
    </div>

    <div v-else>
      <!-- Page size selector -->
      <div class="flex justify-between items-center mb-5">
        <div class="flex items-center">
          <span class="mr-2 text-gray-600">Items per page:</span>
          <select
            :value="pagination.pageSize"
            @change="pagination.changePageSize"
            class="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="size in pagination.pageSizeOptions" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>
        <div class="text-gray-600">{{ showingCount }}</div>
      </div>

      <!-- Book grid -->
      <div
        v-memo="[pagination.currentPage, pagination.pageSize, searchTerm]"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
      >
        <BookCard v-for="book in booksList" :key="book.id" :book="book" />
      </div>

      <!-- Pagination -->
      <Pagination
        :current-page="pagination.currentPage.value"
        :total-pages="pagination.totalPages.value"
        @page-change="pagination.handlePageChange"
      />
    </div>
  </div>
</template>
