# Phase 0: Research & Technical Decisions

**Feature**: Book Details View
**Date**: 2025-10-07
**Status**: Complete

## Overview

This document captures all technical research and decisions made during Phase 0 of the implementation planning process. All "NEEDS CLARIFICATION" items from the Technical Context have been resolved through research and analysis of existing codebase patterns.

## Research Areas

### 1. Vue Router Dynamic Routes

**Research Question**: How should we implement routing for individual book detail pages?

**Decision**: Use `/books/:id` route pattern with `useRoute()` composable

**Rationale**:

- Standard Vue Router pattern for resource detail pages
- Provides reactive access to route parameters via `useRoute().params.id`
- Supports deep linking automatically (users can bookmark/share URLs)
- Enables browser back/forward navigation without additional code
- Consistent with RESTful URL patterns

**Implementation Pattern**:

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/books/:id',
      name: 'book-detail',
      component: () => import('../views/BookDetailView.vue'),
      props: true, // Pass route params as props
    },
  ],
})
```

**Component Usage**:

```typescript
// BookDetailView.vue
import { useRoute } from 'vue-router'

const route = useRoute()
const bookId = computed(() => Number(route.params.id))
```

**Alternatives Considered**:

- **Query parameters** (`/books?id=123`): Less clean URLs, harder to share, not RESTful
- **Hash-based routing** (`#/books/123`): Not needed for modern SPA, worse for SEO, less shareable
- **State-based navigation**: Breaks deep linking, requires complex state management

**Conclusion**: Dynamic route params are the industry standard and best fit for this use case.

---

### 2. Data Fetching Strategy

**Research Question**: How should we fetch individual book data for the detail view?

**Decision**: Create dedicated `useBookDetail` composable or extend existing `useBookData`

**Rationale**:

- Maintains Single Responsibility Principle
- Reuses existing error handling patterns from `useErrorHandler`
- Provides consistent loading state management
- Follows existing composable patterns in the codebase
- Can leverage existing `getBookById` function if it exists, or create it

**API Endpoint Analysis**:

- Base URL: `http://localhost:4730`
- Expected endpoint: `GET /books/:id`
- Response format: Single Book object (matches `Book` interface)
- Error responses: 404 for not found, 500 for server errors

**Implementation Pattern**:

```typescript
// composables/useBookDetail.ts
export function useBookDetail(bookId: Ref<number>) {
  const book = ref<Book | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBook() {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`http://localhost:4730/books/${bookId.value}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Book not found')
        }
        throw new Error(`Failed to fetch book: ${response.status}`)
      }

      book.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      book.value = null
    } finally {
      isLoading.value = false
    }
  }

  return { book, isLoading, error, fetchBook }
}
```

**Alternatives Considered**:

- **Direct fetch in component**: Violates SOLID principles, hard to test, no reusability
- **Global state (Pinia/Vuex)**: Overkill for simple detail view, adds unnecessary complexity
- **Reuse list fetching logic**: Different concerns (list pagination vs single item), less focused

**Conclusion**: Dedicated composable provides best balance of reusability, testability, and maintainability.

---

### 3. Reading Status Management

**Research Question**: How should users manage reading status from the detail view?

**Decision**: Reuse existing `useReadingState` composable

**Existing Implementation Analysis**:

- Located at: `src/composables/useReadingState.ts`
- Uses localStorage for persistence
- Provides: `getBookStatus`, `setBookStatus` methods
- Already integrated in BookList and BookKanban components
- Status types: 'to-read' | 'currently-reading' | 'read'

**Integration Approach**:

```typescript
// BookDetailView.vue
const { getBookStatus, setBookStatus } = useReadingState()

// Get current status on mount
const currentStatus = ref<string | undefined>(getBookStatus(bookId.value))

