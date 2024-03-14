# A cheat sheet on how to work with git, kinda.

These are the steps that I use when I develop code, either on my own, or with others. I use tools like GitHub as the collaboration and code review is much nicer on the web, sometimes.
## Branching 

When first starting to write a new feature or fix a bug, start by branching off with:

```
git branch new-feature
git checkout new-feature

# shorthand: git checkout -b new-feature
```

## Staging

After creating and checking out the branch, write your code. Add files, **stage** the files that have changed or added with:

```
git add file-to-add-or-update
```

## Committing

Now commit those staged changes:

```
git commit -m "Describe your changes here"
```

## Pushing

Once done, don't forget to push this to the `origin`, i.e. the remote server:

```
git push origin new-feature
```

## Rebasing against main

After your feature is complete (and also during development) you will want to make sure your branch does not conflict with the main branch. It is the responsibility of the branch owner to not conflict with the main branch on merge into main, so it's time to `rebase` your branch. This will take the point where your branch separated from main, and put that at the HEAD of main. It will then try to re-run each commit. To do this and solve as we go we use:

```
git pull origin main  # to get the latest main changes locally
git rebase main       # rebase against the head of main
```

## Squashing

Next we will rebase again. This time we are rebasing against our own branch, which will allow us to squash all our commits into one commit. We use the command `git merge-base my-feature main` to get the SHA for the commit where we diverged from main. In this case, it's actually the HEAD of main because we reattached our branch to the head of main in the last step. We can combine these into one handy command:

```
git rebase -i $(git merge-base my-feature main)
```

This will open a text editor with a list of the last `n` commits, each prefixed with the word "pick". To squash the commits, replace "pick" with "squash" or "s" for each commit you want to squash into the previous one, then save and close the editor.

## Merging

Finally, you can merge your feature branch into main with a fast-forward merge:

```
git checkout main
git merge --ff-only feature
```

This command will only allow the merge to proceed if it can be resolved as a fast-forward, ensuring a linear history and no merge commits. If a fast-forward merge is not possible, the merge will not proceed, and you'll get a message indicating that the merge could not be performed.