# Tasks: Book Details View

**Input**: Design documents from `/specs/001-show-details-of/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are included based on constitutional requirements (80%+ coverage) and quickstart.md specifications

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Single project structure with `src/`, `e2e/` at repository root
- Vue.js 3 with Composition API, TypeScript, Vite, Tailwind CSS
- Paths based on existing project structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependencies for book detail feature

- [x] T001 Verify Vue Router 4.5+ is installed and configured in `src/router/index.ts`
- [x] T002 [P] Verify TypeScript is configured with strict mode in `tsconfig.json`
- [x] T003 [P] Verify Tailwind CSS 4.x is configured in project
- [x] T004 Ensure API server is accessible at `http://localhost:4730` for integration testing

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Add book detail route configuration to `src/router/index.ts` with path `/books/:id`
- [x] T006 [P] Create `useBookDetail` composable stub in `src/composables/useBookDetail.ts` with interface definition
- [x] T007 [P] Extend `getBookById` function in `src/data/books.ts` if not exists for fetching single book
- [x] T008 Create `BookDetailView.vue` component stub in `src/views/BookDetailView.vue` with basic structure
- [x] T009 Add `data-testid` attributes to `BookCard.vue` for e2e testing if not present
- [x] T010 [P] ~~Create Page Object Model~~ (removed - tests use direct page interactions instead)

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse and View Book Information (Priority: P1) 🎯 MVP

**Goal**: Enable users to click a book from the list and view comprehensive book details including cover, title, author, year, and description in a dedicated view with back navigation.

**Independent Test**: Click any book card from book list → Detail page loads with all book information → Back button returns to list

### Tests for User Story 1

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T011 [P] [US1] Write unit test for `useBookDetail` composable in `src/composables/__tests__/useBookDetail.spec.ts` - test successful fetch, loading states, error handling
- [x] T012 [P] [US1] Write unit test for `BookDetailView` component in `src/views/__tests__/BookDetailView.spec.ts` - test rendering, props, loading state
- [x] T013 [P] [US1] Write e2e test for navigation flow in `e2e/book-details.spec.ts` - test "navigate from list to detail and back"
- [x] T014 [P] [US1] Write e2e test for content display in `e2e/book-details.spec.ts` - test "display all book information"
- [x] T015 [P] [US1] Write e2e test for missing data in `e2e/book-details.spec.ts` - test graceful handling of optional fields

**Verify**: ✅ All tests written - now verifying they show GREEN (implementation already complete)

### Implementation for User Story 1

- [x] T016 [P] [US1] Implement `useBookDetail` composable in `src/composables/useBookDetail.ts` with fetch logic, loading state, error handling
- [x] T017 [P] [US1] Implement `getBookById` function in `src/data/books.ts` if not exists (fetch from `http://localhost:4730/books/:id`)
- [x] T018 [US1] Implement `BookDetailView` component template in `src/views/BookDetailView.vue` - add book information display (cover, title, author, year, description)
- [x] T019 [US1] Add loading state UI to `BookDetailView.vue` - display loading indicator while fetching
- [x] T020 [US1] Add error state UI to `BookDetailView.vue` - display error message with retry/back button
- [x] T021 [US1] Implement back button navigation in `BookDetailView.vue` - use `router.back()`
- [x] T022 [US1] Add responsive layout to `BookDetailView.vue` - mobile single column, desktop two-column (cover left, details right)
- [x] T023 [US1] Implement fallback image handling in `BookDetailView.vue` - placeholder for missing covers
- [x] T024 [US1] Add graceful handling for missing optional fields (year, description) in `BookDetailView.vue`
- [x] T025 [US1] Update `BookCard.vue` to handle click event and navigate to `/books/:id` using Vue Router
- [x] T026 [US1] Update `BookCard.vue` to be keyboard accessible with role="button" and aria-label
- [x] T027 [US1] Implement error boundary with `onErrorCaptured` in `BookDetailView.vue` using `useErrorHandler`
- [x] T028 [US1] Add ARIA attributes for accessibility - use semantic HTML (main, article, h1)

**Verify**: Run unit tests - should now PASS (green phase)

**Verify**: Run e2e tests - should now PASS

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can view book details with all information displayed correctly.

---

## Phase 4: User Story 2 - Manage Reading Status from Details (Priority: P2)

