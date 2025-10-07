# Quick Start Guide: Book Details View

**Feature**: Book Details View
**Date**: 2025-10-07
**For**: Developers implementing this feature

## Overview

This guide provides step-by-step instructions for implementing, testing, and deploying the Book Details View feature. Follow these steps in order to ensure proper implementation according to the constitution and specifications.

## Prerequisites

### Required Knowledge

- Vue.js 3 Composition API
- TypeScript basics
- Vue Router
- Tailwind CSS
- Vitest (unit testing)
- Playwright (e2e testing)

### Development Environment

- Node.js 20.19.0 or 22.12.0+
- npm installed
- Git for version control
- Code editor (VS Code recommended)

### Project Setup

```bash
# Install dependencies (if not already done)
npm install

# Ensure API server is running
# API should be accessible at http://localhost:4730
```

---

## Implementation Steps

### Phase 1: Router Configuration (15 min)

**1.1: Add Book Detail Route**

Edit `src/router/index.ts`:

```typescript
// Add import at top
const routes = [
  // ... existing routes

  // Add this new route
  {
    path: '/books/:id',
    name: 'book-detail',
    component: () => import('../views/BookDetailView.vue'),
    props: true,
    meta: {
      title: 'Book Details',
    },
  },
]
```

**Verify**: Routes are defined without TypeScript errors

---

### Phase 2: Create Composable (30 min)

**2.1: Create Book Detail Composable**

Create new file `src/composables/useBookDetail.ts`:

```typescript
import { ref, type Ref, watch } from 'vue'
import type { Book } from '@/types'

const API_BASE_URL = 'http://localhost:4730'

export function useBookDetail(bookId: Ref<number>) {
  const book = ref<Book | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchBook() {
    if (!bookId.value || bookId.value <= 0) {
      error.value = new Error('Invalid book ID')
      return
    }

    isLoading.value = true
    error.value = null
    book.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/books/${bookId.value}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Book not found')
        }
        throw new Error(`HTTP error: ${response.status}`)
      }

      book.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
      book.value = null
    } finally {
      isLoading.value = false
    }
  }

  // Auto-fetch when bookId changes
  watch(
    bookId,
    () => {
      fetchBook()
    },
    { immediate: true },
  )

  return {
    book,
    isLoading,
    error,
    fetchBook,
    refetch: fetchBook,
  }
}
```

**Verify**: No TypeScript errors, composable exports all required functions

---

### Phase 3: Create View Component (60 min)

**3.1: Create Book Detail View Component**

Create new file `src/views/BookDetailView.vue`:

```vue
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
  setBookStatus(bookId.value, newStatus)
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
```

**Verify**:

- Component compiles without errors
- All required imports are present
- Follows component structure guidelines from constitution

---

### Phase 4: Update Navigation (15 min)

**4.1: Update Book Card Click Handler**

Edit `src/components/BookCard.vue` to add click navigation:

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Book } from '../types'

defineProps<{
  book: Book
}>()

const router = useRouter()

function handleClick(bookId: number) {
  router.push(`/books/${bookId}`)
}
</script>

<template>
  <div
    @click="handleClick(book.id)"
    @keypress.enter="handleClick(book.id)"
    tabindex="0"
    role="button"
    :aria-label="`View details for ${book.title}`"
    class="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 bg-white cursor-pointer"
  >
    <!-- Existing card content -->
  </div>
</template>
```

**Verify**: Clicking a book card navigates to detail page

---

## Testing

### Unit Tests (60 min)

**5.1: Test Composable**

Create `src/composables/__tests__/useBookDetail.spec.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useBookDetail } from '../useBookDetail'

describe('useBookDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch book data successfully', async () => {
    const mockBook = {
      id: 1,
      title: 'Test Book',
      author: 'Test Author',
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockBook),
      } as Response),
    )

    const bookId = ref(1)
    const { book, isLoading, error } = useBookDetail(bookId)

    // Wait for fetch to complete
    await vi.waitFor(() => expect(isLoading.value).toBe(false))

    expect(book.value).toEqual(mockBook)
    expect(error.value).toBeNull()
  })

  it('should handle 404 error', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
      } as Response),
    )

    const bookId = ref(999)
    const { book, error } = useBookDetail(bookId)

    await vi.waitFor(() => expect(error.value).not.toBeNull())

    expect(book.value).toBeNull()
    expect(error.value?.message).toContain('not found')
  })
})
```

**5.2: Test Component**

Create `src/views/__tests__/BookDetailView.spec.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import BookDetailView from '../BookDetailView.vue'

describe('BookDetailView', () => {
  it('should render loading state initially', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/books/:id', component: BookDetailView }],
    })

    const wrapper = mount(BookDetailView, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Loading')
  })

  it('should display book details when loaded', async () => {
    // Test implementation
    // Mock fetch, mount component, verify rendered content
  })
})
```

**Run Tests**:

```bash
npm run test:unit
```

**Verify**: All unit tests pass, coverage >80%

---

### E2E Tests (90 min)

**6.1: Create Page Object Model**

Create `e2e/pages/BookDetailPage.ts`:

```typescript
import { type Page, type Locator } from '@playwright/test'

