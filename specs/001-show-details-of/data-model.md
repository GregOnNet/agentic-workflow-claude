# Data Model: Book Details View

**Feature**: Book Details View
**Date**: 2025-10-07
**Status**: Complete

## Overview

This document defines the data structures, types, and state management patterns for the Book Details View feature. All types extend or reuse existing interfaces from `src/types/index.ts` to maintain consistency across the application.

## Core Entities

### Book

**Source**: `src/types/index.ts` (existing)

```typescript
export interface Book {
  id: number // Unique identifier, used in URL routing
  title: string // Book title, displayed as h1
  author: string // Author name, required field
  cover?: string // URL to cover image, optional
  description?: string // Full description, optional
  year?: number // Publication year, optional
}
```

**Usage in Feature**:

- Primary data structure for detail view
- All fields displayed when available
- Optional fields (`cover`, `description`, `year`) handled gracefully
- No modifications needed to existing interface

**Validation Rules**:

- `id`: Must be positive integer
- `title`: Non-empty string, max 500 characters
- `author`: Non-empty string, max 200 characters
- `cover`: Valid URL format if present
- `year`: Must be 4-digit number between 1000-9999 if present

---

### Reading Status

**Source**: `src/types/index.ts` (existing)

```typescript
type ReadingStatus = 'to-read' | 'currently-reading' | 'read'
```

**Usage in Feature**:

- Displayed in status selector on detail page
- User can change status from detail view
- Persisted via `useReadingState` composable
- Synchronized across all views (list, kanban, detail)

**State Transitions**:

```
      ┌─────────────────────────────┐
      │                             │
      v                             │
  to-read ──────► currently-reading ──────► read
      ^               │                       │
      │               │                       │
      └───────────────┴───────────────────────┘

  All transitions are bidirectional (user can move status in any direction)
```

---

### Route Parameters

**Definition**: URL path parameters for book detail routing

```typescript
interface BookDetailRouteParams {
  id: string // Book ID from URL, converted to number for API calls
}
```

**Usage**:

```typescript
// In BookDetailView.vue
import { useRoute } from 'vue-router'

const route = useRoute()
const bookId = computed(() => Number(route.params.id))
```

**Validation**:

- Must be numeric string
- Must convert to valid positive integer
- Invalid IDs trigger error state

---

## Component State

### BookDetailView State

The detail view component maintains the following reactive state:

```typescript
interface BookDetailState {
  // Book data
  book: Ref<Book | null> // Current book, null during loading or error
  isLoading: Ref<boolean> // True during API fetch
  error: Ref<Error | null> // Error object if fetch fails

  // Reading status
  currentStatus: Ref<ReadingStatus | undefined> // Current reading status from localStorage

  // UI state
  isChangingStatus: Ref<boolean> // True during status update
  showSuccessMessage: Ref<boolean> // Show confirmation after status change
}
```

**State Flow**:

```
1. Component Mount
   └─> isLoading = true
   └─> fetchBook(id)
       ├─> Success: book = data, isLoading = false
       └─> Error: error = err, isLoading = false

2. Status Change
   └─> isChangingStatus = true
   └─> setBookStatus(id, status)
       └─> currentStatus = newStatus
       └─> isChangingStatus = false
       └─> showSuccessMessage = true (brief)
```

---

## Composables

### useBookDetail

**Purpose**: Fetch and manage single book data

```typescript
interface UseBookDetailReturn {
  book: Ref<Book | null>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  fetchBook: () => Promise<void>
  refetch: () => Promise<void>
}

export function useBookDetail(bookId: Ref<number>): UseBookDetailReturn
```

**State Management**:

- Reactive to `bookId` changes (if ID changes, refetch)
- Handles loading states automatically
- Provides error information for UI display
- Supports manual refetch for error recovery

---

### useReadingState (existing)

**Source**: `src/composables/useReadingState.ts`

```typescript
interface UseReadingStateReturn {
  getBookStatus: (bookId: number) => ReadingStatus | undefined
  setBookStatus: (bookId: number, status: ReadingStatus) => void
  removeBookStatus: (bookId: number) => void
  getAllStatuses: () => BookReadingState
}

export function useReadingState(): UseReadingStateReturn
```

**Usage in Feature**:

```typescript
// Get initial status
const currentStatus = ref(getBookStatus(bookId.value))

// Update status
function handleStatusChange(newStatus: ReadingStatus) {
  setBookStatus(bookId.value, newStatus)
  currentStatus.value = newStatus
}
```

**Storage Format** (localStorage):

```typescript
interface BookReadingState {
  [bookId: number]: {
    status: ReadingStatus
    order: number // For kanban board ordering
  }
}
```

---

### useErrorHandler (existing)

**Source**: `src/composables/useErrorHandler.ts`

```typescript
interface UseErrorHandlerReturn {
  error: Ref<Error | null>
  handleError: (err: Error, context?: string) => void
  clearError: () => void
  safeExecute: <T>(fn: () => T, context: string, fallback?: T) => T | undefined
  withErrorHandling: <T>(fn: () => Promise<T>, context: string) => Promise<T | null>
}

export function useErrorHandler(): UseErrorHandlerReturn
```

**Usage in Feature**:

```typescript
const { error: componentError, handleError, clearError } = useErrorHandler()

// Error boundary
onErrorCaptured((err, instance, info) => {
  handleError(err, `BookDetailView.${info}`)
  return false
})

// Fetch error handling
try {
  await fetchBook()
} catch (err) {
  handleError(err as Error, 'BookDetailView.fetchBook')
}
```

