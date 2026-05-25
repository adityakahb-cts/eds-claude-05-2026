Construct and display the AEM preview URL for the current branch.

1. Run `git branch --show-current` to get the current branch name
2. Run `gh repo view --json nameWithOwner` to get `{owner}/{repo}`
3. Split nameWithOwner into owner and repo parts
4. If the branch is `main`, construct: `https://main--{repo}--{owner}.aem.page{path}`
5. Otherwise construct: `https://{branch}--{repo}--{owner}.aem.page{path}`
   where `{path}` is the argument passed to this command (default: `/`)
6. Display the URL to the user and offer to open it

The argument $ARGUMENTS is the path to preview (e.g. `/`, `/about`, `/products/card`).
