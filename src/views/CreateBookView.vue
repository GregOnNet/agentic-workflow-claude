<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createBook } from '../data/books'

const router = useRouter()

const form = reactive({
  id: '',
  isbn: '',
  title: '',
  author: '',
})

const error = ref<string | null>(null)
const isSubmitting = ref(false)

async function handleSubmit() {
  error.value = null
  isSubmitting.value = true

  try {
    await createBook({
      id: Number(form.id),
      isbn: form.isbn,
      title: form.title,
      author: form.author,
    })
    router.push('/books')
  } catch (err) {
    error.value = 'Failed to save book. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto px-5 py-8">
    <h1 class="text-4xl font-bold mb-6">Create a new Book</h1>

    <div
      v-if="error"
      class="mb-5 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800"
      role="alert"
    >
      {{ error }}
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4" data-testid="create-book-form">
      <div>
        <label for="book-id" class="block text-sm font-medium text-gray-700 mb-1">ID</label>
        <input
          id="book-id"
          v-model="form.id"
          type="number"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          data-testid="book-id-input"
        />
      </div>

      <div>
        <label for="book-isbn" class="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
        <input
          id="book-isbn"
          v-model="form.isbn"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          data-testid="book-isbn-input"
        />
      </div>

      <div>
        <label for="book-title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          id="book-title"
          v-model="form.title"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          data-testid="book-title-input"
        />
      </div>

      <div>
        <label for="book-author" class="block text-sm font-medium text-gray-700 mb-1"
          >Author</label
        >
        <input
          id="book-author"
          v-model="form.author"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          data-testid="book-author-input"
        />
      </div>

      <div class="flex gap-3 pt-2">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          data-testid="save-book-button"
        >
          {{ isSubmitting ? 'Saving...' : 'Save' }}
        </button>
        <button
          type="button"
          @click="router.push('/books')"
          class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>