---

## Data Flow

### Loading Book Details

```
User navigates to /books/:id
         │
         v
Router matches route
         │
         v
BookDetailView mounts
         │
         v
onMounted() lifecycle hook
         │
         v
fetchBook() called
         │
         ├─> isLoading = true
         │
         v
HTTP GET /books/:id
         │
         ├──[Success]──> book.value = response
         │               isLoading = false
         │               Load reading status from localStorage
         │
         └──[Error]───> error.value = error
                        isLoading = false
                        Display error UI
```

### Updating Reading Status

```
User selects new status
         │
         v
handleStatusChange(newStatus)
         │
         v
setBookStatus(bookId, newStatus)
         │
         v
localStorage updated
         │
         v
currentStatus.value = newStatus
         │
         v
UI reflects new status
         │
         v
Brief success message (optional)
```

---

## Error States

### Error Types and Handling

```typescript
type BookDetailError =
  | { type: 'NOT_FOUND'; message: 'Book not found' }
  | { type: 'NETWORK_ERROR'; message: 'Unable to connect to server' }
  | { type: 'INVALID_ID'; message: 'Invalid book ID' }
  | { type: 'SERVER_ERROR'; message: 'Server error occurred' }
  | { type: 'UNKNOWN'; message: string }
```

**Error UI States**:

1. **Book Not Found (404)**:

   ```html
   <div class="error-state">
     <h2>Book Not Found</h2>
     <p>The book you're looking for doesn't exist.</p>
     <button @click="router.push('/books')">Return to Book List</button>
   </div>
   ```

2. **Network Error**:

   ```html
   <div class="error-state">
     <h2>Connection Error</h2>
     <p>Unable to load book details. Please check your connection.</p>
     <button @click="refetch">Retry</button>
   </div>
   ```

3. **Invalid Book ID**:
   ```html
   <div class="error-state">
     <h2>Invalid Book</h2>
     <p>The book ID in the URL is invalid.</p>
     <button @click="router.push('/books')">Return to Book List</button>
   </div>
   ```

---

## Data Validation

### Client-Side Validation

**Book ID Validation**:

```typescript
function isValidBookId(id: string): boolean {
  const numId = Number(id)
  return !isNaN(numId) && numId > 0 && Number.isInteger(numId)
}

// Usage
if (!isValidBookId(route.params.id)) {
  handleError(new Error('Invalid book ID'), 'BookDetailView.validation')
  return
}
```

**Optional Field Handling**:

```typescript
// Cover image with fallback
const coverUrl = computed(() => book.value?.cover || '/placeholder-cover.jpg')

// Description with graceful absence
const hasDescription = computed(
  () => book.value?.description && book.value.description.trim().length > 0,
)

// Year display
const displayYear = computed(() => (book.value?.year ? ` (${book.value.year})` : ''))
```

---

## Performance Considerations

### Data Caching

**No Caching Required**:

- Detail view is ephemeral (loaded fresh on each visit)
- Book data is small (~1-5KB per book)
- API response time expected <500ms
- If caching needed later, can use composable-level cache

**Potential Optimization** (future):

```typescript
const bookCache = new Map<number, Book>()

export function useBookDetail(bookId: Ref<number>) {
  // Check cache before fetching
  if (bookCache.has(bookId.value)) {
    book.value = bookCache.get(bookId.value)!
    return
  }

  // Fetch and cache
  const data = await fetchBook()
  bookCache.set(bookId.value, data)
}
```

### Memory Management

- Component cleanup handled by Vue automatically
- No manual subscriptions or listeners to clean up
- LocalStorage reads/writes are synchronous and fast
- No memory leaks expected

---

## Testing Data

### Mock Book Data

```typescript
// Test fixtures
export const mockBooks = {
  complete: {
    id: 1,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    cover: 'https://example.com/gatsby.jpg',
    description: 'A classic American novel...',
    year: 1925,
  },

  minimal: {
    id: 2,
    title: 'Test Book',
    author: 'Test Author',
    // No cover, description, or year
  },

  invalidId: {
    id: -1,
    title: 'Invalid',
    author: 'Invalid',
  },
}
```

### Test Scenarios

1. **Happy Path**: Complete book with all fields
2. **Missing Optionals**: Book without cover, description, year
3. **Not Found**: API returns 404
4. **Network Error**: API unreachable
5. **Invalid ID**: Non-numeric or negative ID
6. **Status Changes**: All status transitions
7. **Concurrent Fetches**: Multiple rapid navigations

---

## Summary

**Existing Types**: Reused without modification

- `Book` interface (complete)
- `ReadingStatus` type (complete)
- `BookReadingState` interface (complete)

**New Types**: Minimal additions

- `BookDetailRouteParams` (route typing)
- `BookDetailState` (component state definition)
- `UseBookDetailReturn` (composable interface)

**Data Sources**:

- **API**: Book details (`GET /books/:id`)
- **LocalStorage**: Reading status (existing pattern)
- **Route**: Book ID parameter

**State Management**: Composition API with composables

- No global state management needed
- Component-level reactive state
- Composables for shared logic

**Validation**: Client-side ID validation, graceful handling of missing optional fields

**Performance**: No caching needed initially, fast API responses expected

All data structures align with existing patterns and constitutional principles (SOLID, type safety, composability).
