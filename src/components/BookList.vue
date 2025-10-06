<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getBooks, type PaginationParams } from '../data/books'
import type { Book } from '../types'

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

// Computed pages for pagination UI
const paginationRange = computed(() => {
  const range: (number | string)[] = []
  const maxVisiblePages = 5

  if (totalPages.value <= maxVisiblePages) {
    // Show all pages if there are few
    for (let i = 1; i <= totalPages.value; i++) {
      range.push(i)
    }
  } else {
    // Always include first page
    range.push(1)

    // Calculate start and end of visible page range
    let start = Math.max(2, currentPage.value - 1)
    let end = Math.min(totalPages.value - 1, currentPage.value + 1)

    // Adjust if at start or end
    if (currentPage.value <= 2) {
      end = 4
    } else if (currentPage.value >= totalPages.value - 1) {
      start = totalPages.value - 3
    }

    // Add ellipsis if needed
    if (start > 2) {
      range.push('...')
    }

    // Add visible page range
    for (let i = start; i <= end; i++) {
      range.push(i)
    }

    // Add ellipsis if needed
    if (end < totalPages.value - 1) {
      range.push('...')
    }

    // Always include last page
    if (totalPages.value > 1) {
      range.push(totalPages.value)
    }
  }

  return range
})

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

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page
    fetchBooks()
  }
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
        <div
          v-for="book in booksList"
          :key="book.id"
          class="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 bg-white"
        >
          <div class="w-full h-[300px]">
            <img
              :src="book.cover"
              :alt="book.title"
              class="w-full h-full object-cover block"
              onerror="this.src='https://picsum.photos/200/300?random=' + this.alt"
            />
          </div>
          <div class="p-4">
            <h3 class="text-2xl font-semibold mb-2">{{ book.title }}</h3>
            <p class="text-gray-600 mb-2 italic">by {{ book.author }}</p>
            <p v-if="book.year" class="text-sm text-gray-500 mb-3">{{ book.year }}</p>
            <p v-if="book.description" class="text-base leading-relaxed">{{ book.description }}</p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex justify-center mt-8" v-if="totalPages > 1">
        <nav
          class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
          aria-label="Pagination"
        >
          <!-- Previous Page -->
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            :class="[
              'relative inline-flex items-center px-2 py-2 rounded-l-md border',
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-500 hover:bg-gray-50',
            ]"
          >
            <span class="sr-only">Previous</span>
            <svg
              class="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <!-- Page Numbers -->
          <template v-for="(page, index) in paginationRange" :key="index">
            <!-- Ellipsis -->
            <span
              v-if="page === '...'"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
            >
              ...
            </span>

            <!-- Page Number -->
            <button
              v-else
              @click="goToPage(Number(page))"
              :class="[
                'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                currentPage === page
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
              ]"
            >
              {{ page }}
            </button>
          </template>

          <!-- Next Page -->
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            :class="[
              'relative inline-flex items-center px-2 py-2 rounded-r-md border',
              currentPage >= totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-500 hover:bg-gray-50',
            ]"
          >
            <span class="sr-only">Next</span>
            <svg
              class="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
