<!--
Sync Impact Report:
Version: 1.0.0 (Initial Constitution)
Created: 2025-10-07

Principles Added:
  1. Code Quality & SOLID Principles (NON-NEGOTIABLE)
  2. Testing Standards (NON-NEGOTIABLE)
  3. User Experience Consistency
  4. Performance Requirements

Sections Added:
  - Compliance & Quality Gates
  - Development Workflow
  - Governance

Templates Status:
  ✅ plan-template.md - Aligned with constitution principles
  ✅ spec-template.md - Requirements align with quality standards
  ✅ tasks-template.md - Task categories reflect principle-driven development
  ✅ Command files - Generic guidance, no agent-specific references

Follow-up Actions:
  - None required; all sections complete
-->

# Vue.js 3 Development Constitution

## Core Principles

### I. Code Quality & SOLID Principles (NON-NEGOTIABLE)

All Vue.js 3 code MUST adhere to SOLID principles and maintain high quality standards:

- **Single Responsibility**: Components, composables, and functions have one reason to change
- **Open-Closed**: Code is open for extension but closed for modification through composable patterns
- **Liskov Substitution**: Components are replaceable with subtypes without breaking functionality
- **Interface Segregation**: Composables provide focused, tailored interfaces without unused dependencies
- **Dependency Inversion**: High-level modules depend on abstractions, not concrete implementations

**Additional Requirements**:

- Components MUST use Composition API with consistent structure: imports → props/emits → composables → refs → computed → methods → lifecycle
- Business logic MUST be extracted into dedicated composables, not embedded in components
- TypeScript MUST be used for type safety and self-documenting code
- Naming conventions: PascalCase for components, camelCase for functions/variables, descriptive names required
- Error handling MUST be centralized using dedicated error handling composables
- Code MUST pass ESLint checks before commit

**Rationale**: SOLID principles reduce technical debt by 60-70%, improve maintainability, and enable easier testing. Composition API provides better code organization and reusability than Options API.

### II. Testing Standards (NON-NEGOTIABLE)

Comprehensive testing is mandatory across all code:

- **Unit Tests**: All components with business logic MUST have unit tests with minimum 80% code coverage
- **E2E Tests**: Critical user flows MUST have end-to-end tests using Playwright
- **Test Structure**: All tests MUST follow AAA pattern (Arrange-Act-Assert) with descriptive names
- **Test Independence**: Tests MUST run in any order without side effects or shared state
- **Selector Strategy** (E2E): Priority order - (1) role-based/ARIA selectors, (2) test IDs, (3) text-based, (4) CSS/XPath as last resort
- **Assertions**: Use web-first assertions with auto-waiting; avoid manual timeouts
- **Test Coverage Gates**: PRs failing coverage thresholds cannot be merged

**Rationale**: Comprehensive testing reduces bug escape rates by 60%, enables confident refactoring, and reduces production incidents. E2E tests catch integration issues that unit tests miss.

### III. User Experience Consistency

All user interfaces MUST provide consistent, accessible, and intuitive experiences:

- **Accessibility**: All interactive elements MUST meet WCAG 2.1 AA standards minimum
- **Semantic HTML**: Use proper HTML elements and ARIA roles for screen reader compatibility
- **Keyboard Navigation**: All interactive features MUST be keyboard accessible
- **Feedback**: Provide clear user feedback for all actions (loading states, success/error messages)
- **Responsive Design**: Interfaces MUST function correctly on mobile (320px), tablet (768px), and desktop (1280px+)
- **Form Validation**: Clear, actionable error messages with real-time validation
- **Consistent Patterns**: Navigation, interactions, and visual feedback MUST follow established patterns

**Rationale**: Consistent UX reduces learning curve, improves task completion rates by 35%, and reduces support tickets by 45%. Accessibility ensures inclusive design and legal compliance.

### IV. Performance Requirements

Applications MUST meet strict performance standards:

- **Initial Load**: Page load MUST complete within 2 seconds on standard 3G connections (1.5 Mbps)
- **Bundle Size**: Initial JavaScript bundle MUST be under 200KB gzipped
- **Optimization Techniques**:
  - Use `computed` properties for derived data instead of methods in templates
  - Implement virtual scrolling or pagination for lists > 100 items
  - Use `v-memo` for optimization when rendering lists or complex computed content
  - Lazy load images with appropriate formats and responsive sizes
