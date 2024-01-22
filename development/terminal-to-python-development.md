# Setting Up Your Python Development Environment: From Terminal to Python

Welcome to this practical guide on configuring your computer's terminal for Python development. I'll introduce some essential tools that have proven effective in my journey, which I'm confident will enhance yours too.

## Understanding Package Managers

Package managers are vital tools in software development, acting as a digital "storefront" from which you can acquire, update, and manage various software components. They simplify the handling of software dependencies and updates. Depending on your operating system, you'll need:

- **Mac**: Install HomeBrew
- **Windows**: Set up WSL with Linux (refer to my other guide) and use Ubuntu's built-in "apt"
- **Linux**: Your system already includes a package manager – identify and understand how to use it

Now, let's open a shell in the terminal and get started.

## Enhancing Your Shell Experience

This guide assumes a Linux-like environment. Mac users with Homebrew should use `brew install` instead of `apt install`. Use `sudo` only when explicitly mentioned.

- Begin by installing ZSH: `sudo apt install zsh`. [This guide](https://github.com/ohmyzsh/ohmyzsh/wiki/Installing-ZSH) can help if you encounter difficulties.
- Next, install OhMyZsh from [ohmyz.sh](https://ohmyz.sh/). Detailed instructions can be found [here](https://github.com/ohmyzsh/ohmyzsh/wiki), but it's typically a straightforward one-liner from the homepage.

## Verifying the Setup

With ZSH installed, close and reopen your terminal. You should now see a neat tilde symbol (`~`), indicating a successful setup.

## Integrating Pyenv and Shims

For Pyenv installation, I'll provide a concise version, but do refer to the [PyEnv wiki](https://github.com/pyenv/pyenv/wiki) for detailed instructions:

1. **Preparation**: Follow the guide on the [Suggested build environment](https://github.com/pyenv/pyenv/wiki#suggested-build-environment) on the PyEnv wiki to install required libraries for your OS.
2. **PyEnv Installation**: Use the [Installation Guide](https://github.com/pyenv/pyenv/?tab=readme-ov-file#installation). Windows users who followed my Linux guide should follow Ubuntu instructions.
3. **Environment Setup**: Configure your shell for Pyenv based on the instructions [here](https://github.com/pyenv/pyenv/?tab=readme-ov-file#set-up-your-shell-environment-for-pyenv). For those using ZSH, follow the relevant steps.

## Additional Testing

After completing the installation steps, restart your terminal. Verify the installation by running `pyenv --version`, which should return a version number.

## Installing Python

Choose a Python version to install:

1. Visit the [Python downloads page](https://www.python.org/downloads/) and note the recommended version (currently 3.12.1).
2. In the terminal, confirm the availability of the version with `pyenv install --list`. Then, install it using `pyenv install 3.12.1`.
3. Set this version as your default: `pyenv global 3.12.1`.

## Final Test

Restart your terminal and run `python` to check the installed version. You should see something like `Python 3.11.6 (main, Jan 20 2024,...`. Exit the Python REPL with `exit()`.

## Celebration Time

You're now set up! Try running `python` and experiment in the REPL. Start with simple expressions like `1+1`, explore Python's philosophy with `import this`, or even `import antigravity` for a bit of fun. Happy coding!
