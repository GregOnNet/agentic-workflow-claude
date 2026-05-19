import { computed, reactive, ref, watch, type Ref } from 'vue'
import type { Book } from '@/types'
import { updateBook, type BookUpdatePayload } from '@/data/books'

export interface BookEditFormState {
  title: string
  author: string
  year: string
  cover: string
  description: string
}

export interface BookEditErrors {
  title?: string
  author?: string
  year?: string
  cover?: string
}

function toFormState(book: Book | null): BookEditFormState {
  return {
    title: book?.title ?? '',
    author: book?.author ?? '',
    year: book?.year != null ? String(book.year) : '',
    cover: book?.cover ?? '',
    description: book?.description ?? '',
  }
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function useBookEdit(book: Ref<Book | null>) {
  const form = reactive<BookEditFormState>(toFormState(book.value))
  const errors = ref<BookEditErrors>({})
  const isSaving = ref(false)
  const saveError = ref<Error | null>(null)

  // Re-sync form when the underlying book changes (e.g., after a refetch)
  watch(book, (next) => {
    Object.assign(form, toFormState(next))
    errors.value = {}
    saveError.value = null
  })

  const isDirty = computed(() => {
    const initial = toFormState(book.value)
    return (
      initial.title !== form.title ||
      initial.author !== form.author ||
      initial.year !== form.year ||
      initial.cover !== form.cover ||
      initial.description !== form.description
    )
  })

  function validate(): boolean {
    const next: BookEditErrors = {}

    if (!form.title.trim()) {
      next.title = 'Title is required'
    }
    if (!form.author.trim()) {
      next.author = 'Author is required'
    }
    if (form.year.trim()) {
      if (!/^\d{4}$/.test(form.year.trim())) {
        next.year = 'Year must be a 4-digit number'
      }
    }
    if (form.cover.trim()) {
      if (!isValidUrl(form.cover.trim())) {
        next.cover = 'Cover must be a valid URL'
      }
    }

    errors.value = next
    return Object.keys(next).length === 0
  }

  function buildPayload(): BookUpdatePayload {
    const payload: BookUpdatePayload = {
      title: form.title.trim(),
      author: form.author.trim(),
    }
    const year = form.year.trim()
    if (year) payload.year = Number(year)
    const cover = form.cover.trim()
    if (cover) payload.cover = cover
    const description = form.description.trim()
    if (description) payload.description = description
    return payload
  }

  async function save(): Promise<Book | null> {
    if (!book.value) return null
    if (!validate()) return null

    isSaving.value = true
    saveError.value = null

    try {
      const updated = await updateBook(book.value.id, buildPayload())
      return updated
    } catch (err) {
      saveError.value = err instanceof Error ? err : new Error('Unknown error')
      return null
    } finally {
      isSaving.value = false
    }
  }

  function reset() {
    Object.assign(form, toFormState(book.value))
    errors.value = {}
    saveError.value = null
  }

  return {
    form,
    errors,
    isSaving,
    saveError,
    isDirty,
    validate,
    save,
    reset,
  }
}