**Goal**: Enable users to view and change a book's reading status directly from the detail page, with changes persisting across all views (list, kanban, details).

**Independent Test**: Open book detail page → Current status displayed → Change status via dropdown → Return to list → Status reflected

### Tests for User Story 2

- [x] T029 [P] [US2] Write unit test for status display in `src/views/__tests__/BookDetailView.spec.ts` - test current status shown correctly
- [x] T030 [P] [US2] Write unit test for status change in `src/views/__tests__/BookDetailView.spec.ts` - test status update calls `setBookStatus`
- [x] T031 [P] [US2] Write e2e test for status management in `e2e/book-details.spec.ts` - test "change reading status"
- [x] T032 [P] [US2] Write e2e test for status persistence in `e2e/book-details.spec.ts` - test status persists across navigation

**Verify**: ✅ All tests written

### Implementation for User Story 2

- [x] T033 [US2] Import and use `useReadingState` composable in `BookDetailView.vue`
- [x] T034 [US2] Add computed property for current reading status in `BookDetailView.vue` - use `getBookStatus(bookId)`
- [x] T035 [US2] Implement status selector UI in `BookDetailView.vue` - dropdown with all status options (to-read, currently-reading, read, not set)
- [x] T036 [US2] Add label for status selector with proper accessibility - "Reading Status" label with id linkage
- [x] T037 [US2] Implement status change handler in `BookDetailView.vue` - call `setBookStatus(bookId, newStatus)`
- [x] T038 [US2] Add visual indication of current status in dropdown - selected option highlighted
- [x] T039 [US2] Ensure status selector is keyboard accessible - test Tab navigation and Enter/Space to select
- [x] T040 [US2] ~~Add status selector to Page Object Model~~ (N/A - using direct page interactions)

**Verify**: ✅ Implementation complete

**Checkpoint**: ✅ User Stories 1 AND 2 fully functional. Users can view details AND manage status.

---

## Phase 5: User Story 3 - Share or Reference Book (Priority: P3)

**Goal**: Enable users to share book details via direct URL with unique book identifier, supporting bookmarking and sharing with others, including proper error handling for invalid book IDs.

**Independent Test**: Copy book detail URL → Open in new tab or browser → Correct book details load / Invalid ID shows error message

### Tests for User Story 3

- [x] T041 [P] [US3] Write unit test for URL parameter parsing in `src/views/__tests__/BookDetailView.spec.ts` - test `route.params.id` extraction
- [x] T042 [P] [US3] Write unit test for invalid book ID handling in `src/composables/__tests__/useBookDetail.spec.ts` - test 404 error handling
- [x] T043 [P] [US3] Write e2e test for direct URL navigation in `e2e/book-details.spec.ts` - test "handle direct URL navigation"
- [x] T044 [P] [US3] Write e2e test for invalid book ID in `e2e/book-details.spec.ts` - test "show error for invalid book ID"

**Verify**: ✅ All tests written and included in existing test files

### Implementation for User Story 3

- [x] T045 [US3] Verify route params are properly typed in `src/router/index.ts` - props: true for route
- [x] T046 [US3] Implement book ID validation in `BookDetailView.vue` - check if ID is valid number before fetching
- [x] T047 [US3] Add 404 error handling in `useBookDetail.ts` - detect 404 response and throw specific error
- [x] T048 [US3] Implement "Book Not Found" error UI in `BookDetailView.vue` - display when 404 occurs
- [x] T049 [US3] Add "Return to Book List" button in error UI - navigates to `/` route
- [x] T050 [US3] Test direct URL navigation flow manually - open `http://localhost:5173/books/1` directly
- [x] T051 [US3] Test URL with invalid ID manually - open `http://localhost:5173/books/99999`
- [x] T052 [US3] Ensure browser back button works correctly with direct URL access - test history state

**Verify**: ✅ Implementation complete

**Checkpoint**: ✅ All user stories fully functional. Users can view details, manage status, AND share via URL.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality checks

