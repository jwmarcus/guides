# Windows 11 to Ubuntu on WSL 2

This is the first guide in a beginner path: Windows 11, Ubuntu on WSL 2, local Python and Node tools, then AI manager and worker CLIs.

Last source review: 2026-09-18. A fresh Windows setup was not tested in this pass.

Use Windows 11. Confirm it under Settings, System, About. Microsoft also documents WSL on some Windows 10 builds; this guide does not.

A terminal is the window that shows text. A shell is the program inside that window that reads your commands. PowerShell is a Windows shell used here only to install and inspect WSL. Ubuntu Bash is the Linux shell you will use for packages, files, and later Python, Node, and AI tools.

## Check for an existing distro

Open PowerShell. If Ubuntu is already listed, skip the install command later in this guide.

**PowerShell**

```powershell
wsl --list --verbose
```

The `VERSION` column is that distro's mode. `2` means WSL 2. `wsl --version` is a different command: it prints the installed WSL package, kernel, and related component versions, not the distro mode.

If `wsl` is not found, continue with the install below.

## Install Ubuntu on WSL 2

Open PowerShell as Administrator. This installs WSL and the Ubuntu distribution and uses WSL 2 as the default mode.

**PowerShell (Administrator)**

```powershell
wsl --install -d Ubuntu
```

Reboot when Windows asks. After reboot, open Ubuntu from the Start menu if it does not launch on its own.

Install steps: [Install WSL](https://learn.microsoft.com/en-us/windows/wsl/install).

## First Ubuntu username and password

The first Ubuntu launch asks for a UNIX username and password. This Linux account is not your Windows account. Pick a lowercase username; it does not need to match Windows.

Type the password twice. Nothing appears on screen, not even dots. That is normal. You will need this password for `sudo`. It is not your Windows PIN or Hello login.

If Ubuntu already has a user, skip this section.

## Update WSL and confirm mode

Update the WSL package, then confirm component versions and the distro mode.

**PowerShell (Administrator)**

```powershell
wsl --update
```

**PowerShell**

```powershell
wsl --version
wsl --list --verbose
```

The Ubuntu row should show `VERSION` `2`. `wsl --version` should print WSL package details without error.

## Existing WSL 1 distros

If `wsl --list --verbose` shows `VERSION` `1` for a distro you still want, back it up, then convert. Use the `NAME` column exactly (often `Ubuntu`).

**PowerShell**

```powershell
wsl --export Ubuntu "$env:USERPROFILE\ubuntu-backup.tar"
if ($LASTEXITCODE -ne 0) { throw "Backup failed. Stop before converting." }
wsl --set-version Ubuntu 2
wsl --list --verbose
```

Choose a backup filename that does not already exist. Export writes a tar file of that distro. Conversion can take several minutes. Leave the window open until it finishes.

Do not use `wsl --unregister` as troubleshooting. Unregister deletes that distro and all files inside it, including the Linux home directory. Command reference: [Basic commands for WSL](https://learn.microsoft.com/en-us/windows/wsl/basic-commands).

If install or virtualization fails, follow Microsoft's guide instead of guessing BIOS settings: [WSL troubleshooting](https://learn.microsoft.com/en-us/windows/wsl/troubleshooting).

## Windows Terminal, only if needed

Windows 11 often already includes Windows Terminal. Open it from Start. If it is missing, install it with WinGet from PowerShell.

**PowerShell**

```powershell
winget install --id Microsoft.WindowsTerminal -e
```

If `winget` is not found, install or update App Installer from the Microsoft Store, then retry. WinGet manages Windows applications. It does not install Ubuntu packages. [Use WinGet](https://learn.microsoft.com/en-us/windows/package-manager/winget/).

In Windows Terminal, open Settings and set the default profile to Ubuntu. New tabs then start Ubuntu Bash instead of PowerShell.

The Ubuntu profile is a Terminal shortcut into your WSL distro. The shell inside that profile is Bash.

## Ubuntu packages and a Linux workspace

Work in an Ubuntu tab. Refresh apt's package lists, apply Ubuntu upgrades, then install the build and CLI tools this path uses.

**Ubuntu Bash**

```bash
cat /etc/os-release
uname -m
sudo apt update
sudo apt upgrade
sudo apt install build-essential procps curl file git ca-certificates ripgrep jq
```

Record the Ubuntu release and CPU architecture printed by the first two commands when asking for setup help. Enter the Linux password when `sudo` asks. Read the upgrade list before you confirm.

Keep project files in the Linux filesystem, not under `/mnt/c`. `/mnt/c` is your Windows `C:` drive. Linux tools are slower there and can hit permission and line-ending problems. Microsoft recommends keeping files on the filesystem that matches the tools you run: [Set up a WSL development environment](https://learn.microsoft.com/en-us/windows/wsl/setup/environment).

**Ubuntu Bash**

```bash
mkdir -p ~/src
cd ~/src
pwd
```

`~/src` is `/home/YOUR_LINUX_USER/src`. Optional: open the current Linux directory in Windows Explorer.

**Ubuntu Bash**

```bash
explorer.exe .
```

## Next

Continue with [terminal and package managers](terminal-and-package-managers.md) for navigation, PATH, apt versus WinGet, and optional Homebrew.
