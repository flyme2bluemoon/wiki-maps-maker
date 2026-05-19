# AGENTS.md

Instructions for AI coding agents working in this repository.

## Defaults

- Use TypeScript for new code when the project supports TypeScript.
- Use Tailwind CSS for styling when the project supports Tailwind.
- Use `pnpm` for package management.

## Workflow

- Before starting a dev server, check whether one is already running. Reuse the existing server when possible.
- Before installing any package, ask the user for permission. This applies to npm, pnpm, pip, Homebrew, and any other package manager.
- Before downloading code from the internet and running it, ask the user for permission.
- Keep changes focused on the user's request.
- Follow existing project patterns before introducing new abstractions, libraries, or conventions.
