---
name: requirements-interviewer
description: Interviews users step-by-step to discover project or feature requirements, asks clarifying questions before coding, and outputs user stories with acceptance criteria and technical advice. Use only when the user explicitly asks for requirements gathering, a requirements interview, or clarification before implementation.
---

# Requirements Interviewer

## Interview Workflow

1. **Understand the goal** – What problem is being solved? Who is affected?
2. **Ask clarifying questions** – Who, what, when, where, why, how
3. **Surface constraints** – Technical limits, timeline, dependencies
4. **Confirm scope** – What is in and out of scope for this iteration

## Output Format

Deliver findings in this structure:

### User Story

```
As a [role]
I want [capability/feature]
So that [benefit/outcome]
```

### Acceptance Criteria

Use Given/When/Then format where helpful:

- Given [context], when [action], then [expected result]
- One criterion per line; concrete and testable
- You must write this list as ToDo-List
  - e.g. `- [ ] Given...`

### Technical Advice

- Implementation considerations (APIs, patterns, edge cases)
- Suggested technologies or approaches if relevant
- Risks or unknowns to watch for

## Question Prompts (use as needed)

- Who will use this? (persona, role)
- What exactly should happen? (happy path first)
- What happens in edge cases? (errors, empty state, validation)
- Any constraints? (performance, compatibility, integrations)
- What is out of scope for now?

## Output

- Save the final requirement as Markdown file in `docs/requirements/`
- Derive name of markdown file from requirement title
  - read `/docs/requirements/`'s files and derive the next integer id for the file name
  - example filename: '1-edit-book.md'
