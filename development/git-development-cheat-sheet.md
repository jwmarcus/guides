# Git development cheat sheet

This supplements the [beginner path](../README.md). Git checkpoints in later project work use these commands.

Run these commands in Ubuntu Bash. The remote workflow assumes an existing repository with a `main` branch and an `origin` remote; the local practice exercises do not need a remote.

Replace every placeholder before you run a command. Do not keep `Your Name`, `you@example.com`, or `new-feature` as literal values.

## Identity

Git identity is who is recorded on commits. It is not login to GitHub or any other host.

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Replace `"Your Name"` and `"you@example.com"` with the name and email you intend to appear on commits.

## Default branch for new repositories

```bash
git config --global init.defaultBranch main
```

This only affects repositories you create later with `git init`. See [git init](https://git-scm.com/docs/git-init).

It does not rename an existing local branch, and it does not change a hosted default branch. Remote default-branch migration is a separate operation.

## Feature branch

Start from an up-to-date local `main`:

```bash
git switch main
git pull --ff-only origin main
git switch -c new-feature
```

Replace `new-feature` with the branch name you intend. `--ff-only` updates `main` only when it can fast-forward; see [git pull](https://git-scm.com/docs/git-pull).

## Staging

Stage explicit paths. Do not use a blanket `git add .` in this workflow.

```bash
git add path/to/file
git diff --cached
```

`git diff` shows unstaged changes in tracked files. Untracked files do not appear in that diff; `git status` lists them.

`git diff --cached` shows what is already staged for the next commit.

## Committing

After reviewing the staged diff and running the project checks, commit when you intend to save that checkpoint:

```bash
git commit -m "Describe your changes here"
```

## Rebasing onto main

Stay on the feature branch. Fetch, then rebase onto the remote main, not a possibly stale local `main`:

```bash
git fetch origin
git rebase origin/main
```

See [git rebase](https://git-scm.com/docs/git-rebase).

## Conflicts

If rebase stops, inspect the files Git could not apply:

```bash
git status
```

Edit each conflicted file, stage the resolution, then continue, or abort and return to the pre-rebase state:

```bash
git add path/to/resolved-file
git rebase --continue
```

```bash
git rebase --abort
```

## History rewrite

Rewrite history only on your own unpublished branch.

If the branch is already published, coordinate with anyone who based work on it. Agree on the update before rewriting shared history.

## Squashing (optional, own branch)

After the rebase onto `origin/main`, you may squash your feature commits on that same unpublished branch:

```bash
git rebase -i origin/main
```

Keep `pick` on the first commit. Change each later `pick` to `squash`. If there is only one commit, there is nothing to squash.

## Pushing

```bash
git push -u origin new-feature
```

`-u` sets upstream tracking so later `git push` and `git pull` on this branch have a remote.

## Merging

Local fast-forward onto `main` is one delivery path:

```bash
git switch main
git pull --ff-only origin main
git merge --ff-only new-feature
```

Push only if pushing `main` is the intended delivery:

```bash
git push origin main
```

Hosted projects that use pull requests often merge on the host instead. In that case push `new-feature`, open the pull request, and let the host merge; do not also merge locally unless that is the project process.

## Optional first GitHub push

Git identity (`user.name` and `user.email`) is not remote authentication.

Inspect remotes before changing anything:

```bash
git remote -v
```

If the GitHub remote is already SSH (`git@github.com:`), leave it. Do not rewrite an existing SSH remote automatically.

The steps below apply to HTTPS GitHub remotes (`https://github.com/...`).

If Homebrew is installed and `gh` is missing, install GitHub CLI with Homebrew. Skip the install when `command -v gh` already prints a path. Formula: [gh](https://formulae.brew.sh/formula/gh).

```bash
command -v gh
```

```bash
brew install gh
```

If you do not use Homebrew, install GitHub CLI from the [upstream GitHub CLI page](https://cli.github.com/) rather than adding another package manager.

Then authenticate in the browser with the account you intend, and point Git's HTTPS helper at that login:

```bash
gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git --hostname github.com
```

Choose the intended account in the browser. Manuals: [gh auth login](https://cli.github.com/manual/gh_auth_login), [gh auth setup-git](https://cli.github.com/manual/gh_auth_setup-git).

After HTTPS auth, push as in the pushing section above.

## Sources

- [git init](https://git-scm.com/docs/git-init)
- [git pull](https://git-scm.com/docs/git-pull)
- [git rebase](https://git-scm.com/docs/git-rebase)
