# Implementation Plan: Book Details View

**Branch**: `001-show-details-of` | **Date**: 2025-10-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-show-details-of/spec.md`

## Summary

Implement a dedicated detail view for displaying comprehensive book information. Users will navigate from the book list to view full details including cover, title, author, year, and description. The view will support reading status management, deep linking via unique URLs, and graceful handling of missing data. Technical approach uses Vue Router for routing, Tailwind CSS for responsive layouts, and the existing HTTP API for data fetching.

## Technical Context

**Language/Version**: TypeScript 5.x with Vue.js 3.5+ (Composition API)
**Primary Dependencies**: Vue Router 4.5+, Vite 7.x, Tailwind CSS 4.x
**Storage**: LocalStorage for reading status (existing pattern), HTTP API for book data
**Testing**: Vitest for unit tests, Playwright for e2e tests
**Target Platform**: Web browsers (modern ES2020+), responsive design (mobile/tablet/desktop)
**Project Type**: Web application (single-page application)
**Performance Goals**: <1 second page load, <3 seconds total navigation round-trip
**Constraints**: <200KB bundle addition, WCAG 2.1 AA compliance, 80%+ test coverage
**Scale/Scope**: Single view component, 1 route, 2-3 composables, comprehensive test suite

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Code Quality & SOLID Principles (NON-NEGOTIABLE)

- ✅ **Single Responsibility**: BookDetails component focuses only on display, composables handle data fetching and status management
- ✅ **Open-Closed**: Reusable composables (useBookData, useReadingState) can be extended without modification
- ✅ **Liskov Substitution**: Component follows existing component interface patterns (props, emits)
- ✅ **Interface Segregation**: Dedicated composables for specific concerns (fetching vs. status management)
- ✅ **Dependency Inversion**: Component depends on composable abstractions, not direct API calls
- ✅ **Composition API**: Using <script setup> with consistent structure
- ✅ **TypeScript**: Full type safety with Book interface from existing types
- ✅ **Error Handling**: Will use existing useErrorHandler composable

### II. Testing Standards (NON-NEGOTIABLE)

- ✅ **Unit Tests**: Component and composables will have 80%+ coverage
- ✅ **E2E Tests**: Critical flow (list → detail → back) will have Playwright tests
- ✅ **AAA Pattern**: All tests follow Arrange-Act-Assert structure
- ✅ **Test Independence**: Tests will not share state
- ✅ **Selector Strategy**: E2E tests use role-based selectors, then test IDs
- ✅ **Web-First Assertions**: Use Playwright's auto-waiting assertions

### III. User Experience Consistency

- ✅ **Accessibility**: WCAG 2.1 AA compliance with semantic HTML and ARIA
- ✅ **Semantic HTML**: Use <main>, <article>, <h1>, etc.
- ✅ **Keyboard Navigation**: Back button and status selector keyboard accessible
- ✅ **Feedback**: Loading states, error messages following existing patterns
- ✅ **Responsive**: Mobile-first design with Tailwind breakpoints
- ✅ **Consistent Patterns**: Reuse existing component patterns (BookCard, error handling)

### IV. Performance Requirements

- ✅ **Initial Load**: View renders within 1 second (spec requirement)
- ✅ **Bundle Size**: Minimal addition (~10-15KB for route + component)
- ✅ **Optimization**: Computed properties for derived data, v-memo if needed
- ✅ **Monitoring**: Can be measured with Lighthouse

**Gate Status**: ✅ PASSED - No violations, all principles satisfied

## Project Structure

### Documentation (this feature)

```
specs/001-show-details-of/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-endpoints.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── views/
│   ├── BooksView.vue       # Existing - list view
│   ├── KanbanView.vue      # Existing - kanban board
│   └── BookDetailView.vue  # NEW - detail view component
├── components/
│   ├── BookCard.vue        # Existing - reusable patterns
│   ├── BookList.vue        # Existing
│   └── BookKanban.vue      # Existing
├── composables/
│   ├── useBookData.ts      # Existing - may need single book fetch
│   ├── useReadingState.ts  # Existing - status management
│   └── useErrorHandler.ts  # Existing - error handling
├── router/
│   └── index.ts            # Update - add detail route
├── types/
│   └── index.ts            # Existing - Book interface
├── data/
│   └── books.ts            # Update - add getBookById if needed
└── utils/
    └── localStorage.ts     # Existing

e2e/
├── vue.spec.ts             # Existing tests
├── book-details.spec.ts    # NEW - detail view tests
└── pages/
    └── BookDetailPage.ts   # NEW - POM for detail view

src/__tests__/
├── App.spec.ts             # Existing
└── views/
    └── BookDetailView.spec.ts  # NEW - unit tests