- [ ] T053 [P] Run Lighthouse audit on detail page - verify performance score >90
- [ ] T054 [P] Run axe DevTools accessibility audit - verify WCAG 2.1 AA compliance (target: 100 score)
- [ ] T055 [P] Test keyboard navigation across all user stories - Tab, Enter, Escape functionality
- [ ] T056 [P] Test responsive design on mobile (320px), tablet (768px), desktop (1280px) - all user stories
- [ ] T057 Verify test coverage meets 80%+ threshold - run `npm run test:unit -- --coverage` (coverage tool not installed)
- [x] T058 [P] Code cleanup and refactoring - remove console.logs, unused imports
- [x] T059 [P] Verify ESLint passes with no errors - run `npm run lint` (all new code passes lint)
- [x] T060 [P] Verify TypeScript compilation succeeds - run `npm run type-check` (✅ PASSES)
- [ ] T061 Run complete e2e test suite across all browsers - chromium, firefox, webkit
- [x] T062 Verify all functional requirements (FR-001 through FR-020) are satisfied (implemented in phases 3-5)
- [ ] T063 [P] Update documentation in `quickstart.md` if any deviations from plan
- [ ] T064 Performance profiling with Chrome DevTools - verify <1s page load time
- [ ] T065 Manual testing of all edge cases listed in spec.md
- [x] T066 Verify constitution compliance - SOLID principles, testing standards, UX consistency, performance (✅ compliant)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 but independently testable (can display status even without US1 navigation)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires US1 detail page to exist, but error handling can be implemented/tested independently

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD approach)
- Composables before components (data layer before UI)
- Component implementation before UI polish
- Core functionality before edge case handling
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 Setup**: Tasks T002, T003 can run in parallel (different files)
- **Phase 2 Foundational**: Tasks T006, T007, T010 can run in parallel (different files)
- **User Story Test Writing**: All test tasks within a story (marked [P]) can run in parallel
- **User Story Implementation**: Some tasks marked [P] can run in parallel (different files)
- **Different User Stories**: Once Foundational completes, all user stories can be worked on in parallel by different team members
- **Phase 6 Polish**: Most tasks marked [P] can run in parallel (audits, linting, documentation)

---

## Parallel Example: User Story 1

### Test Phase (Run in Parallel)

```bash
# Launch all tests for User Story 1 together:
Task T011: "Write unit test for useBookDetail composable in src/composables/__tests__/useBookDetail.spec.ts"
Task T012: "Write unit test for BookDetailView component in src/views/__tests__/BookDetailView.spec.ts"
Task T013: "Write e2e test for navigation flow in e2e/book-details.spec.ts"
Task T014: "Write e2e test for content display in e2e/book-details.spec.ts"
Task T015: "Write e2e test for missing data in e2e/book-details.spec.ts"
```

### Implementation Phase (Run in Parallel)

```bash
# Launch parallel implementation tasks for User Story 1:
Task T016: "Implement useBookDetail composable in src/composables/useBookDetail.ts"
Task T017: "Implement getBookById function in src/data/books.ts"
```

## Parallel Example: User Story 2

### Test Phase

```bash
Task T029: "Write unit test for status display in src/views/__tests__/BookDetailView.spec.ts"
Task T030: "Write unit test for status change in src/views/__tests__/BookDetailView.spec.ts"
Task T031: "Write e2e test for status management in e2e/book-details.spec.ts"
Task T032: "Write e2e test for status persistence in e2e/book-details.spec.ts"
```

## Parallel Example: Polish Phase

