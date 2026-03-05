---
name: angular-refactoring
description: Refactors Angular components following project standards and SOLID principles—one component per file, single level of abstraction, reactive composition, and encapsulated navigation. Use when refactoring Angular code, reviewing components, or when the user asks for refactoring help.
---

# Angular Refactoring

## S.O.L.I.D

- Apply S.O.L.I.D principles
- Look at `./references/SOLID.md` for reference

## One Component per File

- Do not keep multiple components in a single file.
- Aligns with **Single Responsibility Principle** (SRP): each module does one thing and does it well.

## Single Level of Abstraction

Keep the same level of abstraction in components.

### Don't

```ts
constructor() {
  afterNextRender(() => {
    this.route.paramMap
      .pipe(
        map(paramMap => paramMap.get('id')),
        switchMap(id => {
          if (!id) {
            this.navigateToNotFound();
            return EMPTY;
          }

          this.loading.set(true);
          this.book.set(null);

          return this.api.getBook(id);
        }),
        tap({
        next: data => {
          this.book.set(data);
          this.loading.set(false);
        },
        error: err => {
          this.loading.set(false);
          if (err?.status === 404) {
            this.navigateToNotFound();
            return;
          }
          this.errorHandler.handleError(err);
        }
      })
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  });
}
```

### Do

```ts
constructor() {
  afterNextRender(() => this.loadBookDetails());
}

private loadBookDetails() {
  /* ... implementation details ... */
}
```

## Error Handling

- Errors must be handled by a global error handler (`ErrorHandler`).
- When an error occurs, display a snackbar for 5 seconds.

## Extract Inline SVGs

- Inline SVGs must live in their own components to enable lazy loading.

## Back to Start

- The link to the start/list page must live in its own reusable component.

## Constructor

- Do not subscribe in the constructor. Use the `afterNextRender` hook for subscriptions instead.

## Reactive Composition

Prefer reactive composition over manual imperative loading. Refactor to a single reactive pipeline:

```ts
this.route.paramMap
  .pipe(
    map(paramMap => paramMap.get('id')),
    switchMap(id => this.api.getBook(id))
  )
  .subscribe(/* update book, loading, error */);
```

This reduces imperative state resets (e.g. `book.set(null)`, `error.set(null)`) scattered across methods.

## Encapsulate Navigation Logic

Wrap navigation calls in private methods like `navigateToNotFound()` and `navigateToList()` to:

- Improve readability.
- Make navigation changes easier (e.g., query params, fragments) in one place.
