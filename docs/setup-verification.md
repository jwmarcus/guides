# Development setup: sources and verification

Last reviewed: 2026-09-18. These guides target Windows 11 with Ubuntu on WSL 2 and Bash. Python and Node.js are part of the working environment even when the AI CLI installers do not require them.

## Why this toolchain

Use apt for Ubuntu system prerequisites, optional Homebrew for additional Linux utilities, uv for Python projects, and nvm plus npm for Node.js projects. Record runtime selections and dependencies per project. This avoids treating the machine's system Python or an arbitrary global Node version as a project's specification.

Use Claude Code or Codex for design and review, Grok Build for bounded implementation, and local programs for repeatable operations. This workflow follows John's supplied "Kicking Down Code: Design Up High, Implement Down Low" one-pager. Model names and prices are deliberately not frozen into the instructions. The important artifacts are the specification, the implementation, the acceptance checks and their observed results.

## Source map

| Area | Primary references |
| --- | --- |
| WSL installation and mode | [Install WSL](https://learn.microsoft.com/en-us/windows/wsl/install), [command reference](https://learn.microsoft.com/en-us/windows/wsl/basic-commands) |
| Files and Linux environment | [Microsoft setup guidance](https://learn.microsoft.com/en-us/windows/wsl/setup/environment) |
| Windows package manager | [WinGet](https://learn.microsoft.com/en-us/windows/package-manager/winget/) |
| Homebrew | [Linux setup](https://docs.brew.sh/Homebrew-on-Linux), [support tiers](https://docs.brew.sh/Support-Tiers), [updates](https://docs.brew.sh/FAQ) |
| Python | [uv installer](https://docs.astral.sh/uv/getting-started/installation/), [Python management](https://docs.astral.sh/uv/guides/install-python/), [projects](https://docs.astral.sh/uv/guides/projects/), [unittest](https://docs.python.org/3.12/library/unittest.html) |
| Node.js | [nvm](https://github.com/nvm-sh/nvm), [release policy](https://nodejs.org/en/about/previous-releases), [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/), [test runner](https://nodejs.org/api/test.html) |
| Claude Code | [Setup](https://code.claude.com/docs/en/setup), [authentication](https://code.claude.com/docs/en/authentication) |
| Codex | [CLI](https://learn.chatgpt.com/docs/codex/cli), [WSL](https://learn.chatgpt.com/docs/windows/wsl), [authentication](https://learn.chatgpt.com/docs/auth), [sandbox prerequisites](https://learn.chatgpt.com/docs/sandboxing) |
| Grok Build | [Official installer](https://docs.x.ai/build/overview), [headless mode](https://docs.x.ai/build/cli/headless-scripting), [permissions](https://docs.x.ai/build/features/permissions), [sandbox](https://docs.x.ai/build/features/sandbox) |
| Git and editor | [git init](https://git-scm.com/docs/git-init), [git pull](https://git-scm.com/docs/git-pull), [VS Code WSL](https://code.visualstudio.com/docs/remote/wsl) |

## Verification record

| Check | Result |
| --- | --- |
| Independent source review | 17 checks: 16 confirmed, one correction to add Codex bubblewrap prerequisites |
| Reference links | 40 reference URLs fetched successfully |
| Installed environment | Ubuntu 24.04.5 on WSL 2, x86_64; Bash 5.2.21; Git 2.43.0 |
| Available tools | uv 0.10.6; Python 3.12.8; Node.js 22.17.1; npm 11.14.0; Claude Code 2.1.276; Codex 0.155.0; Grok 1.0.25 |
| Package-manager payoff | jq pipeline executed with expected output; Ubuntu cowsay package downloaded and extracted under scratch, then executed successfully without system installation |
| Python and Node examples | Seven tests per runtime passed; valid CLI output and invalid-input exit status checked; uv lock/sync and npm lock/ci exercised with existing tools; explicit nvm initialization and all seven Node tests also passed in noninteractive Bash |
| Delegated workflow | Grok exited 0; only normalize.py and test_normalize.py added, scaffold hashes unchanged; six worker tests passed; independent exact JSON, age bounds, blank-name, invalid/empty-header and repeatability checks passed; guide acceptance printed acceptance ok |
| Markdown and shell examples | All local links resolve; Bash command blocks parse; ASCII and whitespace checks pass |
| Fresh Windows install and account login | Not exercised |

The installed versions above describe the test environment, not a latest-version recommendation. These checks do not install or update workstation software.

## Limits and maintenance

A working preconfigured WSL development environment is not a fresh Windows installation. Windows feature enablement, reboot, first Linux account creation, fresh PATH setup, new provider login and ARM64 behavior need separate execution on appropriate test machines. No claim of those flows being tested is made here.

When updating a guide, re-check its vendor sources and installed CLI help, rerun its local examples, and record the tested versions. Keep discrepancies visible. In this review, Grok's online headless page and local 1.0.25 help differ on session-id behavior and an auto-update flag; the tutorial avoids those flags. The one-pager's acceptEdits write failure is a reported observation, not a reproduced universal defect.

Permission bypass removes prompts; it does not provide isolation. A diff only shows the changes Git can see. Explain filesystem and network scope separately from confirmation behavior, and do not introduce a global security-disable step to solve a local setup issue.

The worked exercise ran under the repository's ignored work directory rather than ~/src/kickdown-practice. Existing authenticated tools were used; the Python environment and lockfile were prepared before dispatch. No scaffold commit was made. These differences avoid modifying a reader's home-directory projects or retesting account enrollment.
