<script setup lang="ts">
import { computed, onErrorCaptured, onMounted, watch } from 'vue'
import draggable from 'vuedraggable'
import { useDragDrop } from '../composables/useDragDrop'
import { useErrorHandler } from '../composables/useErrorHandler'
import { useKanbanColumns } from '../composables/useKanbanColumns'
import { useReadingState } from '../composables/useReadingState'
import type { Book } from '../types'

// Props
const props = defineProps<{
  books: Book[]
}>()

// Emits
const emit = defineEmits<{
  'status-change': [bookId: number, status: 'to-read' | 'currently-reading' | 'read']
}>()

// Error handling
const { error: componentError, handleError, clearError } = useErrorHandler()

// Component-level error boundary
onErrorCaptured((err, instance, info) => {
  handleError(err, `BookKanban.${info}`)
  // Prevent error from propagating to global handler
  return false
})

// Initialize composables
const { readingState, loadState, saveState, clearState } = useReadingState()

// Load reading state
onMounted(() => {
  console.log('Component mounted, loading reading state...')
  loadState()
})

// Initialize columns with loaded reading state
const { columns, isLoading, updateColumns } = useKanbanColumns(props.books, readingState.value)

// Handle drag and drop
const { handleDragEnd } = useDragDrop(
  columns.value,
  (bookId, status) => emit('status-change', bookId, status),
  () => saveState(columns.value),
)

// Watch for books changes
watch(
  () => props.books,
  (newBooks) => {
    console.log('Books changed, updating columns with', newBooks.length, 'books')
    updateColumns(readingState.value)
  },
  { deep: true, immediate: true },
)

// Computed properties
const totalBooks = computed(() =>
  columns.value.reduce((acc, column) => acc + column.books.length, 0),
)

// Method to reload reading state from localStorage
function reloadReadingState() {
  console.log('Reloading reading state from localStorage...')
  const newState = loadState()
  updateColumns(newState)
}

// Debug method to clear localStorage
function clearReadingStateAndUpdate() {
  console.log('Clearing reading state...')
  const newState = clearState()
  updateColumns(newState)
}

// Expose methods for parent component
defineExpose({
  updateColumns: () => updateColumns(readingState.value),
  reloadReadingState,
  clearState: clearReadingStateAndUpdate,
})
</script>

<template>
  <div class="kanban-board">
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

    <div
      v-if="isLoading"
      class="p-5 text-center mt-5 rounded-lg bg-blue-50 text-blue-600"
      role="status"
      aria-live="polite"
    >
      Loading kanban board...
    </div>

    <div
      v-else-if="totalBooks === 0"
      class="p-5 text-center mt-5 rounded-lg bg-gray-100 text-gray-600"
    >
      No books available. Add some books to get started.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="column in columns"
        :key="column.id"
        v-memo="[column.books.length, totalBooks]"
        class="kanban-column bg-gray-50 rounded-lg p-4 min-h-[500px]"
      >
        <!-- Column Header -->
        <div class="column-header mb-4">
          <h3 class="text-lg font-semibold text-gray-800">{{ column.title }}</h3>
          <span class="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {{ column.books.length }} books
          </span>
        </div>

        <!-- Column Content with Draggable -->
        <draggable
          v-model="column.books"
          :data-column-id="column.id"
          group="books"
          item-key="id"
          class="column-content space-y-3 min-h-[200px]"
          @end="handleDragEnd"
          :animation="200"
          :ghost-class="'ghost-book'"
          :chosen-class="'chosen-book'"
          :drag-class="'drag-book'"
          :empty-insert-threshold="50"
          aria-label="Books in category"
          role="list"
        >
          <template #item="{ element: book }">
            <div
              :data-book-id="book.id"
              class="book-card bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-grab active:cursor-grabbing"
              role="listitem"
              :aria-label="book.title + ' by ' + book.author"
              tabindex="0"
            >
              <!-- Book Cover -->
              <div class="w-full h-48">
                <img
                  :src="book.cover || `https://picsum.photos/200/300?random=${book.id}`"
                  :alt="book.title"
                  class="w-full h-full object-cover rounded-t-lg"
                  onerror="this.src='https://picsum.photos/200/300?random=' + this.alt"
                />
              </div>

              <!-- Book Info -->
              <div class="p-4">
                <h4 class="text-lg font-semibold mb-2 line-clamp-2">{{ book.title }}</h4>
                <p class="text-gray-600 mb-2 text-sm">{{ book.author }}</p>
                <p v-if="book.year" class="text-xs text-gray-500 mb-2">{{ book.year }}</p>
                <p v-if="book.description" class="text-sm text-gray-700 line-clamp-3">
                  {{ book.description }}
                </p>
              </div>
            </div>
          </template>

          <!-- Empty State -->
          <template #footer>
            <div
              v-if="column.books.length === 0"
              class="text-center text-gray-400 py-8 border-2 border-dashed border-gray-300 rounded-lg"
            >
              <svg
                class="mx-auto h-12 w-12 text-gray-300 mb-2"
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
              <p>No books in this column</p>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kanban-column {
  transition: background-color 0.2s ease;
}

.kanban-column:hover {
  background-color: #f9fafb;
}

.book-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.book-card:hover {
  transform: translateY(-2px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Draggable styles */
.ghost-book {
  opacity: 0.5;
  background: #f3f4f6;
  border: 2px dashed #9ca3af;
}

.chosen-book {
  cursor: grabbing;
}

.drag-book {
  transform: rotate(5deg);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
</style>
