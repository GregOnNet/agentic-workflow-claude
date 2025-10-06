<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import type { Book, BookColumn, BookReadingState } from '../types'
import { booksToColumns } from '../utils/bookTransform'
import {
  clearReadingState,
  columnsToReadingState,
  loadReadingState,
  saveReadingState,
} from '../utils/localStorage'

// Props
const props = defineProps<{
  books: Book[]
}>()

// Emits
const emit = defineEmits<{
  'status-change': [bookId: number, status: 'to-read' | 'currently-reading' | 'read']
}>()

// State
const readingState = ref<BookReadingState>({})
const columns = ref<BookColumn[]>([])

// Initialize reading state and columns
onMounted(() => {
  console.log('Component mounted, loading reading state...')
  readingState.value = loadReadingState()
  console.log('Loaded reading state:', readingState.value)
  updateColumns()
})

// Watch for books changes
watch(
  () => props.books,
  (newBooks) => {
    console.log('Books changed, updating columns with', newBooks.length, 'books')
    updateColumns()
  },
  { deep: true, immediate: true },
)

// Computed
const isLoading = computed(() => columns.value.length === 0)

// Methods
function updateColumns() {
  console.log(
    'Updating columns with books:',
    props.books.length,
    'and reading state:',
    readingState.value,
  )

  if (props.books.length === 0) {
    // If no books, create empty columns
    columns.value = [
      { id: 'to-read', title: 'To Read', books: [] },
      { id: 'currently-reading', title: 'Currently Reading', books: [] },
      { id: 'read', title: 'Read', books: [] },
    ]
  } else {
    columns.value = booksToColumns(props.books, readingState.value)
  }

  console.log('Updated columns:', columns.value)
}

function saveState() {
  console.log('Saving state for columns:', columns.value)
  const state = columnsToReadingState(columns.value)
  saveReadingState(state)
  readingState.value = state
  console.log('Updated reading state:', readingState.value)
}

// Drag and drop handlers
function handleDragEnd(event: {
  from: HTMLElement
  to: HTMLElement
  item: HTMLElement
  newIndex: number
  oldIndex: number
}) {
  console.log('Drag end event:', event)
  const { from, to, item, newIndex, oldIndex } = event

  if (!from || !to || !item) {
    console.log('Missing required elements:', { from: !!from, to: !!to, item: !!item })
    return
  }

  const sourceColumnId = from.getAttribute('data-column-id')
  const targetColumnId = to.getAttribute('data-column-id')
  const bookIdStr = item.getAttribute('data-book-id')
  const bookId = bookIdStr ? parseInt(bookIdStr) : 0

  console.log('Drag details:', { sourceColumnId, targetColumnId, bookId, newIndex, oldIndex })

  if (!sourceColumnId || !targetColumnId || !bookId) {
    console.log('Missing required attributes:', { sourceColumnId, targetColumnId, bookId })
    return
  }

  // Find the book and update its status if moved to different column
  if (sourceColumnId !== targetColumnId) {
    const targetColumn = columns.value.find((col) => col.id === targetColumnId)
    if (targetColumn) {
      const book = targetColumn.books.find((b) => b.id === bookId)
      if (book) {
        book.readingStatus = targetColumnId as 'to-read' | 'currently-reading' | 'read'
        console.log(`Updated book ${bookId} status to ${targetColumnId}`)
      }
    }
  }

  // Update order for all books in both columns
  columns.value.forEach((column) => {
    column.books.forEach((book, index) => {
      book.order = index
    })
  })

  // Save to localStorage
  saveState()

  // Emit status change if column changed
  if (sourceColumnId !== targetColumnId) {
    emit('status-change', bookId, targetColumnId as 'to-read' | 'currently-reading' | 'read')
  }
}

// Method to reload reading state from localStorage
function reloadReadingState() {
  console.log('Reloading reading state from localStorage...')
  readingState.value = loadReadingState()
  console.log('Reloaded reading state:', readingState.value)
  updateColumns()
}

// Debug method to clear localStorage
function clearState() {
  console.log('Clearing reading state...')
  clearReadingState()
  readingState.value = {}
  updateColumns()
}

// Expose methods for parent component
defineExpose({
  updateColumns,
  reloadReadingState,
  clearState,
})
</script>

<template>
  <div class="kanban-board">
    <div v-if="isLoading" class="p-5 text-center mt-5 rounded-lg bg-blue-50 text-blue-600">
      Loading kanban board...
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="column in columns"
        :key="column.id"
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
        >
          <template #item="{ element: book }">
            <div
              :data-book-id="book.id"
              class="book-card bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-grab active:cursor-grabbing"
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
