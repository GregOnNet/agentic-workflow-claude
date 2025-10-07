<script setup lang="ts">
import { computed, onErrorCaptured } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookDetail } from '@/composables/useBookDetail'
import { useReadingState } from '@/composables/useReadingState'
import { useErrorHandler } from '@/composables/useErrorHandler'

// Router
const route = useRoute()
const router = useRouter()
const bookId = computed(() => Number(route.params.id))

// Error handling
const { error: componentError, handleError, clearError } = useErrorHandler()

onErrorCaptured((err, instance, info) => {
  handleError(err, `BookDetailView.${info}`)
  return false
})

// Book data
const { book, isLoading, error: fetchError } = useBookDetail(bookId)

// Reading status
const { getBookStatus, setBookStatus } = useReadingState()
const currentStatus = computed(() => getBookStatus(bookId.value))

// Methods
function handleBack() {
  router.back()
}

function handleStatusChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const newStatus = target.value as 'to-read' | 'currently-reading' | 'read'
  if (newStatus) {
    setBookStatus(bookId.value, newStatus)
  }
}

// Computed
const coverUrl = computed(
  () => book.value?.cover || 'https://via.placeholder.com/400x600?text=No+Cover',
)

const displayYear = computed(() => (book.value?.year ? ` (${book.value.year})` : ''))
</script>

<template>
  <main class="max-w-7xl mx-auto px-5 py-5">
    <!-- Error State -->
    <div
      v-if="componentError || fetchError"
      class="p-5 rounded-lg bg-red-50 text-red-600"
      role="alert"
    >
      <h2 class="text-2xl font-bold mb-4">Error</h2>
      <p class="mb-4">{{ componentError?.message || fetchError?.message }}</p>
      <div class="flex gap-4">
        <button
          @click="router.push('/')"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Return to Book List
        </button>
        <button
          v-if="clearError"
          @click="clearError"
          class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          Dismiss
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="p-5 text-center mt-5 rounded-lg bg-blue-50 text-blue-600">
      Loading book details...
    </div>

    <!-- Book Details -->
    <article v-else-if="book" aria-labelledby="book-title">
      <!-- Back Button -->
      <button
        @click="handleBack"
        aria-label="Back to book list"
        class="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
      >
        ← Back
      </button>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <!-- Cover Image -->
        <div class="lg:col-span-2">
          <img
            :src="coverUrl"
            :alt="`Cover image of ${book.title}`"
            class="w-full h-auto rounded-lg shadow-lg"
            loading="lazy"
          />
        </div>

        <!-- Book Information -->
        <div class="lg:col-span-3">
          <h1 id="book-title" class="text-4xl font-bold mb-2">{{ book.title }}{{ displayYear }}</h1>

          <p class="text-xl text-gray-600 italic mb-6" data-testid="book-author">
            by {{ book.author }}
          </p>

          <!-- Reading Status -->
          <div class="mb-6">
            <label for="reading-status" class="block text-sm font-medium text-gray-700 mb-2">
              Reading Status
            </label>
            <select
              id="reading-status"
              :value="currentStatus"
              @change="handleStatusChange"
              class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Not Set</option>
              <option value="to-read">To Read</option>
              <option value="currently-reading">Currently Reading</option>
              <option value="read">Read</option>
            </select>
          </div>

          <!-- Description -->
          <div v-if="book.description" class="prose max-w-none">
            <h2 class="text-2xl font-semibold mb-3">Description</h2>
            <p class="text-gray-700 leading-relaxed">{{ book.description }}</p>
          </div>

          <div v-else class="text-gray-500 italic">No description available.</div>
        </div>
      </div>
    </article>
  </main>
</template>

