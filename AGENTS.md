# AGENTS.md - Repository Guidelines for Agentic Coding

Essential information for agentic coding agents operating in the Nexus monorepo.

## Project Structure

```
nexus/
├── client/          # Next.js 16 React 19 frontend (Turbopack)
├── server/          # Fastify backend with Prisma ORM
├── .github/skills/  # GitHub Copilot Skills (invoked via /<skill-name>)
├── .github/prompts/ # GitHub Copilot Prompts (system-level guidelines)
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

**Formatting:**
- Indentation: 2 spaces | Line ending: LF (Unix)
- Max line width: 100 characters (server), auto (client)
- Quote style: Single quotes (`'`) | Trailing commas: ES5 style

**Imports:**
- Organized automatically by Biome
- Prefer explicit imports over namespace imports (`import { foo } from 'bar'`)
- Avoid barrel files (index.ts re-exports) for performance
- Group imports: Node built-ins, external packages, local imports

**Variables:**
- `const` by default, `let` only for reassignment, never `var`
- Extract magic numbers/strings into named constants

### Architecture Patterns

**Functions:**
- Keep functions focused and reasonably sized
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators

**Error Handling:**
- Throw `Error` objects with descriptive messages, never strings
- Use try-catch blocks meaningfully (don't catch-and-rethrow without handling)
- Prefer early returns over deeply nested error checks
- Remove `console.log`, `debugger`, `alert` from production code

**Naming:**
- PascalCase: Classes, React components, types, interfaces
- camelCase: Variables, functions, properties, methods
- UPPER_SNAKE_CASE: Constants (rarely needed with const)
- Descriptive names: `getUserById()` not `getU()`, `isLoading` not `l`

### TypeScript & React Patterns

**TypeScript:**
- Use explicit return types when they enhance clarity
- Prefer `unknown` over `any` when type is unknown
- Use const assertions (`as const`) for immutable values
- Leverage type narrowing instead of type assertions

**React:**
- Function components only; call hooks at top level only
- Specify all dependencies correctly in hook arrays
- Use unique IDs for `key` prop in lists, never array indices
- Nest children between tags, not as props
- Never define components inside other components

**Server Components (App Router):**
- Use Server Components for async data fetching (not async Client Components)
- Mark client boundaries with `"use client"` directive
- Separate server and client logic clearly

**Accessibility & HTML:**
- Provide meaningful alt text for images
- Use proper heading hierarchy
- Add labels for form inputs
- Include keyboard handlers alongside mouse events
- Use semantic HTML (`<button>`, `<nav>`, etc.) instead of divs with roles
- Add `rel="noopener"` to `target="_blank"` links
- See `.github/prompts/web-interface-guidelines.prompt.md` for detailed rules

### Animation & UI Patterns

**Stack:**
- Tailwind CSS defaults unless custom values exist or requested
- `motion/react` for JavaScript animations (formerly `framer-motion`)
- `cn` utility (`clsx` + `tailwind-merge`) for class logic

**Animation Rules:**
- Animate only compositor props (`transform`, `opacity`)
- Never animate layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`)
- Use `ease-out` on entrance; never exceed `200ms` for interaction feedback
- Respect `prefers-reduced-motion`
- See `.github/skills/ui-skills/SKILL.md` for detailed UI guidelines

**Performance:**
- Use Next.js `<Image>` component instead of `<img>`
- Avoid spread in loop accumulators
- Create regex literals at top level, not in loops
- Never use `useEffect` for render logic

## Testing

**Structure:**
- Write assertions inside `it()` or `test()` blocks
- Use async/await in async tests (not done callbacks)
- Avoid `.only` and `.skip` in committed code
- Keep test suites reasonably flat (minimal `describe` nesting)

**Client:** Vitest with jsdom (DOM environment)
**Server:** Vitest with Node environment, 30s timeout for hooks/tests

## Security

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

**Shared:**
- Zod for validation | TypeScript 5.9+ | Strict linting

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
