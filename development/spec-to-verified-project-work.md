# Spec to verified project work

Prerequisite: [terminal to AI coding](terminal-to-ai-coding.md). Git checkpoints use the [Git cheat sheet](git-development-cheat-sheet.md).

Practice the full project loop: a manager reasons and writes a bounded spec, a worker implements only that spec, local Python becomes the reusable program, and the manager verifies evidence instead of trusting a chat summary.

Last source review: 2026-09-18. Fresh Windows setup and provider login were not tested in this pass. See the [verification record](../docs/setup-verification.md).

Keep the practice repository under `~/src`. Run every command in Ubuntu Bash.

## What you are practicing

| Role | Job | Tool on this path |
| --- | --- | --- |
| Manager | Understand the problem, slice it, write the spec, review real files and outputs, and own delivery | Claude Code or Codex; pick the one you installed |
| Implementation worker | Receive one small task with file scope, exclusions, and commands that prove completion; return changes; do not commit, push, or deploy | Official xAI Grok Build CLI |
| Deterministic execution | Repeatable transform, tests, and jobs that do not need a model | Git, uv, Python stdlib, and the program the worker writes |

Portable sequence: design, slice, persist a spec, dispatch a bounded worker, inspect the diff, run acceptance checks, then ship only under the manager and user's authorization.

The manager may be Claude Code or Codex. Grok is the concrete worker in the commands below. Vendor binaries, models, and prices change; this guide does not freeze those and does not promise speed or cost.

Installing a CLI is not service access. Confirm `uv` and `grok login` from the previous guides before this exercise.

## Disposable environment

For your first unrestricted worker run, use a disposable development VM or account without unrelated secrets or projects, then create the practice repository below. A new directory by itself is not isolation.

These worker flags skip prompts. They do not isolate the machine. WSL does not protect mounted Windows files under `/mnt/c`. Do not point this exercise at a directory that holds unrelated secrets, production repositories, or credentials.

If `~/src/kickdown-practice` already exists, stop. Inspect that directory. Do not continue this exercise inside it, and do not overwrite it.

**Ubuntu Bash**

```bash
type -a git
type -a uv
type -a grok
uv --version
grok --version
mkdir -p "$HOME/src"
if [ -e "$HOME/src/kickdown-practice" ]; then
  printf '%s\n' "stop: ~/src/kickdown-practice already exists; do not continue"
else
  mkdir "$HOME/src/kickdown-practice"
  cd "$HOME/src/kickdown-practice"
  git init -b main
  uv init --bare --python 3.12
  uv python pin 3.12
  uv lock
  uv sync --locked
  pwd
fi
```

The `if` test stops you when `~/src/kickdown-practice` already exists. `mkdir` has no `-p`, so a leftover path is not reused. If the stop message printed, do not run the rest of this guide against that directory. `uv init --bare --python 3.12` writes project metadata and skips sample app and README files. `uv python pin 3.12` selects the 3.12 minor line, not one immutable patch.

## Standing files

Create ignore rules, exercise-only project instructions, and the fixture. These commands assume the current directory is `~/src/kickdown-practice`. Use your team's bootstrap for real projects (John uses Omnissiah), or keep the project's existing instruction pair. The instruction files below exist so this exercise has a complete, bounded contract. Do not copy them into other projects.

**Ubuntu Bash**

```bash
cat > .gitignore << 'EOF'
.venv/
__pycache__/
/work/
EOF

cat > AGENTS.md << 'EOF'
# kickdown-practice

Exercise-only project instructions. Use the existing project contract or team bootstrap for real repositories.

## Worker limits

A worker may create or edit only the files named in the current spec. This exercise's implementation task allows:

- normalize.py
- test_normalize.py

Do not edit AGENTS.md, CLAUDE.md, .gitignore, pyproject.toml, uv.lock, .python-version, fixtures/, or the task spec. Tests may create temporary files; generated program output belongs under work/.

## Command

Prove local behavior with:

uv run python -m unittest -v

Then run the program the spec names, with explicit input and output paths.

Do not add dependencies. Do not use the network. Do not install tools or packages.

## Prohibited

Do not git commit, git push, git tag, or deploy. Do not change git config, remotes, or hooks. Do not spawn subagents.
EOF

cat > CLAUDE.md << 'EOF'
# Claude Code Project Instructions

`AGENTS.md` is the canonical project contract for this exercise.

@AGENTS.md
EOF

mkdir fixtures
cat > fixtures/people.csv << 'EOF'
name,age
 Alice ,30
Bob,not-a-number
Cara,25
EOF
```

