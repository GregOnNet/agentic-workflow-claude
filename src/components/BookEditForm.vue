<script setup lang="ts">
import { useBookEdit } from '@/composables/useBookEdit'
import type { Book } from '@/types'
import { computed, toRef } from 'vue'

const props = defineProps<{
  book: Book
}>()

const emit = defineEmits<{
  (e: 'saved', book: Book): void
  (e: 'cancel'): void
  (e: 'dirty-change', dirty: boolean): void
}>()

const bookRef = toRef(props, 'book')
const { form, errors, isSaving, saveError, isDirty, save, reset } = useBookEdit(bookRef)

const canSubmit = computed(() => !isSaving.value)

function handleDirtyChange() {
  emit('dirty-change', isDirty.value)
}

async function onSubmit() {
  const updated = await save()
  handleDirtyChange()
  if (updated) {
    emit('saved', updated)
  }
}

function onCancel() {
  reset()
  handleDirtyChange()
  emit('cancel')
}

function onInput() {
  // Emit dirty state as the user types so parent can warn on navigation
  handleDirtyChange()
}
</script>

<template>
  <form
    @submit.prevent="onSubmit"
    aria-label="Edit book"
    data-testid="book-edit-form"
    class="space-y-4"
    novalidate
  >
    <div v-if="saveError" class="p-4 rounded-lg bg-red-50 text-red-700" role="alert">
      <p class="font-medium">Failed to save changes</p>
      <p class="text-sm">{{ saveError.message }}</p>
    </div>

    <div>
      <label for="book-title" class="block text-sm font-medium text-gray-700 mb-1">
        Title
      </label>
      <input
        id="book-title"
        v-model="form.title"
        @input="onInput"
        type="text"
        required
        data-testid="book-title-input"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        :aria-invalid="!!errors.title"
        aria-describedby="book-title-error"
      />
      <p
        v-if="errors.title"
        id="book-title-error"
        class="mt-1 text-sm text-red-600"
        data-testid="book-title-error"
        role="alert"
      >
        {{ errors.title }}
      </p>
    </div>

    <div>
      <label for="book-author" class="block text-sm font-medium text-gray-700 mb-1">
        Author
      </label>
      <input
        id="book-author"
        v-model="form.author"
        @input="onInput"
        type="text"
        required
        data-testid="book-author-input"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        :aria-invalid="!!errors.author"
        aria-describedby="book-author-error"
      />
      <p
        v-if="errors.author"
        id="book-author-error"
        class="mt-1 text-sm text-red-600"
        data-testid="book-author-error"
        role="alert"
      >
        {{ errors.author }}
      </p>
    </div>

    <div>
      <label for="book-year" class="block text-sm font-medium text-gray-700 mb-1">
        Year
      </label>
      <input
        id="book-year"
        v-model="form.year"
        @input="onInput"
        type="text"
        inputmode="numeric"
        data-testid="book-year-input"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        :aria-invalid="!!errors.year"
        aria-describedby="book-year-error"
      />
      <p
        v-if="errors.year"
        id="book-year-error"
        class="mt-1 text-sm text-red-600"
        data-testid="book-year-error"
        role="alert"
      >
        {{ errors.year }}
      </p>
    </div>

    <div>
      <label for="book-cover" class="block text-sm font-medium text-gray-700 mb-1">
        Cover URL
      </label>
      <input
        id="book-cover"
        v-model="form.cover"
        @input="onInput"
        type="url"
        data-testid="book-cover-input"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        :aria-invalid="!!errors.cover"
        aria-describedby="book-cover-error"
      />
      <p
        v-if="errors.cover"
        id="book-cover-error"
        class="mt-1 text-sm text-red-600"
        data-testid="book-cover-error"
        role="alert"
      >
        {{ errors.cover }}
      </p>
    </div>

    <div>
      <label for="book-description" class="block text-sm font-medium text-gray-700 mb-1">
        Description
      </label>
      <textarea
        id="book-description"
        v-model="form.description"
        @input="onInput"
        rows="5"
        data-testid="book-description-input"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      ></textarea>
    </div>

    <div class="flex gap-3 pt-2">
      <button
        type="submit"
        :disabled="!canSubmit"
        data-testid="book-edit-save"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isSaving ? 'Saving…' : 'Save' }}
      </button>
      <button
        type="button"
        @click="onCancel"
        :disabled="isSaving"
        data-testid="book-edit-cancel"
        class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  </form>
</template>
