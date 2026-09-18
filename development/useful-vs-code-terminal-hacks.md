# Useful VS Code terminal hacks

This is optional. The [beginner path](../README.md) works in Ubuntu Bash without VS Code. Start from [Windows 11 to Ubuntu on WSL 2](zero-to-command-line-windows.md) if you do not yet have an Ubuntu project directory.

Install Visual Studio Code on Windows and the WSL extension. Details: [Developing in WSL](https://code.visualstudio.com/docs/remote/wsl).

From the Ubuntu project directory, open that Linux folder in VS Code:

```bash
code .
```

Confirm the window is a WSL session (status bar shows a WSL remote such as `WSL: Ubuntu`) and that the integrated terminal is Linux. In that terminal, `pwd` should print the Linux project path (typically under `/home/...`). If `pwd` is under `/mnt/c`, you opened a Windows path, not the Linux workspace.

## Command names, not guessed keys

Keyboard bindings differ by layout and user settings.

Use the Command Palette and the command name, or look the current binding up under Keyboard Shortcuts (Command Palette: `Preferences: Open Keyboard Shortcuts`, then search the name).

| What you want | Command name |
| --- | --- |
| Show or hide the integrated terminal | `Terminal: Toggle Terminal` |
| Open another terminal | `Terminal: Create New Terminal` |
| Jump to the previous command in the terminal | `Terminal: Scroll To Previous Command` |

`Terminal: Scroll To Previous Command` depends on terminal shell integration marking command boundaries. See [Shell integration](https://code.visualstudio.com/docs/terminal/shell-integration).
