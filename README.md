# Handy and helpful guides

Practical guides for development, operations, and amateur radio. Start with the Windows 11 to Ubuntu on WSL 2 development path below.

The purpose is a local environment with Python and Node.js for deterministic tooling, a reasoning manager, a scoped implementation agent, and actual verification of files and command output.

Filenames in this path use dashes, not spaces.

## Beginner path

Read these in order. All six live under [development/](development/).

1. [Windows 11 to Ubuntu on WSL 2](development/zero-to-command-line-windows.md)
2. [Terminal, PATH, and package managers](development/terminal-and-package-managers.md)
3. [From terminal to Python development](development/terminal-to-python-development.md)
4. [From terminal to Node.js development](development/terminal-to-node-development.md)
5. [Terminal to AI coding](development/terminal-to-ai-coding.md)
6. [Spec to verified project work](development/spec-to-verified-project-work.md)

Milestone payoffs along the way: cowsay and a `jq` pipeline after package setup, then local Python and Node examples that parse, test, and print real input without a model call.

## Supplements

[Git development cheat sheet](development/git-development-cheat-sheet.md) covers identity, branches, rebase, merge, and an optional first GitHub push.

[Useful VS Code terminal hacks](development/useful-vs-code-terminal-hacks.md) covers optional VS Code on Windows with the WSL extension.

## Verification

The [setup verification record](docs/setup-verification.md) lists the official sources, tested versions, and observed results. The local Python, Node.js, and delegated-work examples were exercised. Fresh Windows installation and new provider login remain untested.

## Older notes

These files were not audited in this refresh. Treat them as older domain-specific notes.

### Ad filters

- [jm3s-minimal-linkedin.txt](ad-filters/jm3s-minimal-linkedin.txt)
- [linkedin_filter.user.js](ad-filters/linkedin_filter.user.js)

### Amateur radio

- [chrony-gpsd-timing.md](amateur-radio/chrony-gpsd-timing.md)
- [gps-timekeeping-with-chrony.md](amateur-radio/gps-timekeeping-with-chrony.md)
- [packet-bbs.md](amateur-radio/packet-bbs.md)
- [rtlsdr-with-ubuntu-18-04.md](amateur-radio/rtlsdr-with-ubuntu-18-04.md)
- [udev-rules-for-amateur-radio.md](amateur-radio/udev-rules-for-amateur-radio.md)

### Devops

- [docker-and-letsencrypt.md](devops/docker-and-letsencrypt.md)

### Notes

- [docker_notes.md](notes/docker_notes.md)
