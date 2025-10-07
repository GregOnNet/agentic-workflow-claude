<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getBooks, type PaginationParams } from '../data/books'
import type { Book } from '../types'
import BookCard from './BookCard.vue'
import Pagination from './Pagination.vue'

const booksList = ref<Book[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const searchTerm = ref('')
const debounceTimeout = ref<number | null>(null)

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const totalPages = ref(0)

// Available page size options
const pageSizeOptions = [5, 10, 50, 100]

async function fetchBooks() {
  try {
    isLoading.value = true
    error.value = null

    const params: PaginationParams = {
      page: currentPage.value,
      limit: pageSize.value,
      searchTerm: searchTerm.value,
    }

    const result = await getBooks(params)
    booksList.value = result.books
    totalItems.value = result.totalItems
    totalPages.value = result.totalPages

    // Adjust current page if it exceeds total pages
    if (currentPage.value > result.totalPages && result.totalPages > 0) {
      currentPage.value = result.totalPages
      await fetchBooks()
    }
  } catch (err) {
    error.value = 'Failed to load books. Please try again later.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function handleSearch(event: Event) {
  const value = (event.target as HTMLInputElement).value
  searchTerm.value = value

  // Clear any existing timeout
  if (debounceTimeout.value) {
    window.clearTimeout(debounceTimeout.value)
  }

  // Set new timeout
  debounceTimeout.value = window.setTimeout(() => {
    currentPage.value = 1 // Reset to first page on new search
    fetchBooks()
  }, 200)
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchBooks()
}

function changePageSize(event: Event) {
  const newSize = Number((event.target as HTMLSelectElement).value)
  pageSize.value = newSize
  currentPage.value = 1 // Reset to first page when changing page size
  fetchBooks()
}

onMounted(() => {
  fetchBooks()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-5 py-5">
    <h1 class="text-4xl font-bold mb-6">Book Collection</h1>

    <div class="mb-6">
      <div class="relative">
        <input
          type="text"
          :value="searchTerm"
          @input="handleSearch"
          placeholder="Search books..."
          class="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            :value="pageSize"
            @change="changePageSize"
            class="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>
        <div class="text-gray-600">Showing {{ booksList.length }} of {{ totalItems }} books</div>
      </div>

      <!-- Book grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        <BookCard v-for="book in booksList" :key="book.id" :book="book" />
      </div>

      <!-- Pagination -->
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>
