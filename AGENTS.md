# AGENTS.md

Guidance for coding agents working in this repository.

## Project Summary

- App: `lifting-log` (React + TypeScript SPA)
- Hosting: GitHub Pages
- Backend: Firebase Auth + Firestore
- UI: Mantine 8
- Server state: TanStack React Query
- Forms: TanStack React Form + Zod
- Tests: Vitest + Testing Library

## Quick Start

- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Type check: `npm run check`
- Lint: `npm run lint`
- Format check: `npm run prettier`
- Unit tests: `npm test`

## Required Quality Gate Before Finishing Changes

Run these commands and fix failures before handing off:

1. `npm run check`
2. `npm run lint`
3. `npm test`
4. `npm run prettier`

For automatic fixes when appropriate:

- `npm run lint:fix`
- `npm run prettier:fix`

## Codebase Map

- `src/api/`: Firestore API boundary (`workoutsApi.ts`)
- `src/hooks/`: React Query hooks and shared logic
- `src/components/`: Pages and UI components
- `src/components/form/`: Reusable form inputs
- `src/types/`: Domain model types
- `src/utils/`: Pure utility logic (high-value for unit tests)
- `src/test-utils/`: Test setup and fixture factories

## Architecture Notes

- Routing uses `HashRouter` (`src/components/AppRouter.tsx`) for GitHub Pages compatibility.
- `App.tsx` initializes Firebase, Mantine, and React Query providers.
- Auth state is provided via `AuthProvider`/context; protected pages go through `AuthenticatedRoute`.
- Firestore updates are done through API functions in `src/api/workoutsApi.ts`.
- Mutation hooks (for example `useUpdateWorkoutMutation`) handle optimistic cache updates and query invalidation.

## Testing Expectations

- Keep tests colocated with source files using `*.test.ts` and `*.test.tsx`.
- Prefer unit tests for:
  - `src/utils/` pure functions
  - hooks with non-trivial behavior
  - component behavior via Testing Library
- Avoid hitting real Firebase in unit tests. Mock Firebase at/above API boundaries.
- Test environment is jsdom with shared setup in `src/test-utils/setup.ts`.

## Style and Conventions

- TypeScript is strict; avoid `any` unless strongly justified.
- Prefer small, focused components and hooks.
- Use existing domain types from `src/types/` rather than duplicating inline shapes.
- Keep import ordering compatible with Prettier config (`@trivago/prettier-plugin-sort-imports`).
- Follow existing React patterns in nearby files (functional components, hooks-first composition).

## Firebase and Data Safety

- Keep Firebase-specific code in `src/api/` where possible.
- Do not introduce secret material; existing Firebase config is public client config.
- Preserve workout document compatibility when changing persisted shapes.
- If changing Firestore data shape, update all dependent readers/writers and tests in the same change.

## Deployment Notes

- Build output directory: `dist/`
- Deploy command: `npm run deploy` (uses `gh-pages -d dist`)
- App uses hash-based routing, so route links should remain hash-router compatible.

## Agent Workflow

When asked to implement a change:

1. Inspect nearby code and tests first.
2. Make the smallest reasonable change.
3. Add or update tests for behavior changes.
4. Run the quality gate commands.
5. Summarize what changed and any follow-up risks.
