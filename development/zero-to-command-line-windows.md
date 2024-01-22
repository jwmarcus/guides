# Setting Up a Linux Terminal on Windows: A Beginner's Guide

Embarking on your coding journey? A crucial first step is establishing a solid command line environment. Below, I outline a straightforward method to set up a functional shell in Windows:

- Utilizing Windows Subsystem for Linux (WSL2) for a more efficient development experience.
- Choosing Ubuntu 22.04 or a comparable, user-friendly distribution.

## Step 1: Update Windows

Before diving in, ensure your Windows is up to date. WSL 2 needs at least Windows 11, or Windows 10 (version 1903 or later, build 18362 or higher for x64, and version 2004 or higher, build 19041 or higher for ARM64). Skip the hassle of WSL1 and check for updates in your settings.

## Step 2: Verify WSL Installation

Launch "Windows PowerShell" and execute `wsl.exe --version`. This confirms the WSL version on your system. Version 2 or newer is recommended.

## Step 3: Choose and Install Your Distro

Given recent issues with the Windows Store and Linux distributions, I suggest using the WSL command line. Enter `wsl.exe --list --online` in PowerShell to view available distros. Opt for the latest Ubuntu, like `Ubuntu-22.04`.

**Patience is key during the installation of WSL and your distro. Don't close the installer window prematurely. You'll need to set up a user and password. Tip: Match these with your Windows credentials to avoid forgetting them.

*Note: The password creation doesn't visually confirm your typing, but rest assured, it's working.*

In case of any setup errors, simply unregister your distro using `wsl.exe --unregister distro` (replace 'distro' with your distribution's name found via `wsl.exe --list`), and start over.

## Step 4: Upgrade to a Better Terminal

Visit the Windows/Microsoft store on your PC and download Windows Terminal from the "Microsoft Corporation."

After installation, tweak a few settings: In Terminal, go to the dropdown next to the New Tab button, then into settings.

- Set your default profile to Ubuntu.
- Ensure Windows Terminal is your default terminal application.
- Embrace the Dark Mode in Appearance -> Application Theme for a better visual experience.

## Step 5: Reboot and Test Your Setup

Restart your PC. Upon booting up, open "Terminal" to access the Ubuntu terminal via WSL2. If issues arise, revisit the previous steps.

Update your distro with the following commands in Ubuntu:

```
sudo apt update
```

Enter your Ubuntu password.

```
sudo apt upgrade -y
sudo apt autoremove -y
```

## Step 6: Celebrate Your Achievement

Congratulations! You've successfully configured a Linux environment on Windows, priming you for some serious coding adventures.
