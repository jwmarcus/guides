# From terminal to Node.js development

Node.js is core local tooling on this path. Use it for scripts, fixtures, and tests that rerun without another model call, not only as something an AI CLI might need.

Read [terminal-to-python-development.md](terminal-to-python-development.md) first. Stay in Ubuntu Bash. Official nvm, Node.js, and npm pages were reviewed on 2026-09-18. See the [verification record](../docs/setup-verification.md) for tested examples and installation limits.

## Install nvm

nvm is a Bash function, not a binary you install with sudo. The v0.40.7 installer from nvm-sh runs as your user, clones nvm, and appends shell init. Follow its output, then open a new Bash shell. `command -v nvm` should print `nvm`. If it prints nothing, confirm `echo $BASH_VERSION` is set and that the init snippet is in `~/.bashrc`. ([nvm](https://github.com/nvm-sh/nvm))

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.7/install.sh | bash
```

In a new Ubuntu Bash shell:

```bash
command -v nvm
```

## Install Node LTS and pin a project

Node.js publishes Current and LTS lines. LTS is the default for this path. `nvm install --lts` downloads that LTS. `nvm alias default 'lts/*'` makes new shells use the already installed LTS; it does not download Node on every start. In a project, `nvm install` reads `.nvmrc` and installs the selected version if missing; `nvm use` selects an already installed version. ([Node.js releases](https://nodejs.org/en/about/previous-releases))

```bash
nvm install --lts
nvm alias default 'lts/*'
mkdir -p ~/src
if mkdir ~/src/node-practice; then
  cd ~/src/node-practice
  node --version > .nvmrc
  nvm use
  npm init -y
else
  printf '%s\n' 'Stop: choose a new practice directory before continuing.'
fi
```

If `mkdir ~/src/node-practice` fails because the directory exists, pick another empty name or inspect that directory before continuing.

`nvm use` should select the version in `.nvmrc`. `npm init -y` writes `package.json`. Do not install Node with apt or Homebrew alongside nvm on this path.

## Runtime versus packages

nvm selects the Node interpreter and the `npm` that ships with it. `package.json` and `package-lock.json` select project packages under `node_modules/`. Switching Node does not install dependencies. `npm ci` does not change the Node version. You need both: `nvm use` for the runtime, then a lockfile install for packages.

`npm install package` adds a dependency, updates `package.json` and the lockfile, and fills `node_modules/`. `npm ci` requires an existing lockfile, installs that exact tree, and is the command to use after a clone. `npm install --package-lock-only` writes a lockfile without filling `node_modules/`, which is enough for this zero-dependency project. ([npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci))

## A first useful command

Calculate a total from JSON with Node:

```bash
node -p 'JSON.parse("[2, 3, 5]").reduce((sum, number) => sum + number, 0)'
```

Expected result: `10`. Add a number and rerun. Compare it with the Python result. These are local tools an agent can call instead of estimating totals.

## Module and tests

This module parses `name,score` with the same rules as the Python practice project. Tests use `node:test` and `node:assert/strict`, with a passing case and failing cases. ([Node.js test runner](https://nodejs.org/api/test.html))

Create `parse-score.mjs`:

```bash
cat > parse-score.mjs << 'EOF'
import path from "node:path";
import { fileURLToPath } from "node:url";

export function parseScoreLine(line) {
  const parts = String(line).split(",").map((part) => part.trim());
  if (parts.length !== 2) {
    throw new Error("expected name,score");
  }
  const [name, rawScore] = parts;
  if (!name) {
    throw new Error("name is empty");
  }
  if (!/^-?\d+$/.test(rawScore)) {
    throw new Error("score is not an integer");
  }
  const score = Number(rawScore);
  if (score < 0 || score > 100) {
    throw new Error("score is out of range");
  }
  return { name, score };
}

function main() {
  const line = process.argv[2];
  if (!line) {
    console.error("usage: node parse-score.mjs 'Name,80'");
    process.exit(1);
  }
  try {
    const result = parseScoreLine(line);
    console.log(`${result.name}:${result.score}`);
  } catch (err) {
    console.error(`error: ${err.message}`);
    process.exit(1);
  }
}

const startedDirectly =
  Boolean(process.argv[1]) &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (startedDirectly) {
  main();
}
EOF
```

Create `parse-score.test.mjs`:

```bash
cat > parse-score.test.mjs << 'EOF'
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseScoreLine } from "./parse-score.mjs";

test("accepts a typical score", () => {
  assert.deepEqual(parseScoreLine("Ada,80"), { name: "Ada", score: 80 });
});

test("accepts boundary scores", () => {
  assert.deepEqual(parseScoreLine("Ada,0"), { name: "Ada", score: 0 });
  assert.deepEqual(parseScoreLine("Ada,100"), { name: "Ada", score: 100 });
});

test("rejects a score above 100", () => {
  assert.throws(() => parseScoreLine("Ada,101"), /out of range/);
});

test("rejects a score below zero", () => {
  assert.throws(() => parseScoreLine("Ada,-1"), /out of range/);
});

test("rejects a malformed line", () => {
  assert.throws(() => parseScoreLine("Ada"), /expected name,score/);
});

test("rejects a non-integer score", () => {
  assert.throws(() => parseScoreLine("Ada,eighty"), /not an integer/);
});

test("rejects an empty name", () => {
  assert.throws(() => parseScoreLine(",80"), /name is empty/);
});
EOF
```

Ignore installed packages and scratch dirs:

```bash
cat > .gitignore << 'EOF'
node_modules/
/work/
EOF
```

Register the test script, write a lockfile, then run:

```bash
npm pkg set scripts.test='node --test'
npm install --package-lock-only
npm test
node parse-score.mjs 'Ada,80'
```

`npm test` should pass. The script should print `Ada:80`. A bad line should fail without a model:

```bash
node parse-score.mjs 'Ada,101'
```

That should print `error: score is out of range` and exit nonzero.

| Path | Role | Commit? |
| --- | --- | --- |
| `package.json` | Name, scripts, dependency list | Yes |
| `package-lock.json` | Exact resolved tree; required by `npm ci` | Yes |
| `.nvmrc` | Node version pin for this directory | Yes |
| `node_modules/` | Installed packages | No |
| `/work/` | Session scratch in later project work | No |

After a clone, run `nvm install` then `nvm use` in the project directory, then `npm ci`. `npm ci` fails without the lockfile.

## Noninteractive shells

Worker and scripted Bash may skip `~/.bashrc`, so `nvm` is missing until you load it. Set `NVM_DIR` with the XDG-aware expression, source `nvm.sh`, then `nvm use` before tests.

```bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
. "$NVM_DIR/nvm.sh"
cd ~/src/node-practice
nvm use
npm test
```

## Maintenance

To update nvm itself, check the upstream nvm installation page for a newer release and run its installer. That does not upgrade a project's Node pin or npm packages.

When you choose a newer LTS, run `nvm install --lts`, then decide whether this project's `.nvmrc` should move. Change project packages with an explicit `npm install package` (or a versioned add), not a routine wholesale update. Use `npm ci` on clones.

## Sources

- [nvm](https://github.com/nvm-sh/nvm)
- [Node.js releases](https://nodejs.org/en/about/previous-releases)
- [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci)
- [Node.js test runner](https://nodejs.org/api/test.html)

## Next

Install the manager and implementation CLIs in [terminal-to-ai-coding.md](terminal-to-ai-coding.md).
