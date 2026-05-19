# gh pr comment

`gh pr comment [<number> | <url> | <branch>] [flags]`
Add a comment to a GitHub pull request.

Without the body text supplied through flags, the command will interactively prompt for the comment text.

## Options
- -b, --body <text>
- The comment body text
- -F, --body-file <file>
- Read body text from file (use "-" to read from standard input)
- --create-if-none
- Create a new comment if no comments are found. Can be used only with --edit-last
- --delete-last
- Delete the last comment of the current user
- --edit-last
- Edit the last comment of the current user
- -e, --editor
- Skip prompts and open the text editor to write the body in
- -w, --web
- Open the web browser to write the comment
- --yes
- Skip the delete confirmation prompt when --delete-last is provided
- Options inherited from parent commands
- -R, --repo <[HOST/]OWNER/REPO>
- Select another repository using the [HOST/]OWNER/REPO format

## Examples
- `$ gh pr comment 13 --body "Hi from GitHub CLI"`