`CLAUDE.md` is a thin adapter. Keep it in the same change as `AGENTS.md`. Codex and Grok read `AGENTS.md`; Claude Code imports it through `@AGENTS.md`.

The fixture is three data rows after a `name,age` header. Row 1 is the header. `' Alice ,30'` is a valid person after stripping. `Bob,not-a-number` is rejected. `Cara,25` is valid and must keep its place after Bob's row is dropped from `people`.

## Checkpoint before any worker

Inspect what the scaffold actually wrote. The manager prepares the lockfile and environment before the worker starts, so routine test execution does not add unexpected project metadata.

**Ubuntu Bash**

```bash
git status --short
ls -la
cat pyproject.toml
cat .python-version
cat .gitignore
cat AGENTS.md
cat CLAUDE.md
cat fixtures/people.csv
```

You should see the ignore file, both instruction files, `pyproject.toml`, `uv.lock`, `.python-version`, and `fixtures/people.csv`. There must be no `normalize.py` yet.

If you want a Git checkpoint of the scaffold, add those paths by name, then commit with your already configured identity. This guide does not run `git commit`. Staging explicit paths is safer than `git add .` once `work/` and `.venv/` exist.

**Ubuntu Bash**

```bash
git add .gitignore AGENTS.md CLAUDE.md pyproject.toml uv.lock .python-version fixtures/people.csv
git status --short
git diff --cached
```

Commit only if you intend to, for example `git commit -m "Add kickdown-practice scaffold"`. Manager approval of a later worker result is not permission to ship, commit, or push.

## Persist the spec

Specs live in the owning repository's ignored `work/YYYY-MM-DD--slug/` directory, one task per file, with logs adjacent. The worker receives enough context to execute. It should not open a research loop.

Create today's task directory without `-p` on the dated path so a collision stops you.

**Ubuntu Bash**

```bash
mkdir work
task_dir="$PWD/work/$(date +%F)--normalize"
mkdir "$task_dir"
git check-ignore "$task_dir/task-01.md"
printf '%s\n' "$task_dir"
```

If `mkdir "$task_dir"` fails, inspect that directory and stop. Keep this shell. `task_dir` is reused through launch, wait, and acceptance.

Write the spec with a quoted heredoc so nothing expands.

**Ubuntu Bash**

