# Terminal to AI coding

Prerequisite: [terminal to Python](terminal-to-python-development.md) and [terminal to Node.js](terminal-to-node-development.md).

This guide installs one reasoning manager CLI and xAI's official Grok Build implementation CLI. Python and Node stay in the environment so mechanical work can be saved as programs instead of repeated model calls.

Last source review: 2026-09-18. Fresh installs and account login were not tested in this pass.

Keep repositories under `~/src`. Run every command in Ubuntu Bash.

## Roles

| Role | Job | Tool on this path |
| --- | --- | --- |
| Manager | Understand the problem, choose the approach, write a spec, review evidence, and own delivery | Claude Code or Codex; pick one |
| Implementation worker | Receive one small task with file scope, exclusions, and acceptance checks; return changes; do not commit, push, or deploy | Official xAI Grok Build CLI |
| Deterministic execution | Repeatable transforms, tests, and jobs that do not need a model | Git, uv, Python, Node, npm, and other local CLIs |

Portable sequence: design, slice, persist a spec, dispatch a bounded worker, inspect the real diff, run acceptance checks, then let the manager deliver under the user's authorization. Vendor binaries, models, and prices change; this guide does not freeze those.

Installing a CLI is not the same as having service access. Each product has its own login and billing. Do not assume one subscription covers the others. Follow the linked access pages instead of copied price tables.

Start with one manager plus Grok Build as the worker. You can add the other manager later. If `type -a` already shows a Linux binary for a product, skip that installer. Do not add a second copy with npm or another manager.

## Preflight

Confirm Linux binaries, not Windows copies under `/mnt/c/`. Native AI installers do not require Node.js. The local Python and Node environment is still required for this workflow.

**Ubuntu Bash**

```bash
type -a git
type -a uv
type -a node
type -a npm
uv --version
node --version
npm --version
```

`type -a` prints every match. If a tool resolves under `/mnt/c/`, reopen an Ubuntu tab and use the Linux install from the earlier guides.

## Downloaded installers

Each official install command downloads a script and runs it as your Linux user. That is remote code, not an apt package. Read the URL. Do not prefix these CLI installers with `sudo`.

## Claude Code (manager)

