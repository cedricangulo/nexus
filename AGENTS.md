# AGENTS.md - Repository Guidelines for Agentic Coding

This document provides essential information for agentic coding agents operating in the Nexus monorepo.

## Project Structure

```
nexus/
├── client/          # Next.js 16 React 19 frontend (Turbopack)
├── server/          # Fastify backend with Prisma ORM
└── AGENTS.md        # This file
```

## Build, Lint & Test Commands

### CLIENT (Next.js 16 + React 19)

**Setup & Development:**
```bash
cd client
pnpm install
pnpm dev              # Start dev server with Turbopack
pnpm build            # Production build
pnpm start            # Start production server
```

**Testing:**
```bash
pnpm test                           # Run unit tests
pnpm test:unit                      # Explicit unit tests
pnpm test:integration               # Run integration tests
pnpm test -- <filename>.test.ts    # Run single test file
pnpm test -- -t "test name"        # Run single test by name
```

**Code Quality:**
```bash
pnpm check                # Check code with Ultracite (ultracite check)
pnpm fix                  # Auto-fix issues with Ultracite
pnpm fix:unsafe          # Fix with unsafe transformations
```

### SERVER (Fastify + Prisma)

**Setup & Development:**
```bash
cd server
pnpm install
pnpm dev              # Start dev server with tsx watch
pnpm build            # Compile TypeScript to dist/
pnpm start            # Run compiled dist/
```

**Database:**
```bash
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run migrations (dev mode)
pnpm db:migrate:deploy # Deploy migrations (production)
pnpm db:seed          # Run seed script
pnpm db:reset         # Reset DB and run migrations
pnpm db:studio        # Open Prisma Studio UI
```

**Testing:**
```bash
pnpm test                           # Run all tests
pnpm test -- <filename>.test.ts    # Run single test file
pnpm test -- -t "test name"        # Run single test by name
```

**Code Quality:**
```bash
pnpm lint             # Lint with Biome
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code
pnpm check            # Full check (lint + format)
```

## Code Style Guidelines

### Enforced by Biome/Ultracite (Auto-Fixed)

**Formatting (Client uses Ultracite/core+next presets):**
- Indentation: 2 spaces
- Line ending: LF (Unix)
- Max line width: 100 characters (server), auto (client via Ultracite)
- Quote style: Single quotes (`'`)
- Trailing commas: ES5 style (where valid)

**Imports:**
- Imports are automatically organized by Biome
- Prefer explicit imports over namespace imports (`import { foo } from 'bar'`)
- Avoid barrel files (index.ts re-exports) for performance
- Group imports: Node built-ins, external packages, local imports (in that order)

**Variable Declarations:**
- `const` by default, `let` only for reassignment, never `var`
- Extract magic numbers/strings into named constants

### Code Organization & Architecture

**Functions & Complexity:**
- Keep functions focused and reasonably sized
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting and improve readability
- Prefer simple conditionals over nested ternary operators

**Error Handling:**
- Throw `Error` objects with descriptive messages, never strings
- Use try-catch blocks meaningfully (don't catch-and-rethrow without handling)
- Prefer early returns over deeply nested error checks
- Remove `console.log`, `debugger`, `alert` from production code

**Naming Conventions:**
- PascalCase: Classes, React components, types, interfaces
- camelCase: Variables, functions, properties, methods
- UPPER_SNAKE_CASE: Constants (rarely needed with const)
- Descriptive names: `getUserById()` not `getU()`, `isLoading` not `l`

### TypeScript & Type Safety

**General:**
- Use explicit return types for functions when they enhance clarity
- Prefer `unknown` over `any` when type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage type narrowing instead of type assertions
- Enable strict mode (required by project config)

**React/TSX:**
- Define prop interfaces explicitly (use `interface Props {}`)
- Export component types separately from implementation
- Use `ReactNode` for children prop typing
- Function components preferred over class components

### React & Next.js Patterns

**Components:**
- Use function components exclusively
- Call hooks only at top level, never conditionally
- Specify all dependencies correctly in hook arrays
- Use unique IDs for `key` prop in lists, never array indices
- Nest children between tags, not as props
- Never define components inside other components

**Server Components (App Router):**
- Use Server Components for async data fetching (not async Client Components)
- Mark client boundaries with `"use client"` directive
- Separate server and client logic clearly

**Performance:**
- Use Next.js `<Image>` component instead of `<img>`
- Use `next/head` or metadata API for head elements
- Avoid spread in loop accumulators
- Create regex literals at top level, not in loops

**Accessibility & HTML:**
- Provide meaningful alt text for images
- Use proper heading hierarchy
- Add labels for form inputs
- Include keyboard handlers alongside mouse events
- Use semantic HTML (`<button>`, `<nav>`, etc.) instead of divs with roles
- Add `rel="noopener"` to `target="_blank"` links
- Avoid `dangerouslySetInnerHTML` (validate/sanitize if necessary)

### Async/Promises

- Always `await` promises in async functions
- Use async/await instead of promise chains
- Handle errors with try-catch blocks
- Don't use async functions as Promise executors
- Don't forget to return/use awaited values

### Testing

**Structure:**
- Write assertions inside `it()` or `test()` blocks
- Use async/await in async tests (not done callbacks)
- Avoid `.only` and `.skip` in committed code
- Keep test suites reasonably flat (minimal `describe` nesting)

**Client Tests:** Vitest with jsdom (DOM environment)
**Server Tests:** Vitest with Node environment, 30s timeout for hooks/tests

### Security

- Validate and sanitize user input
- Avoid `eval()` and direct `document.cookie` assignment
- Add `rel="noopener"` for external links with `target="_blank"`

## Project-Specific Notes

**Client:**
- Uses Ultracite (zero-config Biome preset): `ultracite check` / `ultracite fix`
- Next.js 16 with Turbopack for dev/build
- Separate unit and integration test configs
- Server Client for API calls via lib/api/

**Server:**
- Fastify framework with JWT authentication
- Prisma ORM with PostgreSQL
- Module-based structure (controller/service/schema/routes per domain)
- Zod for runtime validation
- Email & file upload services included

**Shared:**
- Both use Zod for validation
- TypeScript 5.9+
- Both enforce strict linting

## When Uncertain

Biome's linter catches most issues automatically. Focus on:
1. Business logic correctness
2. Meaningful naming and documentation
3. Architecture and data flow decisions
4. Edge cases and error states
5. User experience and accessibility
6. Performance considerations

Run code quality checks before committing:
```bash
# Client
cd client && pnpm fix && pnpm test

# Server
cd server && pnpm check && pnpm test
```