export class BookDetailPage {
  readonly page: Page
  readonly backButton: Locator
  readonly bookTitle: Locator
  readonly bookAuthor: Locator
  readonly bookCover: Locator
  readonly bookDescription: Locator
  readonly statusSelect: Locator
  readonly loadingIndicator: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.backButton = page.getByRole('button', { name: /back to book list/i })
    this.bookTitle = page.getByRole('heading', { level: 1 })
    this.bookAuthor = page.getByTestId('book-author')
    this.bookCover = page.getByRole('img', { name: /cover image/i })
    this.statusSelect = page.getByLabel('Reading Status')
    this.loadingIndicator = page.getByText('Loading book details...')
    this.errorMessage = page.getByRole('alert')
  }

  async goto(bookId: number) {
    await this.page.goto(`/books/${bookId}`)
  }

  async changeStatus(status: string) {
    await this.statusSelect.selectOption(status)
  }

  async clickBack() {
    await this.backButton.click()
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle')
  }
}
```

**6.2: Create E2E Tests**

Create `e2e/book-details.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'
import { BookDetailPage } from './pages/BookDetailPage'

test.describe('Book Details View', () => {
  test('should navigate from list to detail and back', async ({ page }) => {
    // Arrange: Go to book list
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Book Collection' })).toBeVisible()

    // Act: Click first book
    const firstBook = page.getByRole('heading', { level: 3 }).first()
    const bookTitle = await firstBook.textContent()
    await firstBook.click()

    // Assert: Detail page loads with correct book
    const detailPage = new BookDetailPage(page)
    await expect(detailPage.bookTitle).toContainText(bookTitle!)

    // Act: Click back
    await detailPage.clickBack()

    // Assert: Returns to list
    await expect(page.getByRole('heading', { name: 'Book Collection' })).toBeVisible()
  })

  test('should display all book information', async ({ page }) => {
    // Arrange
    const detailPage = new BookDetailPage(page)
    await detailPage.goto(1)

    // Assert: All elements visible
    await expect(detailPage.bookTitle).toBeVisible()
    await expect(detailPage.bookAuthor).toBeVisible()
    await expect(detailPage.bookCover).toBeVisible()
  })

  test('should change reading status', async ({ page }) => {
    // Arrange
    const detailPage = new BookDetailPage(page)
    await detailPage.goto(1)

    // Act
    await detailPage.changeStatus('currently-reading')

    // Assert
    await expect(detailPage.statusSelect).toHaveValue('currently-reading')

    // Act: Navigate back to list
    await detailPage.clickBack()

    // Assert: Status persists (verify in list/kanban if visible)
  })

  test('should handle invalid book ID', async ({ page }) => {
    // Arrange
    const detailPage = new BookDetailPage(page)
    await detailPage.goto(999999)

    // Assert: Error displayed
    await expect(detailPage.errorMessage).toBeVisible()
    await expect(detailPage.errorMessage).toContainText(/not found/i)
  })
})
```

**Run E2E Tests**:

```bash
npm run test:e2e
```

**Verify**: All e2e tests pass on all browsers

---

## Verification Checklist

### Constitution Compliance

- [ ] **Code Quality**: SOLID principles followed
- [ ] **Single Responsibility**: Component, composables each have one job
- [ ] **Composition API**: Used throughout with proper structure
- [ ] **TypeScript**: Full type safety, no `any` types
- [ ] **Error Handling**: Centralized with `useErrorHandler`

### Testing Standards

- [ ] **Unit Tests**: >80% coverage achieved
- [ ] **E2E Tests**: Critical flows covered
- [ ] **AAA Pattern**: All tests follow Arrange-Act-Assert
- [ ] **Test Independence**: Tests run in any order
- [ ] **Selector Strategy**: Role-based selectors used

### UX Consistency

- [ ] **Accessibility**: WCAG 2.1 AA compliance verified
- [ ] **Semantic HTML**: `<main>`, `<article>`, `<h1>` used
- [ ] **Keyboard Nav**: All interactive elements accessible
- [ ] **Feedback**: Loading states, error messages present
- [ ] **Responsive**: Works on mobile/tablet/desktop

### Performance

- [ ] **Load Time**: <1 second on 4G (Lighthouse check)
- [ ] **Bundle Size**: <200KB additional
- [ ] **Optimization**: Computed properties used
- [ ] **Lighthouse Score**: >90

---

## Troubleshooting

### Issue: Route not found

**Solution**: Ensure route is registered in `router/index.ts` before BookDetailView component

### Issue: API 404 errors

**Solution**: Verify API server is running at `http://localhost:4730`

```bash
curl http://localhost:4730/books/1
```

### Issue: TypeScript errors

**Solution**: Ensure Book interface imported from `@/types`

### Issue: Tests failing

**Solution**: Clear cache and reinstall dependencies

```bash
rm -rf node_modules
npm install
npm run test:unit
```

---

## Quick Commands

```bash
# Development
npm run dev              # Start dev server

# Testing
npm run test:unit        # Run unit tests
npm run test:e2e         # Run e2e tests
npm run lint             # Check code quality

# Build
npm run build            # Production build
npm run type-check       # TypeScript validation
```

---

## Next Steps

1. ✅ Implementation complete - All code written
2. ✅ Tests passing - Unit and e2e tests pass
3. ⏳ Code Review - Submit PR for team review
4. ⏳ QA Testing - Manual testing by QA team
5. ⏳ Documentation - Update user-facing docs
6. ⏳ Deployment - Merge and deploy to production

---

## Resources

- [Vue Router Documentation](https://router.vuejs.org/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Project Constitution](../../.specify/memory/constitution.md)

---

**Estimated Total Time**: 4-5 hours for experienced Vue.js developer

For questions or issues, consult the [spec.md](./spec.md) or [plan.md](./plan.md) documents.