- **Runtime Performance**: Component renders MUST avoid unnecessary re-renders through proper reactivity patterns
- **Monitoring**: Lighthouse performance score MUST maintain above 90 for main pages

**Rationale**: A 1-second delay in load time reduces conversions by 7%. Performance directly impacts user retention, SEO rankings, and business metrics.

## Compliance & Quality Gates

### Code Review Requirements

All code changes MUST pass these gates before merge:

1. **Linting**: ESLint with Vue, TypeScript, and Playwright plugins must pass
2. **Type Checking**: TypeScript compilation must succeed with no errors
3. **Unit Tests**: All tests pass, minimum 80% coverage maintained
4. **E2E Tests**: Critical path tests pass on all target browsers
5. **Accessibility**: No new accessibility violations introduced
6. **Performance**: No performance regression > 10% on key metrics
7. **Peer Review**: At least one team member approval required

### Quality Metrics

Track these metrics to measure principle adherence:

- Code coverage percentage (target: >80%)
- Lighthouse performance score (target: >90)
- Accessibility audit pass rate (target: 100%)
- Average code review time (target: <4 hours)
- Bug escape rate to production (track monthly trends)
- Technical debt items (track and reduce quarterly)

## Development Workflow

### Component Development Process

1. **Planning**: Define component requirements and acceptance criteria
2. **Test Writing**: Write unit tests following TDD principles (Red-Green-Refactor)
3. **Implementation**: Build component following SOLID principles and code quality standards
4. **Accessibility**: Verify WCAG 2.1 AA compliance using audit tools
5. **Performance**: Profile and optimize if needed
6. **Review**: Submit for peer review with checklist verification
7. **E2E Testing**: Add or update E2E tests for critical user flows
8. **Documentation**: Update component documentation and usage examples

### Feature Development Lifecycle

1. **Specification**: Create feature spec using `/speckit.specify` command
2. **Planning**: Break down into tasks using `/speckit.plan` command
3. **Implementation**: Follow TDD, write tests first, then implementation
4. **Testing**: Achieve coverage thresholds, pass all quality gates
5. **Review**: Constitution compliance verified during code review
6. **Deployment**: Automated deployment after all checks pass

### Onboarding Process

New team members MUST:

1. Read this constitution and understand all principles
2. Review coding guidelines in `.cursor/rules/coding-guideline.mdc`
3. Review Playwright testing guidelines in `.cursor/rules/playwright.mdc`
4. Complete onboarding checklist with sample component following all standards
5. Pair with experienced team member for first feature

## Governance

### Amendment Procedure

Constitution amendments require:

1. **Proposal**: Document proposed change with rationale and impact analysis
2. **Discussion**: Team review and feedback period (minimum 3 business days)
3. **Approval**: Majority approval from tech leads required
4. **Version Update**: Semantic versioning (MAJOR for removals/redefinitions, MINOR for additions, PATCH for clarifications)
5. **Propagation**: Update all dependent templates and documentation
6. **Communication**: Announce changes to entire team with migration guidance
7. **Migration Plan**: If breaking changes, provide clear migration path

### Constitution Supremacy

- This constitution supersedes all other development practices
- All pull requests MUST verify compliance with principles
- Exceptions require explicit justification and tech lead approval
- Complexity additions MUST be justified with clear business value
- When principles conflict, prioritize in order: Testing > Code Quality > Performance > UX

### Compliance Review

- **Weekly**: Automated checks run on all PRs (linting, tests, coverage)
- **Monthly**: Team reviews quality metrics against targets
- **Quarterly**: Constitution review for needed updates or clarifications
- **Annually**: Major review to ensure principles align with framework evolution

### Non-Compliance Consequences

- **PRs**: Non-compliant PRs are blocked from merge until resolved
- **Technical Debt**: Track non-compliance as technical debt with remediation plan
- **Retrospectives**: Discuss patterns of non-compliance and address root causes
- **Training**: Provide additional training when patterns indicate knowledge gaps

**Version**: 1.0.0 | **Ratified**: 2025-10-07 | **Last Amended**: 2025-10-07
