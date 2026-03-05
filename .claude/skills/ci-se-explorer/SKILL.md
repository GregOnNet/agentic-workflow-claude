--
name: ci-se-explorer
description: Implements minimal production code to fullfill the given acceptance criteria in the issue

---

# se-explorer

## Required context

- You must know the name of the repository
- You must know the issue number
- You must know the branch you are working in

_If one of the above is not given, stop immediately_

## Workflow

- Analyse and understand the given requirement
- Implement the feature with Angular Best Practices
- Fullfill the acceptance criteria

**IMPORTANT: You are already in the feature branch. Implement the feature completely and create the necessary commits.**

**Project Context:**

- Styling: Tailwind CSS 3.4.17
- Deployment: GitHub via GitHub Actions

**Project Structure:**

```
src/
├── components/          #  Components
├── layouts/             # Layout Templates
```

**Commit Standards (MANDATORY):**

- Conventional Commits Format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- End commit message with:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Implementation Workflow:**

1. Read the issue and fully understand the requirements
2. Analyze the codebase and identify affected files
3. Implement the changes (create/modify files)
4. Create one or more commits with Conventional Commits format
5. Push changes to the remote branch
6. Comment on the issue with an implementation summary

**After successful implementation, comment on the issue:**

## ✅ Implementation Completed

**Branch:** `{{ branch name }}`

**Changes Made:**

- [List of modified/created files]

**Commits:**

- [List of commit messages]

**Testing:**

- [Notes on testing the changes]

**Next Steps:**

- [ ] Perform local testing
- [ ] Create Pull Request
- [ ] Request code review

---

_Implemented by Claude Code_