```bash
cat > "$task_dir/task-01.md" << 'EOF'
# Task 01: normalize people CSV to JSON

Repo: this directory (kickdown-practice). Python 3.12 via uv. Standard library only.

## Allowed files

Create only:

- normalize.py
- test_normalize.py

## Do not

- edit any other file
- add dependencies, use the network, or install tools
- spawn subagents
- git commit, git push, git tag, or deploy
- change git config, remotes, or hooks
- hardcode input or output paths inside normalize.py

## Context

`fixtures/people.csv` is a UTF-8 CSV with header `name,age` and these data rows in order: ` Alice ,30`, `Bob,not-a-number`, `Cara,25`.

Write a command-line program that reads one input CSV and writes one JSON document.

## Behavior

Usage: `python normalize.py INPUT.csv OUTPUT.json`

Use `csv` and `json` from the Python standard library. Take the input path from argv[1] and the output path from argv[2]. If argv length is not 2 paths, missing input, unreadable input, or a header/input error, exit nonzero and do not write the output file.

Header is row 1. After stripping each header cell, the values must be `name` then `age`. Any other header is an input error.

For each following row, count row numbers continuously (Bob is row 3). Require exactly two fields. Strip the name. A name that is empty after strip is rejected with reason `empty name`. Strip the age. The age must match `^[0-9]+$` and the integer must be between 0 and 130 inclusive; otherwise reject with reason `invalid age`. A row that does not have exactly two fields is rejected with reason `wrong column count`. If a row fails more than one check, use the first matching reason in this order: `wrong column count`, `empty name`, `invalid age`.

Keep input order. Valid rows go to `people` as objects `{name, age}` with `name` then `age`. Rejected rows go to `rejected` as objects `{row, reason}` with `row` then `reason`. `row` is the 1-based CSV record number including the header (a quoted multiline field is one record). `age` and `row` are JSON numbers.

Successful processing, including when some or all data rows are rejected, writes the JSON document and exits 0.

JSON must be UTF-8, two-space indent, keys in the order `people` then `rejected`, a newline at the end of the file, and no extra keys. Byte output must be stable across two runs on the same input.

## Tests

`test_normalize.py` uses stdlib `unittest`. Cover at least:

- a mix of valid and invalid rows
- age 0 and 130 accepted; age -1 and 131 rejected as `invalid age`
- blank or whitespace-only name rejected as `empty name`
- header mismatch: process exits nonzero and does not write the output file

Do not require the network. Do not add packages.

## Prove with

    uv run python -m unittest -v
    uv run python normalize.py fixtures/people.csv path/to/people.json

The output path is supplied by the caller. Do not hardcode a work/ path in normalize.py.

For fixtures/people.csv the JSON object must equal:

    {"people": [{"name": "Alice", "age": 30}, {"name": "Cara", "age": 25}], "rejected": [{"row": 3, "reason": "invalid age"}]}

Alice's name is stripped. Bob is rejected, not omitted silently. Cara follows Alice in `people`.

## Done when

Only the two allowed files were created. Unittest passes. The program exits 0 on the fixture, writes that object, and a second run produces identical bytes.
EOF
```

That spec is the filled template for this exercise. Reuse the same headings on later tasks: context, allowed files, requested change, commands that prove completion, prohibited actions.

Promote durable decisions into `docs/` later. Keep `work/` as scratch.

## Permissions are not isolation

The command below is John's headless recipe, with flags checked against Grok 1.0.25. It removes confirmation prompts. The one-pager reported dropped writes with `acceptEdits` in some headless runs; that is a version-specific observation, not a universal claim. We exercised the bypass recipe and still checked actual files and outputs.

