# Terminal, PATH, and package managers

Prerequisite: [Windows 11 to Ubuntu on WSL 2](zero-to-command-line-windows.md).

This guide stays on foundations: how to run commands, who owns which packages, and optional Homebrew. Python and Node come next. Last source review: 2026-09-18. A fresh Windows setup was not tested in this pass.

Ubuntu's default shell is Bash. You do not need Zsh or a prompt theme for this path.

A terminal is the window (Windows Terminal). A shell is the program that parses commands (Bash in the Ubuntu profile, PowerShell in a Windows profile). Run apt, brew, and later language tools in Ubuntu Bash. Run `wsl` and `winget` in PowerShell.

Do not copy prompt decorations. These examples omit `user@host:~$` and `PS C:\>`. Copy only the command.

## Which manager owns what

| Manager | Where you run it | Role on this path |
| --- | --- | --- |
| WinGet | PowerShell (Windows) | Windows applications |
| apt | Ubuntu Bash | Ubuntu system tools and libraries |
| Homebrew (optional) | Ubuntu Bash | Extra Linux utilities that apt does not own |
| uv | Ubuntu Bash | Python runtimes and projects; next guide |
| nvm | Ubuntu Bash | Node.js versions; next guide |

apt already installed `build-essential`, `procps`, `curl`, `file`, `git`, `ca-certificates`, `ripgrep`, and `jq` in the previous guide. Do not install those again with Homebrew or another manager.

## Move around the filesystem

`pwd` prints the current directory. `ls` lists files in it. `cd` changes directory. `~` is your Linux home, usually `/home/YOUR_LINUX_USER`. `cd` with no argument returns you there.

**Ubuntu Bash**

```bash
pwd
ls
cd
pwd
mkdir -p ~/src
cd ~/src
pwd
ls
```

Put repositories under `~/src`, not under `/mnt/c`.

## PATH and type

PATH is a colon-separated list of directories the shell searches for commands. The first match wins.

**Ubuntu Bash**

```bash
echo "$PATH"
type -a git
type -a jq
type -a curl
```

`type -a` prints every match. If a development tool resolves under `/mnt/c/`, you are about to run a Windows executable through WSL interop. Prefer the Linux binary, such as `/usr/bin/git`.

## Optional Homebrew

Homebrew is optional. Use it when you want its package selection or release cadence; keep one installation owner per tool. Homebrew is documented at [Homebrew](https://brew.sh/) and [Homebrew on Linux](https://docs.brew.sh/Homebrew-on-Linux).

Homebrew publishes which OS and CPU combinations they test: [Support Tiers](https://docs.brew.sh/Support-Tiers). As of the 2026-09-18 source review, Linux Tier 1 includes supported Ubuntu on x86_64 or ARM64 with a recent glibc. Confirm on that page before you treat brew as required.

This path does not use macOS casks. Do not run `brew --cask` on Ubuntu.

The official Linux install command downloads a script from Homebrew's GitHub repository and runs it in Bash. That is remote installer code, not an apt package. Read the URL. If you do not want to execute downloaded code, skip Homebrew. apt already covers the tools from the previous guide.

Install Homebrew only after those apt packages succeeded.

**Ubuntu Bash**

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

When it finishes, follow the printed Next steps for your machine. On typical WSL Ubuntu the brew binary is `/home/linuxbrew/.linuxbrew/bin/brew`. Load it in this shell, then persist it once in `~/.bashrc` if Next steps told you to and that line is not already there.

**Ubuntu Bash**

```bash
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
```

If `brew` is still not found, stop and use the exact lines the installer printed. Prefixes can differ.

**Ubuntu Bash**

```bash
grep -F 'brew shellenv' ~/.bashrc || echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bashrc
brew --version
brew doctor
```

The `grep` line appends the `eval` only when `~/.bashrc` does not already mention `brew shellenv`. Do not append it a second time.

`brew doctor` may print warnings. Read them. Routine brew commands do not use `sudo`.

## Make the terminal say something

If you installed Homebrew, use [cowsay](https://formulae.brew.sh/formula/cowsay) for an immediate result.

**Ubuntu Bash**

```bash
brew install cowsay
cowsay "My Linux toolbox is alive!"
```

You should see an ASCII cow with your message in a speech bubble:

```text
 ____________________________
< My Linux toolbox is alive! >
 ----------------------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
```

Change the message and run it again. You have now installed a program and passed it an argument.

If you skipped Homebrew, install cowsay with apt instead: `sudo apt install cowsay`, then run `/usr/games/cowsay "My Linux toolbox is alive!"`. Ubuntu can put games in `/usr/games`, so this full path also works when that directory is missing from PATH. Choose one installation route.

Now try a pipe. It sends one program's output into the next program's input. This example uses `jq`, installed earlier with apt, to turn JSON into a readable message.

**Ubuntu Bash**

```bash
printf '%s\n' '{"tool":"jq","jobs":3}' | jq -r '"\(.tool) checked \(.jobs) jobs locally."'
```

Expected result: `jq checked 3 jobs locally.` Change `3` to `10` and rerun. The result comes from a local program, with no model call.

## Install a useful checker with Homebrew

If you installed Homebrew, [ShellCheck](https://formulae.brew.sh/formula/shellcheck) is a useful example: it checks shell scripts locally for common mistakes. Its formula provides Linux x86_64 and ARM64 packages. Skip this install if another manager already owns ShellCheck on your machine.

**Ubuntu Bash**

```bash
brew install shellcheck
shellcheck --version
```

For a project containing a script named `run.sh`, run `shellcheck run.sh`. This is another deterministic check an agent can use instead of guessing whether a script is correct.

## Maintenance

apt and Homebrew are separate catalogs. Updating one does not update the other. Upgrades can change dependencies and command behavior. Review the available updates before applying them; Homebrew upgrades do not necessarily ask for confirmation.

Ubuntu packages, in Ubuntu Bash:

**Ubuntu Bash**

```bash
sudo apt update
sudo apt upgrade
```

Homebrew, only if you installed it:

**Ubuntu Bash**

```bash
brew update
brew outdated
brew upgrade
```

`apt update` and `brew update` refresh metadata. `apt upgrade` and `brew upgrade` install newer packages. `brew outdated` lists pending Homebrew upgrades without applying them. [Homebrew FAQ](https://docs.brew.sh/FAQ).

WinGet upgrades stay in PowerShell and apply only to Windows applications. Use `winget upgrade` to list Windows applications with available updates.

## Next

Core Python: [terminal to Python development](terminal-to-python-development.md).

Core Node.js: [terminal to Node development](terminal-to-node-development.md).

Those guides cover `uv` and `nvm`. Do not install competing Python or Node managers in this step.