// Update status
function handleStatusChange(newStatus: string) {
  setBookStatus(bookId.value, newStatus)
  currentStatus.value = newStatus
}
```

**UI Component**:

- Use `<select>` dropdown or button group for status selection
- Display current status prominently
- Provide visual feedback on status change
- Follow existing styling patterns from BookCard

**Rationale**:

- No code duplication
- Consistent state management across views
- Automatic localStorage synchronization
- Already tested and working in other components

**Alternatives Considered**:

- **Create new status composable**: Duplicates existing functionality
- **Direct localStorage access**: Bypasses abstraction layer, violates DIP
- **API-based status**: Not part of current requirements, localStorage sufficient

**Conclusion**: Reusing existing composable is optimal solution.

---

### 4. Error Handling Patterns

**Research Question**: How should we handle errors (book not found, API failures, etc.)?

**Decision**: Use existing `useErrorHandler` composable with `onErrorCaptured`

**Existing Error Handling Analysis**:

- Located at: `src/composables/useErrorHandler.ts`
- Provides: `error`, `handleError`, `clearError` methods
- Integrated with component-level error boundaries
- Displays user-friendly error messages
- Supports error logging and tracking

**Error Scenarios**:

1. **Book Not Found (404)**:
   - Display: "Book not found" message
   - Action: Provide button to return to book list
   - Implementation: Check error status, render error state

2. **API Unavailable (500, network error)**:
   - Display: "Unable to load book details" message
   - Action: Retry button
   - Implementation: Allow user to trigger re-fetch

3. **Invalid Book ID**:
   - Display: "Invalid book ID" message
   - Action: Redirect to book list or show error
   - Implementation: Validate ID format before fetch

4. **Component-Level Errors**:
   - Use `onErrorCaptured` hook to catch render errors
   - Display error boundary UI
   - Prevent full app crash

**Implementation Pattern**:

```typescript
// BookDetailView.vue
const { error: componentError, handleError, clearError } = useErrorHandler()

onErrorCaptured((err, instance, info) => {
  handleError(err, `BookDetailView.${info}`)
  return false // Prevent propagation
})

// In fetch error handling
catch (err) {
  handleError(err as Error, 'BookDetailView.fetchBook')
}
```

**Rationale**:

- Consistent error UX across application
- Centralized error logging
- User-friendly error messages
- Graceful degradation

**Conclusion**: Existing error handling infrastructure is sufficient and should be reused.

---

### 5. Responsive Layout Design

**Research Question**: How should the detail view layout adapt across different screen sizes?

**Decision**: Mobile-first Tailwind CSS with flexbox/grid layout

**Existing Styling Patterns**:

- Tailwind CSS 4.x utility classes
- Mobile-first breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Existing components use responsive grid and flex patterns
- Color scheme: Gray scale with blue accents

**Layout Breakpoints**:

**Mobile (< 640px)**:

- Single column layout
- Cover image full width, max height 300px
- Title and metadata stacked vertically
- Back button at top
- Status selector full width

**Tablet (640px - 1024px)**:

- Single column with increased padding
- Cover image centered, constrained width
- Larger typography
- More breathing room

**Desktop (> 1024px)**:

- Two-column grid layout
- Cover image in left column (40%)
- Book details in right column (60%)
- Fixed max-width container (max-w-7xl)

**Accessibility Considerations**:

- Sufficient color contrast (WCAG AA)
- Touch targets minimum 44x44px
- Readable font sizes (16px+ body text)
- Clear visual hierarchy

**Implementation Example**:

```html
<div class="max-w-7xl mx-auto px-5 py-5">
  <!-- Mobile: single column, Desktop: two columns -->
  <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
    <!-- Cover: spans full width on mobile, 2 cols on desktop -->
    <div class="lg:col-span-2">
      <img :src="book.cover" :alt="book.title" class="w-full h-auto rounded-lg shadow-lg" />
    </div>

    <!-- Details: spans full width on mobile, 3 cols on desktop -->
    <div class="lg:col-span-3">
      <h1 class="text-4xl font-bold mb-4">{{ book.title }}</h1>
      <!-- Rest of details -->
    </div>
  </div>
