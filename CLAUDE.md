# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # TypeScript check + Vite production build
npm run check        # TypeScript type-check only
npm run lint         # Run ESLint
npm run lint-fix     # Auto-fix ESLint issues
npm run prettier     # Check Prettier formatting
npm run prettier-fix # Auto-fix Prettier formatting
npm run deploy       # Build and deploy to GitHub Pages
```

There is no test runner — the project uses manual testing against real Firebase.

## Architecture

This is a React 19 + TypeScript SPA deployed to GitHub Pages, backed by Firebase (Firestore + Auth).

**Data flow:** Firebase Firestore → React Query hooks → React components. All mutations go through `useUpdateWorkoutMutation` which calls `workoutsApi.updateWorkout()`. The entire workout document is updated on each write (no partial updates).

**Auth:** Firebase Auth with Google/GitHub OAuth. `AuthProvider` subscribes to Firebase auth state and exposes it via `authContext`. `AuthenticatedRoute` guards all app pages — unauthenticated users are redirected to `/sign-in`.

**Routing:** Uses `HashRouter` (required for GitHub Pages static hosting). Routes are defined in `AppRouter.tsx`.

**Key directories:**

- `src/api/` — Firebase Firestore CRUD (`workoutsApi.ts`)
- `src/components/` — All React components; pages are top-level, form inputs in `form/`, domain forms are `*Form.tsx` files
- `src/hooks/` — Shared logic hooks and React Query fetch/mutation hooks wrapping the API layer
- `src/types/` — TypeScript interfaces and enums for the domain model
- `src/utils/` — Pure utility functions; `workoutUtils.ts` contains plate calculation and completion-check logic

**Domain model:** A `Workout` contains an array of `Day`s, each with an array of `Exercise`s. Each exercise has warm-up sets, working sets (logged with reps + `isLogged` flag), and a `NextSessionPlan` for progressive overload suggestions. `ExerciseType` enum distinguishes double-plate (barbell), single-plate, and other exercises for the plate calculator.

**State management:** TanStack React Query manages all server state. Immer is used in `workoutUtils.ts` mutation helpers to produce immutable workout updates. TanStack React Form + Zod handles all form state and validation.

**UI:** Mantine 8 component library with dark mode. PostCSS is configured with Mantine's preset. Tabler Icons for iconography.
