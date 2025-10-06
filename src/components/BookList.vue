<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getBooks } from '../data/books'
import type { Book } from '../types'

const booksList = ref<Book[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const searchTerm = ref('')
const debounceTimeout = ref<number | null>(null)

async function fetchBooks(term: string = '') {
  try {
    isLoading.value = true
    error.value = null
    booksList.value = await getBooks(term)
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
    fetchBooks(value)
  }, 200)
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

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-5">
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
  </div>
</template>
