# From terminal to Python development

Python is core local tooling on this path. Use it for scripts, fixtures, and tests that rerun without another model call, not only as something an AI CLI might need.

Read [terminal-and-package-managers.md](terminal-and-package-managers.md) first. Stay in Ubuntu Bash. This page replaces the older pyenv and Oh My Zsh walkthrough at this URL. Official uv and Python pages were reviewed on 2026-09-18. See the [verification record](../docs/setup-verification.md) for tested examples and installation limits.

## Install uv

uv is the project Python manager for this path. It can install Python versions, create isolated environments, and lock dependencies without changing Ubuntu's system Python.

The standalone installer is a user-level script. Piping it to `sh` downloads that script and executes it as your user. Do not use sudo. Default placement is under `~/.local/bin`. Read the printed PATH instructions, add them if asked, then open a new Bash shell so `uv` resolves. ([uv installation](https://docs.astral.sh/uv/getting-started/installation/))

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

In a new Ubuntu Bash shell:

```bash
uv --version
type -a uv
```

`uv --version` should print a version. `type -a uv` should show a Linux path such as `~/.local/bin/uv`, not a Windows executable under `/mnt/c`. If `uv` is missing, follow the installer's PATH output and confirm `~/.local/bin` is on `PATH`.

## Install a project Python

`uv python install 3.12` downloads a uv-managed CPython 3.12 for projects. It does not replace `/usr/bin/python3`. 3.12 is a conservative supported pin used in later guides, not a claim that it is the newest Python. ([Installing Python with uv](https://docs.astral.sh/uv/guides/install-python/))

```bash
uv python install 3.12
```

Leave apt's Python alone. Do not `sudo pip install`, and do not point this practice project at a Homebrew or Windows Python.

## Create an isolated project

A uv project is a directory with `pyproject.toml`. `uv init --bare` writes that metadata file and skips sample app, README, and extra scaffold. `uv python pin 3.12` selects the 3.12 minor line; it does not pin an exact patch. Use a full version such as 3.12.8 when a project requires that exact interpreter. `uv lock` writes `uv.lock`. `uv run` creates `.venv` as needed and runs inside it. ([uv projects](https://docs.astral.sh/uv/guides/projects/))

```bash
mkdir -p ~/src
if mkdir ~/src/python-practice; then
  cd ~/src/python-practice
  uv init --bare --python 3.12
  uv python pin 3.12
  uv lock
else
  printf '%s\n' 'Stop: choose a new practice directory before continuing.'
fi
```

If `mkdir ~/src/python-practice` fails because the directory exists, pick another empty name or inspect that directory before continuing.

## A first useful command

Calculate a total from JSON with Python's standard library:

```bash
uv run python -c 'import json; print(sum(json.loads("[2, 3, 5]")))'
```

Expected result: `10`. Add another number and rerun it. Python is doing the arithmetic locally. The next example turns that same idea into a reusable, tested program.

## Files uv just created

| Path | Role | Commit? |
| --- | --- | --- |
| `pyproject.toml` | Project name, `requires-python`, dependency list | Yes |
| `uv.lock` | Exact resolved versions for this project | Yes |
| `.python-version` | Directory pin so uv selects 3.12 | Yes |
| `.venv/` | Local virtual environment created on first `uv run` or `uv sync` | No |
| `/work/` | Session scratch in later project work | No |

Ubuntu's system Python stays the OS interpreter. Project commands go through `uv run` so they use `.venv` and the pinned 3.12.

## Script and tests

The standard library is enough for this example. The script parses `name,score`, requires a nonempty name, and accepts integer scores from 0 through 100 inclusive. Tests cover those boundaries and malformed input. ([unittest](https://docs.python.org/3.12/library/unittest.html))

Create `score.py`:

```bash
cat > score.py << 'EOF'
import re
import sys


class ScoreError(ValueError):
    pass


def parse_score_line(line):
    parts = [part.strip() for part in line.split(",")]
    if len(parts) != 2:
        raise ScoreError("expected name,score")
    name, raw_score = parts
    if not name:
        raise ScoreError("name is empty")
    if not re.fullmatch(r"-?[0-9]+", raw_score):
        raise ScoreError("score is not an integer")
    score = int(raw_score)
    if score < 0 or score > 100:
        raise ScoreError("score is out of range")
    return name, score


def main():
    if len(sys.argv) != 2:
        raise SystemExit("usage: python score.py 'Name,80'")
    try:
        name, score = parse_score_line(sys.argv[1])
    except ScoreError as exc:
        raise SystemExit(f"error: {exc}") from exc
    print(f"{name}:{score}")


if __name__ == "__main__":
    main()
EOF
```

Create `test_score.py`:

```bash
cat > test_score.py << 'EOF'
import unittest

from score import ScoreError, parse_score_line


class ParseScoreLineTests(unittest.TestCase):
    def test_accepts_a_typical_score(self):
        self.assertEqual(parse_score_line("Ada,80"), ("Ada", 80))

    def test_accepts_boundary_scores(self):
        self.assertEqual(parse_score_line("Ada,0"), ("Ada", 0))
        self.assertEqual(parse_score_line("Ada,100"), ("Ada", 100))

    def test_rejects_score_above_100(self):
        with self.assertRaisesRegex(ScoreError, "out of range"):
            parse_score_line("Ada,101")

    def test_rejects_score_below_zero(self):
        with self.assertRaisesRegex(ScoreError, "out of range"):
            parse_score_line("Ada,-1")

    def test_rejects_malformed_line(self):
        with self.assertRaisesRegex(ScoreError, "expected name,score"):
            parse_score_line("Ada")

    def test_rejects_non_integer_score(self):
        with self.assertRaisesRegex(ScoreError, "not an integer"):
            parse_score_line("Ada,eighty")

    def test_rejects_empty_name(self):
        with self.assertRaisesRegex(ScoreError, "name is empty"):
            parse_score_line(",80")


if __name__ == "__main__":
    unittest.main()
EOF
```

Ignore the environment and scratch dirs:

```bash
cat > .gitignore << 'EOF'
.venv/
__pycache__/
/work/
EOF
```

Run the tests, then the script:

```bash
uv run python -m unittest -v
uv run python score.py 'Ada,80'
```

`unittest` should report seven tests and `OK`. The script should print `Ada:80`. A bad line should fail without a model:

```bash
uv run python score.py 'Ada,101'
```

That should print `error: score is out of range` and exit nonzero. Save this project. Later work should call this kind of program directly instead of re-asking a model to parse the same line.

## Optional third-party packages

Skip this for `score.py`. When the standard library is not enough, `uv add` records a real dependency in `pyproject.toml` and `uv.lock`:

```bash
uv add httpx
```

That is a separate example, not a requirement for the script above. After adding a package, `uv run` uses it from `.venv`. Remove it with `uv remove httpx` if you only wanted to see the command.

## What to commit

Commit `pyproject.toml`, `uv.lock`, `.python-version`, `.gitignore`, and the Python files. Do not commit `.venv/` or `/work/`. After a clone:

```bash
uv sync --locked
```

That recreates `.venv` from the lockfile without resolving newer versions.

## Maintenance

Standalone uv updates with `uv self update`. That refreshes the `uv` binary, not project dependencies and not Ubuntu's Python.

Upgrade project packages on purpose: `uv add package==version` or `uv lock --upgrade-package package`, then `uv sync --locked` to apply the updated lockfile. Do not make wholesale `uv lock --upgrade` a habit. `apt upgrade` does not update uv-managed interpreters or `.venv`.

## Sources

- [uv installation](https://docs.astral.sh/uv/getting-started/installation/)
- [Installing Python with uv](https://docs.astral.sh/uv/guides/install-python/)
- [uv projects](https://docs.astral.sh/uv/guides/projects/)
- [unittest](https://docs.python.org/3.12/library/unittest.html)

## Next

Install Node.js with nvm and run the same kind of local test loop in [terminal-to-node-development.md](terminal-to-node-development.md).
