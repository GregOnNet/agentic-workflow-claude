<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  'page-change': [page: number]
}>()

// Computed pages for pagination UI
const paginationRange = computed(() => {
  const range: (number | string)[] = []
  const maxVisiblePages = 5

  if (props.totalPages <= maxVisiblePages) {
    // Show all pages if there are few
    for (let i = 1; i <= props.totalPages; i++) {
      range.push(i)
    }
  } else {
    // Always include first page
    range.push(1)

    // Calculate start and end of visible page range
    let start = Math.max(2, props.currentPage - 1)
    let end = Math.min(props.totalPages - 1, props.currentPage + 1)

    // Adjust if at start or end
    if (props.currentPage <= 2) {
      end = 4
    } else if (props.currentPage >= props.totalPages - 1) {
      start = props.totalPages - 3
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
    if (end < props.totalPages - 1) {
      range.push('...')
    }

    // Always include last page
    if (props.totalPages > 1) {
      range.push(props.totalPages)
    }
  }

  return range
})

function goToPage(page: number) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page)
  }
}
</script>

<template>
  <div class="flex justify-center mt-8" v-if="totalPages > 1">
    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
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
</template>