Native Linux and WSL setup is documented at [Claude Code setup](https://code.claude.com/docs/en/setup). The native installer is the curl-to-bash command below. Native installs auto-update; `claude update` applies an update manually; `claude doctor` diagnoses installation issues. The standalone route does not require npm.

Account access and billing are separate from the binary: [Claude Code authentication](https://code.claude.com/docs/en/authentication). Sign in through the browser when the CLI asks. Do not commit API keys or credential files.

**Ubuntu Bash**

```bash
curl -fsSL https://claude.ai/install.sh | bash
type -a claude
claude --version
claude doctor
```

Follow any PATH instructions the installer prints. If `claude` is still missing, the usual native location is `~/.local/bin`. Add that directory once if it is not already in PATH, then load it in this shell.

**Ubuntu Bash (only if `claude` is missing)**

```bash
grep -F 'export PATH="$HOME/.local/bin:$PATH"' ~/.bashrc || echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
export PATH="$HOME/.local/bin:$PATH"
type -a claude
claude --version
```

Do not append that line a second time.

## Codex (alternative manager)

Use this section instead of Claude Code if Codex is the manager. This guide runs Codex inside WSL 2; WSL 1 is unsupported: [Codex on WSL](https://learn.chatgpt.com/docs/windows/wsl).

Standalone Linux install and later native updates both use the same installer: [Codex CLI](https://learn.chatgpt.com/docs/codex/cli). Account access: [Codex authentication](https://learn.chatgpt.com/docs/auth). Running `codex` in a project starts sign-in. Use the browser flow. Do not commit keys.

OpenAI recommends installing the distribution bubblewrap package for reliable Linux sandboxing. Install it with apt, then confirm `bwrap`. This pass did not exercise sandbox execution against a live account.

**Ubuntu Bash**

```bash
sudo apt install bubblewrap
command -v bwrap
```

`command -v bwrap` should print a path such as `/usr/bin/bwrap`.

If Codex later reports AppArmor or user-namespace errors on Ubuntu 24.04, follow [Codex sandboxing](https://learn.chatgpt.com/docs/sandboxing). That page documents an additional AppArmor profile for some Ubuntu 24.04 setups. Do not disable AppArmor, user namespaces, or other host restrictions globally to make the CLI start.

**Ubuntu Bash**

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
```

Follow the installer's PATH output, then check the binary.

**Ubuntu Bash**

```bash
type -a codex
codex --version
```

## Grok Build (implementation worker)

This is xAI's official Grok Build CLI, not an arbitrary npm package that also happens to be named `grok`. Official install: [Grok Build overview](https://docs.x.ai/build/overview). Headless scripting belongs in the next guide: [Headless scripting](https://docs.x.ai/build/cli/headless-scripting). Login and updates: [CLI reference](https://docs.x.ai/build/cli/reference).

**Ubuntu Bash**

```bash
curl -fsSL https://x.ai/cli/install.sh | bash
```

Follow the printed PATH output. On one local 1.0.25 machine the binary was `~/.grok/bin/grok`; that path is not guaranteed.

**Ubuntu Bash**

```bash
type -a grok
grok --version
grok --help
grok login
```

`grok login` opens account sign-in (browser or the documented device flow). Cost and eligibility are separate from this install.

A local 1.0.25 `grok --help` lists `--prompt-file`, `--max-turns`, `--permission-mode bypassPermissions`, `--always-approve`, `--no-subagents`, and `--disable-web-search`. Confirm those flags on the version you installed. Do not treat them as present in every release. Do not use bypass or always-approve in the first interactive session below.

`grok update` is the documented local update command.

## First session

Create a new scratch repository. If `ai-practice` already exists, stop and choose another name before continuing. Start the one manager you installed. Keep normal permission prompts and approve only what you intend.

**Ubuntu Bash**

```bash
mkdir -p ~/src
if mkdir ~/src/ai-practice; then
  cd ~/src/ai-practice
  git init -b main
  pwd
else
  printf '%s\n' 'Stop: choose a new practice directory before continuing.'
fi
```

**Ubuntu Bash (Claude Code)**

```bash
claude
```

**Ubuntu Bash (Codex)**

```bash
codex
```

Paste this prompt:

```text
Report the current working directory and the versions of git, uv, node, and npm. Use local Python and Node commands to independently sum [2, 3, 5]. Show the commands and their actual outputs. Do not edit files, run network commands, or install anything.
```

Both totals should be `10`. The manager chose commands; Python and Node performed the calculation. When you finish, use Ctrl+C as the CLI instructs to exit.

Then inspect the repository yourself. Do not trust the chat summary as proof that nothing changed.

**Ubuntu Bash**

```bash
git status --short
git diff
```

`git diff` shows tracked-file changes only. Untracked files appear as `??` in `git status --short` and need a separate `cat` or editor read. If the session wrote files despite the prompt, stop and review them before continuing.

## Updates

Claude Code native installs auto-update; `claude update` is the manual command.

Codex native installs update by running the same `curl ... | sh` installer again.

Grok Build: `grok update`.

A newer binary still needs a valid account. Revisit the authentication pages above if login fails.

## Wrong executable

If `claude`, `codex`, or `grok` resolves under `/mnt/c/`, you are about to run a Windows program through WSL interop.

**Ubuntu Bash**

```bash
type -a claude
type -a codex
type -a grok
```

Reopen Ubuntu, follow that product's native Linux installer, and confirm a Linux path. Do not install a second copy with npm to "fix" PATH. Do not change unrelated machine security settings to work around a PATH or sandbox prerequisite.

## Next

The bounded worker loop (on-disk spec, logged headless Grok run, independent acceptance checks, and a shipping boundary) is [spec to verified project work](spec-to-verified-project-work.md).