</div>
```

**Rationale**:

- Matches existing component patterns
- Mobile-first ensures good mobile UX
- Tailwind utilities enable rapid development
- No additional CSS framework needed

**Conclusion**: Tailwind responsive utilities with mobile-first approach.

---

### 6. Accessibility Implementation

**Research Question**: How do we ensure WCAG 2.1 AA compliance?

**Decision**: Semantic HTML structure with ARIA attributes and keyboard navigation

**WCAG 2.1 AA Requirements**:

1. **Perceivable**:
   - Alt text for cover images
   - Sufficient color contrast (4.5:1 for normal text)
   - Semantic HTML structure (h1, article, section)
   - Responsive text sizing

2. **Operable**:
   - Keyboard accessible controls
   - Focus visible (browser default or custom)
   - No keyboard traps
   - Skip links if needed

3. **Understandable**:
   - Clear heading hierarchy
   - Consistent navigation
   - Error messages clear and actionable
   - Labels for form controls

4. **Robust**:
   - Valid HTML
   - ARIA attributes used correctly
   - Compatible with assistive technologies

**Implementation Checklist**:

- ✅ Use `<main>` landmark for primary content
- ✅ Use `<article>` for book content
- ✅ Use `<h1>` for book title (only h1 on page)
- ✅ Provide alt text for cover image: `:alt="book.title"`
- ✅ Use `<button>` for back navigation with aria-label
- ✅ Use `<select>` or button group with labels for status
- ✅ Ensure focus styles are visible
- ✅ Test with screen reader (VoiceOver/NVDA)
- ✅ Validate with axe DevTools

**Implementation Example**:

```html
<main class="max-w-7xl mx-auto px-5 py-5" role="main">
  <article aria-labelledby="book-title">
    <button @click="handleBack" aria-label="Back to book list" class="mb-4 px-4 py-2 ...">
      ← Back
    </button>

    <img :src="book.cover" :alt="`Cover image of ${book.title}`" class="..." />

    <h1 id="book-title" class="text-4xl font-bold">{{ book.title }}</h1>

    <label for="reading-status" class="..."> Reading Status </label>
    <select id="reading-status" v-model="currentStatus" @change="handleStatusChange" class="...">
      <option value="to-read">To Read</option>
      <option value="currently-reading">Currently Reading</option>
      <option value="read">Read</option>
    </select>
  </article>
</main>
```

**Testing Strategy**:

- Run Lighthouse accessibility audit (target: 100 score)
- Test with keyboard only (Tab, Enter, Escape)
- Test with screen reader
- Validate HTML with W3C validator
- Run axe DevTools automated checks

**Rationale**:

- Constitutional requirement
- Legal compliance (ADA, Section 508)
- Improves UX for all users
- SEO benefits from semantic HTML

**Conclusion**: Comprehensive accessibility implementation required and achievable.

---

### 7. Testing Strategy

**Research Question**: What testing approach ensures quality and meets constitution requirements?

**Decision**: Multi-layered testing with unit tests (Vitest) and e2e tests (Playwright)

**Testing Layers**:

**1. Unit Tests (Vitest)**

**Coverage Target**: 80%+ (constitutional requirement)

**Test Subjects**:

- BookDetailView.vue component
- useBookDetail composable (if created)
- Error handling scenarios
- Status management integration

**Key Test Cases**:

```typescript
describe('BookDetailView', () => {
  test('should render book details when data loads', () => {
    // Arrange: Mock book data
    // Act: Mount component
    // Assert: Verify all fields displayed
  })

  test('should display loading state during fetch', () => {
    // Arrange: Mock delayed fetch
    // Act: Mount component
    // Assert: Loading indicator visible
  })

  test('should handle missing optional fields gracefully', () => {
    // Arrange: Book without year/description
    // Act: Mount component
    // Assert: No errors, graceful degradation
  })

  test('should update reading status when changed', () => {
    // Arrange: Book with status
    // Act: Change status in UI
    // Assert: setBookStatus called, UI updated
  })

  test('should display error when book not found', () => {
    // Arrange: Mock 404 response
    // Act: Mount component
    // Assert: Error message displayed
  })
})
```

**2. E2E Tests (Playwright)**

**Coverage**: Critical user flows

**Test Scenarios**:

```typescript
// e2e/book-details.spec.ts
test.describe('Book Details View', () => {
  test('should navigate from list to detail and back', async ({ page }) => {
    // Arrange: Navigate to book list
    // Act: Click first book
    // Assert: Detail page loads with correct book
    // Act: Click back button
    // Assert: Returns to list
  })

  test('should display all book information', async ({ page }) => {
    // Arrange: Navigate to detail page
    // Act: Wait for load
    // Assert: Title, author, cover, year, description visible
  })

  test('should persist status changes across views', async ({ page }) => {
    // Arrange: Navigate to detail
    // Act: Change status
    // Act: Return to list
    // Assert: Status reflected in list
  })

  test('should handle direct URL navigation', async ({ page }) => {
    // Arrange: Navigate directly to /books/1
    // Act: Page loads
    // Assert: Book details displayed
  })

  test('should show error for invalid book ID', async ({ page }) => {
    // Arrange: Navigate to /books/999999
    // Act: Page loads
    // Assert: Error message displayed
  })
})
```

**Page Object Model (POM)**:

```typescript
// e2e/pages/BookDetailPage.ts
export class BookDetailPage {
  constructor(public readonly page: Page) {}

