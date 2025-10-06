<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getBooks } from '../data/books'
import type { Book } from '../types'

const booksList = ref<Book[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

async function fetchBooks() {
  try {
    isLoading.value = true
    error.value = null
    booksList.value = await getBooks()
  } catch (err) {
    error.value = 'Failed to load books. Please try again later.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchBooks()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-5 py-5">
    <h1 class="text-4xl font-bold mb-8">Book Collection</h1>

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
