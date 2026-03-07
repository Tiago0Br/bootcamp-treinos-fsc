# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development server (port 3000)
pnpm dev

# Build for production
pnpm build

# Lint (Biome)
pnpm lint

# Auto-format
pnpm format
```

No test runner is configured yet. Package manager is pnpm.

## Architecture

Next.js 16 (App Router) with React 19, TypeScript, and Tailwind CSS v4. Linting/formatting via Biome.

The frontend communicates with the API backend at `http://localhost:8080` (see `/api` sibling directory). The API uses Fastify 5, Prisma 7, and Better-Auth with session-based authentication.

## Code Style

Biome enforces the following (do not diverge):
- **Quotes**: single quotes for JS/TS, double quotes for JSX attributes
- **Semicolons**: omit (as-needed)
- **Trailing commas**: none
- **Indent**: 2 spaces
- **Line width**: 80 characters
- Imports are auto-organized by Biome's assist feature

Use `lang="pt-BR"` in the HTML root (the app is in Brazilian Portuguese).