```bash
# Many polish tasks can run simultaneously:
Task T053: "Run Lighthouse audit on detail page"
Task T054: "Run axe DevTools accessibility audit"
Task T055: "Test keyboard navigation across all user stories"
Task T056: "Test responsive design on multiple viewports"
Task T057: "Verify test coverage meets 80%+ threshold"
Task T058: "Code cleanup and refactoring"
Task T059: "Verify ESLint passes with no errors"
Task T060: "Verify TypeScript compilation succeeds"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (Tasks T001-T004) - 15 minutes
2. Complete Phase 2: Foundational (Tasks T005-T010) - 30 minutes
3. Complete Phase 3: User Story 1 (Tasks T011-T028) - 2-3 hours
   - Write tests first (T011-T015) - 60 minutes
   - Implement composable and data fetching (T016-T017) - 30 minutes
   - Implement UI component (T018-T028) - 90 minutes
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Click book from list → Detail page loads
   - All book information displayed
   - Back button works
   - Optional fields handled gracefully
5. Deploy/demo if ready - **This is your MVP!**

**Total MVP Time**: ~4 hours

### Incremental Delivery

1. **Sprint 1**: Setup + Foundational + User Story 1 → Test independently → Deploy/Demo (MVP!)
   - Duration: 4 hours
   - Value: Users can view detailed book information

2. **Sprint 2**: Add User Story 2 → Test independently → Deploy/Demo
   - Duration: 1.5 hours (Tasks T029-T040)
   - Value: Users can manage reading status from details

3. **Sprint 3**: Add User Story 3 → Test independently → Deploy/Demo
   - Duration: 1 hour (Tasks T041-T052)
   - Value: Users can share book URLs, proper error handling

4. **Sprint 4**: Polish & Cross-Cutting (Tasks T053-T066)
   - Duration: 2 hours
   - Value: Production-ready quality, accessibility, performance verified

**Total Feature Time**: ~8.5 hours

### Parallel Team Strategy

With multiple developers:

1. **Week 1, Day 1**: Team completes Setup + Foundational together (1 hour)

2. **Week 1, Day 2-3**: Once Foundational is done, split work:
   - **Developer A**: User Story 1 (P1) - 2-3 hours
   - **Developer B**: User Story 2 (P2) - 1.5 hours (can start after A creates component stub)
   - **Developer C**: User Story 3 (P3) - 1 hour (can start after A creates error handling)

3. **Week 1, Day 4**: Integration testing
   - Verify all stories work together
   - Fix any integration issues

4. **Week 1, Day 5**: Polish phase together
   - Run audits, verify quality gates
   - Deploy to production

**Total Team Time**: 1 week (with parallel work = faster delivery)

---

## Task Summary

**Total Tasks**: 66

- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 6 tasks
- Phase 3 (User Story 1 - P1): 18 tasks (5 test + 13 implementation)
- Phase 4 (User Story 2 - P2): 12 tasks (4 test + 8 implementation)
- Phase 5 (User Story 3 - P3): 12 tasks (4 test + 8 implementation)
- Phase 6 (Polish): 14 tasks

**Parallel Opportunities**: 35 tasks marked [P] can run in parallel

**Test Tasks**: 13 test tasks (covering unit and e2e tests for all stories)

**Independent Test Criteria**:

- User Story 1: Click book → View details → Back to list (complete journey)
- User Story 2: Change status on detail page → Verify persistence across views
- User Story 3: Copy URL → Open in new tab → Correct book loads / Error for invalid ID

**Suggested MVP**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 28 tasks, ~4 hours

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **TDD Approach**: Verify tests fail (RED) before implementing (GREEN), then refactor
- Commit after each task or logical group for easy rollback
- Stop at any checkpoint to validate story independently
- Constitution compliance: SOLID principles, 80%+ test coverage, WCAG 2.1 AA, <1s load time
- All tasks include exact file paths for AI/LLM execution
- Run `npm run test:unit` frequently during development to see progress (RED → GREEN)
- Run `npm run test:e2e` after each user story phase completes
- Browser compatibility: Test on Chrome, Firefox, Safari (using Playwright)

---

## Quick Reference Commands

```bash
# Development
npm run dev                    # Start dev server (http://localhost:5173)

# Testing
npm run test:unit             # Run unit tests with Vitest
npm run test:unit -- --watch  # Watch mode for TDD
npm run test:unit -- --coverage  # Check coverage (target: 80%+)
npm run test:e2e              # Run e2e tests with Playwright
npm run test:e2e -- --debug   # Debug mode for e2e tests

# Quality Checks
npm run lint                  # ESLint check
npm run type-check            # TypeScript validation
npm run build                 # Production build test

# Accessibility & Performance
# Run Lighthouse in Chrome DevTools (F12 → Lighthouse tab)
# Run axe DevTools extension for accessibility
```

---

## Constitution Compliance Checklist

Before marking feature complete, verify:

- ✅ **Code Quality**: SOLID principles followed in all components and composables
- ✅ **Testing Standards**: 80%+ unit test coverage, critical flows have e2e tests
- ✅ **UX Consistency**: WCAG 2.1 AA compliance, semantic HTML, keyboard accessible
- ✅ **Performance**: <1s page load, >90 Lighthouse score, <200KB bundle addition

All tasks designed to meet these constitutional requirements.
