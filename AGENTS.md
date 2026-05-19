# ai-web-development — Agent Instructions

Persistent context for coding agents (Cursor, Codex, Copilot, and others). Keep this file **short and project-specific** — point to examples and linters instead of copying full style guides.

**Last updated:** 2026-05-19

## Active Technologies

- TypeScript 5.9 + Vue 3.5 (Composition API, `<script setup>`)
- Vue Router 4.5, Vite 7, Tailwind CSS 4
- Vitest (unit), Playwright (e2e)
- Local book API at `http://localhost:4730` (see `src/composables/useBookDetail.ts`)

## Project Structure

```
src/
  components/     # Presentational UI (BookCard, BookList, …)
  composables/    # Reusable logic (useBookDetail, useReadingState, …)
  views/          # Route-level pages (BooksView, BookDetailView, …)
  router/         # Vue Router config
  types/          # Shared TypeScript types
e2e/              # Playwright specs (not tests/)
specs/            # Feature specs and plans (Specify workflow)
.claude/skills/   # Agent skills for requirements & TDD workflow
```

## Commands

Run from the repo root (Node `^20.19.0 || >=22.12.0`):

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Unit tests | `npm run test:unit` |
| E2E tests | `npm run test:e2e` (starts dev/preview server via Playwright) |
| Lint | `npm run lint` |
| Format | `npm run format` |

**Before finishing a change:** `npm run lint && npm run test:unit && npm run build`. For UI work, also run `npm run test:e2e`.

## Code Style

Vue 3 conventions used in this repo (see `src/views/BookDetailView.vue` as a canonical view):

- **Composition API** — `<script setup lang="ts">`; extract logic into `composables/`
- **Types** — import from `@/types`; avoid `any`
- **Styling** — Tailwind utility classes; mobile-first responsive layout
- **Errors** — use `useErrorHandler`; surface user-visible messages in templates
- **One concern per module** — match file name to primary export (`useBookDetail.ts` → `useBookDetail`)

Unit tests live next to source: `src/**/__tests__/*.spec.ts`. Follow Vitest + `@vue/test-utils` patterns in existing specs.

### E2E (Playwright)

- Specs in `e2e/**/*.spec.ts` (base URL from `playwright.config.ts`: `5173` local, `4173` CI)
- Prefer `getByRole`, then `getByTestId`; add `data-testid` to templates when missing
- Use Gherkin-style test titles when adding new flows (see `e2e/book-details.spec.ts`)
- Test user-visible behavior, not implementation details (URLs/params alone are weak tests)

## Agentic Workflow

Skills under `.claude/skills/` drive the requirements and Red–Green–Refactor loop. **Read the relevant `SKILL.md` before acting** — do not improvise the workflow.

| Skill | When to use |
|-------|-------------|
| `re-reporter` | User asks for requirements gathering / interview |
| `re-context-recovery` | Missing requirement context — load `requirements/<n>.md` |
| `se-red` | Scaffold failing Playwright tests from acceptance criteria |
| `se-green` | Minimal implementation to make tests pass |
| `se-blue` | Refactor after green (SOLID, structure) |
| `re-updater` | Finalise delivery against acceptance criteria |

Requirements files: `requirements/<number>.md`. Feature design docs: `specs/<feature>/`.

Specify can refresh technology sections here:

```bash
.specify/scripts/bash/update-agent-context.sh
```

Preserve content between `<!-- MANUAL ADDITIONS START -->` and `<!-- MANUAL ADDITIONS END -->`.

## Boundaries

- **Do not** commit unless the user explicitly asks
- **Do not** modify `node_modules/`, `dist/`, or generated lockfile churn without reason
- **Do not** remove existing `*.spec.ts` files when adding tests
- **Do not** change test expectations to make implementation pass — fix code (unless the test is wrong)
- **Minimize scope** — only change files required for the task; match existing naming and patterns
- Book data comes from the local API (`localhost:4730`); reading status uses `localStorage` via `useReadingState`

## Verification Checklist

When implementing a feature:

1. Re-read acceptance criteria in `requirements/` or `specs/`
2. Implement minimally (Green) or refactor (Blue) per the active skill
3. `npm run lint && npm run test:unit && npm run build`
4. For UI changes: `npm run test:e2e`
5. Summarise what changed and which criteria are satisfied