[Permissions](https://docs.x.ai/build/features/permissions) and [sandboxing](https://docs.x.ai/build/features/sandbox) are separate controls. The optional `--sandbox workspace` flag limits writes to the working directory, Grok's directory and temporary storage, but permits broad reads and child network access. It is not full isolation. WSL can also access mounted Windows drives. `git diff` cannot audit or reverse network effects or changes outside Git's view.

Use the [headless documentation](https://docs.x.ai/build/cli/headless-scripting) and your installed help to check the invocation. Sandbox enforcement was not tested in this walkthrough.

**Ubuntu Bash**

```bash
grok --version
grok --help
```

You want `--prompt-file`, `--permission-mode` including `bypassPermissions`, `--always-approve`, `--no-subagents`, `--disable-web-search`, and `--max-turns` on that help text. If a flag is missing, stop; do not guess a replacement.

## Launch the worker

Stay in `~/src/kickdown-practice` in the same shell that set `task_dir`. Confirm the spec and starting tree one more time.

**Ubuntu Bash (same shell)**

```bash
pwd
printf '%s\n' "$task_dir"
sed -n '1,20p' "$task_dir/task-01.md"
git status --short
```

Launch from the repository root so the worker's current directory is the project. Redirect stdout and stderr to the task log. Record the pid.

**Ubuntu Bash (same shell)**

```bash
grok --prompt-file "$task_dir/task-01.md" --permission-mode bypassPermissions --always-approve --no-subagents --disable-web-search --max-turns 40 > "$task_dir/task-01.log" 2>&1 &
worker_pid=$!
printf '%s\n' "$worker_pid" | tee "$task_dir/task-01.pid"
```

That command was exercised with local Grok 1.0.25. `--max-turns 40` bounds the session. `--no-subagents` keeps one worker. `--disable-web-search` keeps the spec as the source.

While it runs, avoid another writer on these same files. The manager can design the next independent task, but should leave `normalize.py`, `test_normalize.py`, and the active spec alone.

You can read the log without a new Grok process:

**Ubuntu Bash (same shell)**

```bash
tail -n 40 "$task_dir/task-01.log"
```

Repeat `tail -n 40` if you want a later snapshot. That is not another worker.

When you are ready to join the process, wait in the same shell that started it. `wait` without the pid waits for every job in this shell. `wait` in a different shell cannot see this child.

**Ubuntu Bash (same shell)**

```bash
if wait "$worker_pid"; then
  worker_status=0
else
  worker_status=$?
fi
printf '%s\n' "$worker_status" | tee "$task_dir/task-01.exit"
if [ "$worker_status" -ne 0 ]; then
  printf '%s\n' "stop: worker exit $worker_status; do not treat this as success"
  tail -n 40 "$task_dir/task-01.log"
  exit "$worker_status"
fi
```

A zero worker status is necessary and not sufficient. It means the process exited 0, not that the files are correct.

### Cancel and retry

Cancel only while this worker is still the process in `worker_pid`.

**Ubuntu Bash (same shell, only if it is still running)**

```bash
kill -TERM "$worker_pid"
jobs -l
tail -n 40 "$task_dir/task-01.log"
ps -o pid,ppid,stat,cmd -p "$worker_pid" || true
ps --ppid "$worker_pid" -o pid,ppid,stat,cmd || true
```

Do not `kill` a pid from an old file just because the number is still there. Confirm the process is this Grok worker. If the pid is gone, inspect the log and `jobs` before starting a retry. If child processes remain, inspect them before launching again. A second worker on the same files is how you get a torn `normalize.py`.

## Review files, not the summary

The manager reads the tree. An empty `git diff` does not mean nothing was added.

**Ubuntu Bash**

```bash
git status --short
git diff
git status --short --untracked-files=all
```

Expected additions are `normalize.py` and `test_normalize.py` as untracked files, whether or not you committed the scaffold. If `pyproject.toml`, `AGENTS.md`, `.gitignore`, or `fixtures/people.csv` changed, that is out of scope. The scaffold already created `uv.lock`; a change to it needs explanation.

Read the untracked code, then the tests:

**Ubuntu Bash**

```bash
cat normalize.py
cat test_normalize.py
```

Look for network calls, extra files, hardcoded paths, added dependencies, and commit/push commands. Review the tests, then check the independent fixtures below.

## Independent acceptance

The manager compares program output to a known object. Do not trust `test_normalize.py` as the acceptance oracle.

**Ubuntu Bash (same shell)**

```bash
uv run python -m unittest -v
uv run python normalize.py fixtures/people.csv "$task_dir/people.json"
cat "$task_dir/people.json"
```

Unittest should report `OK`. The program should exit 0 even though Bob was rejected. Then run an acceptance script the worker did not write:

**Ubuntu Bash (same shell)**

```bash
cat > "$task_dir/accept.py" << 'EOF'
import json
import pathlib
import sys

expected = {
    "people": [
        {"name": "Alice", "age": 30},
        {"name": "Cara", "age": 25},
    ],
    "rejected": [
        {"row": 3, "reason": "invalid age"},
    ],
}

path = pathlib.Path(sys.argv[1])
actual = json.loads(path.read_text(encoding="utf-8"))
if actual != expected:
    raise SystemExit(
        "mismatch:\n expected={0!r}\n actual={1!r}".format(expected, actual)
    )
print("acceptance ok")
EOF
uv run python "$task_dir/accept.py" "$task_dir/people.json"
```

`actual != expected` fails if Alice still has leading spaces, if Bob's row is 2, if age is the string `"30"`, if Cara is missing, or if extra keys appear.

Header mismatch is an input error. Check it without using the worker's tests:

**Ubuntu Bash (same shell)**

```bash
printf '%s\n' 'foo,bar' 'Alice,30' > "$task_dir/bad-header.csv"
if uv run python normalize.py "$task_dir/bad-header.csv" "$task_dir/should-not-exist.json"; then
  printf '%s\n' "fail: header mismatch exited 0"
  exit 1
fi
if [ -e "$task_dir/should-not-exist.json" ]; then
  printf '%s\n' "fail: header mismatch wrote output"
  exit 1
fi
printf '%s\n' "header mismatch ok"
```

Byte stability is a second run, not another model call:

**Ubuntu Bash (same shell)**

```bash
uv run python normalize.py fixtures/people.csv "$task_dir/people-a.json"
uv run python normalize.py fixtures/people.csv "$task_dir/people-b.json"
cmp "$task_dir/people-a.json" "$task_dir/people-b.json"
```

`cmp` prints nothing and exits 0 when the files are identical.

If acceptance fails, small repairs can be made directly by the manager. Larger failures get a revised spec in a new task file, then a new worker run. Do not keep prompting the same session until it looks plausible.

## Reuse without a model

The point of the loop is a program you can run again.

**Ubuntu Bash**

```bash
uv run python normalize.py fixtures/people.csv "$task_dir/people.json"
uv run python "$task_dir/accept.py" "$task_dir/people.json"
```

No Grok process is required for that rerun. Later CSV files with the same columns can use the same command. If the rules change, change the spec and tests first, then the program.

## Durability and shipping

`work/` holds specs, logs, pid, exit status, and acceptance scratch. Git ignores it. Promote anything needed by the next session into tracked project files.

Keep `normalize.py` and `test_normalize.py` as tracked implementation. Promote rules you intend to keep into `docs/` in a real project. Leave secrets and logs out of commits.

The manager owns delivery, under the user's authorization. A green worker status is not a release. Do not `git commit` or `git push` because the worker finished. If you do checkpoint, add explicit paths and follow the cheat sheet.

## Practical checklist

Before launch:

- `~/src/kickdown-practice` was created empty; if it already existed you stopped
- `git status` and the starting files match the scaffold, with no `normalize.py`
- spec names allowed files, exact reject reasons, exit codes, and prove-with commands
- `grok --help` on this binary lists the launch flags
- the directory has no unrelated secrets or projects

After wait:

- `task-01.exit` is 0 (necessary, not sufficient)
- only `normalize.py` and `test_normalize.py` were added as implementation
- you read both files; `git diff` empty did not end the review
- `uv run python -m unittest -v` passed
- `accept.py` compared output to the known object and printed `acceptance ok`
- header mismatch exited nonzero and wrote no output
- `cmp` on two runs was silent
- you reran `normalize.py` without Grok

Evidence to keep under `work/YYYY-MM-DD--normalize/`: `task-01.md`, `task-01.log`, `task-01.pid`, `task-01.exit`, `people.json`, `accept.py`.

Independent test debt: this page was not a fresh Windows install, a fresh login, or a sandbox-enforcement run. Manager verification of the worker's writes and of the acceptance commands is still required on the machine that launches Grok.

## Sources

- [Grok Build headless scripting](https://docs.x.ai/build/cli/headless-scripting)
- [Grok Build permissions](https://docs.x.ai/build/features/permissions)
- [Grok Build sandbox](https://docs.x.ai/build/features/sandbox)
- Local `grok --help` on 1.0.25 (flag presence only)
- [uv projects](https://docs.astral.sh/uv/guides/projects/)
- [unittest](https://docs.python.org/3.12/library/unittest.html)
- [git init](https://git-scm.com/docs/git-init)

## Related

- Previous: [terminal to AI coding](terminal-to-ai-coding.md)
- Git checkpoints: [Git cheat sheet](git-development-cheat-sheet.md)
- Local Python: [terminal to Python](terminal-to-python-development.md)
- Verification record: [setup verification](../docs/setup-verification.md)
