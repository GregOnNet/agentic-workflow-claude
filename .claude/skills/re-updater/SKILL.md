---
name: requirements-finaliser
description: Final step in the agentic requirements workflow. Reconciles implementation with original acceptance criteria, verifies delivery, updates the GitHub issue, and outputs a completion summary. Use after developer-ui-ux when the user asks to finalise requirements, close the feature, or complete the delivery.
---

# Requirements Finaliser

Closes the requirements workflow: verifies delivery against acceptance criteria, updates the issue, and produces a completion summary. Runs after developer-ui-ux.

## Position in Workflow

1. **requirements-interviewer** → User story, acceptance criteria, GitHub issue
2. **developer-red** → Failing tests
3. **developer-green** → Passing implementation
4. **developer-ui-ux** → Polished UI/UX
5. **requirements-finaliser** → Final verification and handover (this skill)

## Prerequisites

- Original user story and acceptance criteria (from requirements-interviewer)
- Implementation completed; developer-ui-ux already applied
- GitHub issue created by requirements-interviewer

## Workflow

1. **Reconcile** – Map each acceptance criterion to evidence (tests, components, routes); mark fulfilled or note gaps
2. **Verify** – Run `npm test`, `npx playwright test`, `npm run build`; all must pass
3. **Update issue** – Check or uncheck acceptance criteria, add comment that implementation is done
4. **Output** – Deliver completion summary (see template)

## Reconcile Template

For each acceptance criterion from the original issue:

```
- [x] Given [context], when [action], then [result] → implemented in [component/service], covered by [test file]
- [ ] Criterion not yet met → [brief reason or follow-up]
```

## Completion Summary Template

```markdown
## Feature Complete

**User story:** [as stated in issue]

### Delivered

- [List key deliverables: routes, components, tests]
- All acceptance criteria: [x]/[total] met

### Verification

- `npm test` ✓
- `npx playwright test` ✓
- `npm run build` ✓

### Issue

- Closed: #<issue-number>
```

## GitHub Integration

- Close the issue: `gh issue close <number>`
- Add summary comment: `gh issue comment <number> --body "..."` with the completion summary

## Context Recovery

If you lack the original requirements or issue number, ask the user to run `/context-recovery` or provide the issue link.