```

**Structure Decision**: Single web application with view-based organization. New BookDetailView.vue will be added to src/views/ following existing patterns. Route configuration in router/index.ts will be extended. Existing composables may be enhanced to support single book fetching. Test structure follows existing patterns with unit tests co-located and e2e tests in dedicated directory.

## Complexity Tracking

_No violations - Constitution Check passed without requiring justifications_

---

# Phase 0: Research & Technical Decisions

## Research Tasks Completed

### 1. Vue Router Dynamic Routes

**Decision**: Use `/books/:id` route pattern with `useRoute()` composable
**Rationale**:

- Standard Vue Router pattern for resource detail pages
- Reactive `route.params.id` provides book ID to component
- Supports deep linking and browser navigation automatically
- Existing router setup in `src/router/index.ts` uses this pattern

**Alternatives Considered**:

- Query parameters (`/books?id=123`): Less clean URLs, harder to share
- Hash-based routing: Not needed for SPA, worse for SEO

**Implementation**:

```typescript
// router/index.ts
{
  path: '/books/:id',
  name: 'book-detail',
  component: () => import('../views/BookDetailView.vue')
}
```

### 2. Data Fetching Strategy

**Decision**: Extend existing `useBookData` composable or create `useBookDetail` composable
**Rationale**:

- Maintains consistency with existing data fetching patterns
- Reuses error handling and loading state logic
- Single Responsibility: detail-specific logic in dedicated composable if needed
- Can leverage existing `getBookById` function in `books.ts`

**Alternatives Considered**:

- Direct fetch in component: Violates SOLID principles
- Global state management (Pinia): Overkill for simple detail view

**API Endpoint**: `GET http://localhost:4730/books/:id`

### 3. Reading Status Management

**Decision**: Reuse existing `useReadingState` composable
**Rationale**:

- Already implements localStorage persistence
- Provides `setBookStatus` and `getBookStatus` methods
- Maintains consistency across list, kanban, and detail views
- No duplication of state management logic

**Integration**:

- Call `getBookStatus(bookId)` on component mount
- Display current status in dropdown/button group
- Call `setBookStatus(bookId, newStatus)` on user selection

### 4. Error Handling Patterns

**Decision**: Use existing `useErrorHandler` composable with `onErrorCaptured`
**Rationale**:

- Consistent error display across application
- Centralized error logging and management
- Already implements user-friendly error messages
- Supports graceful degradation

**Error Scenarios**:

- Book not found (404): Display "Book not found" with link to list
- API unavailable: Display error banner with retry option
- Invalid book ID: Redirect to list or show error message

### 5. Responsive Layout Design

**Decision**: Mobile-first Tailwind CSS with flexbox/grid layout
**Rationale**:

- Matches existing component styling patterns
- Tailwind utility classes enable rapid development
- Responsive breakpoints (sm: 640px, md: 768px, lg: 1024px)
- Existing components demonstrate mobile-first approach

**Layout Structure**:

- Mobile: Single column, cover above content
- Tablet: Single column with larger spacing
- Desktop: Two-column layout (cover left, details right)

### 6. Accessibility Implementation

**Decision**: Semantic HTML with ARIA attributes following WCAG 2.1 AA
**Rationale**:

- Required by constitution and spec (FR-020)
- Use `<article>`, `<h1>`, semantic structure
- Back button with accessible label
- Status selector with proper ARIA roles
- Skip links for keyboard navigation

**Validation**: Can test with axe DevTools and Lighthouse audits

### 7. Testing Strategy

**Decision**: Unit tests for component logic, E2E tests for user flows
**Rationale**:

- Unit tests: Component mounting, status changes, error states
- E2E tests: Navigation flow, status persistence, error handling
- Follows existing testing patterns (Vitest + Playwright)

**Key Test Cases**:

- Navigate from list to detail
- Display all book information
- Change reading status
- Handle missing data gracefully
- Error state for invalid book ID

### 8. Performance Optimization

**Decision**: Lazy route loading, computed properties, minimal bundle impact
**Rationale**:

- Route-level code splitting with dynamic import
- Computed properties for derived data (status display text)
- No additional heavy dependencies needed
- Estimated bundle addition: 10-15KB

**Monitoring**: Lighthouse performance score must stay >90

---

# Phase 1: Design & Contracts

## Data Model

See [data-model.md](./data-model.md) for complete data structures.

**Key Entities**:

- **Book**: Existing interface (id, title, author, cover, description, year)
- **ReadingStatus**: Existing type ('to-read' | 'currently-reading' | 'read')
- **RouteParams**: `{ id: string }` - extracted from URL

## API Contracts

See [contracts/api-endpoints.md](./contracts/api-endpoints.md) for complete API documentation.

**Endpoints Used**:

- `GET /books/:id` - Fetch single book details

## Component Design

**BookDetailView.vue Structure**:

```
<script setup>
  // 1. Imports
  // 2. Route params
  // 3. Composables (useBookDetail, useReadingState, useErrorHandler)
  // 4. Reactive state
  // 5. Computed properties
  // 6. Methods (handleStatusChange, handleBack)
  // 7. Lifecycle (onMounted for data fetch)
</script>

<template>
  <!-- Loading state -->
  <!-- Error state -->
  <!-- Book details (cover, title, author, year, description, status) -->
  <!-- Back button -->
</template>
```

## Quick Start Guide

See [quickstart.md](./quickstart.md) for development setup and testing instructions.

---

## Next Steps

1. ✅ Phase 0: Research completed - All technical decisions documented
2. ✅ Phase 1: Design completed - Data model and contracts defined
3. ⏳ Phase 2: Execute `/speckit.tasks` to generate implementation task breakdown
4. ⏳ Implementation: Follow task list to build feature
5. ⏳ Testing: Achieve 80%+ coverage with unit and e2e tests
6. ⏳ Review: Verify constitution compliance during code review

## Constitution Check (Post-Design)

✅ **Re-validated**: All principles still satisfied after design phase

- Code structure follows SOLID principles
- Testing strategy comprehensive
- Accessibility requirements addressed
- Performance targets achievable

**Status**: Ready for task breakdown and implementation
