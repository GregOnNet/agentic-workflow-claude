<script setup lang="ts">
import type { Book } from '../types'

defineProps<{
  book: Book
}>()
</script>

<template>
  <div
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
</template>