  readonly backButton = this.page.getByRole('button', { name: 'Back to book list' })
  readonly bookTitle = this.page.getByRole('heading', { level: 1 })
  readonly bookAuthor = this.page.getByTestId('book-author')
  readonly bookCover = this.page.getByRole('img', { name: /cover image/i })
  readonly statusSelect = this.page.getByLabel('Reading Status')

  async goto(bookId: number) {
    await this.page.goto(`/books/${bookId}`)
  }

  async changeStatus(status: string) {
    await this.statusSelect.selectOption(status)
  }

  async clickBack() {
    await this.backButton.click()
  }
}
```

**3. Accessibility Tests**

```typescript
import AxeBuilder from '@axe-core/playwright'

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('/books/1')

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

  expect(accessibilityScanResults.violations).toEqual([])
})
```

**Test Data Management**:

- Use mock book data for unit tests
- Use test fixtures for e2e tests
- Ensure consistent test data across test suites

**Rationale**:

- Constitutional requirement (80%+ coverage)
- Multi-layered approach catches different bug types
- E2E tests validate actual user experience
- POM pattern improves test maintainability

**Conclusion**: Comprehensive testing strategy aligns with constitution and ensures quality.

---

### 8. Performance Optimization

**Research Question**: How do we ensure the detail view meets performance requirements?

**Decision**: Lazy route loading, computed properties, and minimal bundle impact

**Performance Requirements**:

- Page load: <1 second (from spec)
- Navigation: <3 seconds total (from spec)
- Bundle addition: <200KB (from constitution)
- Lighthouse score: >90 (from constitution)

**Optimization Techniques**:

**1. Route-Level Code Splitting**:

```typescript
// router/index.ts
{
  path: '/books/:id',
  component: () => import('../views/BookDetailView.vue') // Lazy loaded
}
```

- Benefit: Only loads detail view code when needed
- Impact: ~10-15KB additional bundle size

**2. Computed Properties**:

```typescript
// BookDetailView.vue
const displayYear = computed(() => (book.value?.year ? `(${book.value.year})` : ''))

const statusLabel = computed(() => {
  const labels = {
    'to-read': 'To Read',
    'currently-reading': 'Currently Reading',
    read: 'Read',
  }
  return labels[currentStatus.value] || 'Unknown'
})
```

- Benefit: Cached derived data, no recalculation on re-render
- Impact: Minimal, prevents unnecessary computation

**3. Image Optimization**:

```html
<img
  :src="book.cover"
  :alt="book.title"
  loading="lazy"
  class="..."
  onerror="this.src='/placeholder.jpg'"
/>
```

- Benefit: Lazy loading improves initial page load
- Fallback: Provides graceful degradation for missing images

**4. Minimal Re-renders**:

- Use `v-memo` if list rendering needed (not applicable here)
- Avoid computed properties in template loops
- Keep template expressions simple

**5. API Response Optimization**:

- Assume API returns only necessary data
- No additional transformation needed for Book interface
- Direct assignment to reactive ref

**Estimated Bundle Impact**:

- BookDetailView component: ~8KB
- useBookDetail composable (if new): ~2KB
- Route configuration: ~1KB
- Total: ~11KB (well under 200KB limit)

**Monitoring Strategy**:

- Run Lighthouse before and after feature implementation
- Measure with Chrome DevTools Performance tab
- Verify bundle size with Vite build analysis
- Test on throttled 3G connection

**Performance Metrics**:

- Time to Interactive (TTI): <2 seconds
- First Contentful Paint (FCP): <1 second
- Largest Contentful Paint (LCP): <1.5 seconds
- Cumulative Layout Shift (CLS): <0.1

**Rationale**:

- Constitutional requirements met
- Best practices for Vue.js 3 SPAs
- Minimal performance impact
- Lazy loading prevents bloat

**Conclusion**: Performance requirements achievable with standard optimization techniques.

---

## Research Summary

All technical decisions have been made and documented:

1. ✅ **Routing**: Vue Router dynamic routes (`/books/:id`)
2. ✅ **Data Fetching**: Dedicated composable with error handling
3. ✅ **Status Management**: Reuse existing `useReadingState`
4. ✅ **Error Handling**: Reuse existing `useErrorHandler`
5. ✅ **Layout**: Mobile-first Tailwind CSS responsive design
6. ✅ **Accessibility**: WCAG 2.1 AA with semantic HTML
7. ✅ **Testing**: Unit tests (Vitest) + E2E tests (Playwright)
8. ✅ **Performance**: Lazy loading, computed properties, <200KB impact

**Constitution Compliance**: All decisions align with constitutional principles

**Next Phase**: Proceed to Phase 1 (Design & Contracts)
