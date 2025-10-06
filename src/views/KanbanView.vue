<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BookKanban from '../components/BookKanban.vue'
import { getBooks, type PaginationParams } from '../data/books'
import type { Book } from '../types'

// State
const books = ref<Book[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const searchTerm = ref('')
const debounceTimeout = ref<number | null>(null)

// Fetch all books for kanban (no pagination)
async function fetchAllBooks() {
  try {
    isLoading.value = true
    error.value = null

    // Fetch a large number of books to get all available books
    const params: PaginationParams = {
      page: 1,
      limit: 1000, // Large limit to get all books
      searchTerm: searchTerm.value,
    }

    const result = await getBooks(params)
    books.value = result.books
  } catch (err) {
    error.value = 'Failed to load books. Please try again later.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// Search functionality
function handleSearch(event: Event) {
  const value = (event.target as HTMLInputElement).value
  searchTerm.value = value

  // Clear any existing timeout
  if (debounceTimeout.value) {
    window.clearTimeout(debounceTimeout.value)
  }

  // Set new timeout
  debounceTimeout.value = window.setTimeout(() => {
    fetchAllBooks()
  }, 300)
}

// Handle book status changes
function handleStatusChange(bookId: number, status: 'to-read' | 'currently-reading' | 'read') {
  console.log(`Book ${bookId} moved to ${status}`)
  // Additional logic can be added here if needed
}

// Initialize
onMounted(() => {
  fetchAllBooks()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-5 py-5">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-4xl font-bold mb-2">Reading Progress Board</h1>
      <p class="text-gray-600">
        Drag and drop books between columns to track your reading progress
      </p>
    </div>

    <!-- Search Bar -->
    <div class="mb-6">
      <div class="relative max-w-md">
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

    <!-- Loading State -->
    <div v-if="isLoading" class="p-5 text-center mt-5 rounded-lg bg-blue-50 text-blue-600">
      <div class="flex items-center justify-center">
        <svg
          class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Loading books...
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-5 text-center mt-5 rounded-lg bg-red-50 text-red-600">
      <div class="flex items-center justify-center">
        <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {{ error }}
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="books.length === 0"
      class="p-5 text-center mt-5 rounded-lg bg-gray-100 text-gray-600"
    >
      <div class="flex flex-col items-center">
        <svg
          class="h-12 w-12 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <h3 class="text-lg font-medium mb-2">No books found</h3>
        <p>Try adjusting your search terms or check back later for new books.</p>
      </div>
    </div>

    <!-- Kanban Board -->
    <BookKanban v-else :books="books" @status-change="handleStatusChange" />

    <!-- Instructions -->
    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <h3 class="text-lg font-medium text-blue-900 mb-2">How to use the Reading Board</h3>
      <ul class="text-sm text-blue-800 space-y-1">
        <li>• <strong>To Read:</strong> Books you plan to read</li>
        <li>• <strong>Currently Reading:</strong> Books you're reading right now</li>
        <li>• <strong>Read:</strong> Books you've finished reading</li>
        <li>• Drag books between columns to update your reading progress</li>
        <li>• Your progress is automatically saved to your browser</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles can be added here if needed */
</style>
