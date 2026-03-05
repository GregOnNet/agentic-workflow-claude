---
name: developer-red
description: Takes existing requirements and scaffolds unit tests (Jasmine) and UI tests (Playwright) following Red-Green-Refactor and Gherkin-style descriptions. Use only when the user explicitly asks to scaffold tests, generate tests from requirements, or apply developer-red.
---

# Context Recovery

- If you lack context about what to do or to test, ask the user to run `/context-recovery` to load the requirement.

# Developer Red

Scaffolds tests from requirements. Outputs failing tests first (Red), then the developer implements to pass (Green), then refactors (Refactor).

## Prerequisites

- Requirements as user story with acceptance criteria in Given/When/Then format
- Target component, service, or feature area

## Workflow

1. **Ask for number of UI Tests** - We are in a workshop. Ask the attendee how many tests at max should be generated. Recommend to start with one test.
1. **Create Feature Branch** - Derive branch name from issue-title prefix it with `feature/`, `git switch` to that branch
1. **Parse requirements** – Extract acceptance criteria from user story; treat each Given/When/Then as a test case
1. **Scaffold unit tests** – Create or extend `*.spec.ts` next to the component/service in `src/`
1. **Scaffold UI tests** – Create or extend `spec.ts` in `tests/` for Playwright
1. **Output** – Tests must initially fail (Red phase); use minimal failing assertions; avoid `it.todo()` unless the spec is deferred

## UI Tests (Playwright)

- Location: `tests/**/*.spec.ts`
- Framework: `@playwright/test` (`test`, `expect`)
- Base URL: `http://localhost:4200` (via webServer in playwright.config)
- Run: `npx playwright test`

### Naming (Gherkin-style)

```ts
test('given [context] when [action] then [expected result]', async ({ page }) => { ... });
```

### UI Element identification

- Prefer a11y selectors like `getByRole`
- Introduce `data-testid` in the template if needed
- Do not use CSS-Selectors (e.g. attribute or class selectors) that can break

### Template

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Feature: [name]', () => {
  test('given [context] when [action] then [expected]', async ({ page }) => {
    // Given - setup / preconditions
    // When - user action
    await page.getByRole('button', { name: 'Submit' }).click();
    // Then - assertion
    await expect(page.getByRole('heading', { name: 'Success' })).toBeVisible();
  });
});
```

## Mapping Requirements to Tests

| Acceptance Criterion          | Unit Test                        | UI Test                        |
| ----------------------------- | -------------------------------- | ------------------------------ |
| Given X when Y then Z (logic) | Yes – component/service behavior | Optional – if observable in UI |
| Given X when Y then Z (UI)    | Optional – template bindings     | Yes – user flow                |
| Edge cases, validation        | Yes – isolated                   | Yes – E2E validation           |

## Red-Green-Refactor

1. **Red** – Write tests that fail. Use concrete expectations; avoid `it.todo()` except for future specs

## Output Checklist

- [ ] Playwright `spec.ts` created/updated in `tests/`
- [ ] Test names use Gherkin-style (given/when/then or should/when)
- [ ] Tests are runnable (`npx playwright test`)
