# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # start dev server (Vite)
npm run build         # tsc + vite build
npm run lint          # ESLint
npm run lint:fix      # ESLint with auto-fix
npm run prettier      # check formatting
npm run prettier:fix  # auto-format
npm run check         # TypeScript type-check only (no emit)
npm test              # run all tests once (vitest run)
npm run test:watch    # vitest in watch mode
npm run test:coverage # coverage report
```

To run a single test file:

```bash
npx vitest run src/components/ExerciseForm.test.tsx
```

To run tests matching a name pattern:

```bash
npx vitest run -t "should render"
```

Firebase emulators (auth on 9099, Firestore on 8080):

```bash
npm run emulators    # start with persistent data in scratch/emulator-data
```

Enable them in dev by setting `VITE_USE_FIREBASE_EMULATORS=true` (e.g. in `.env.local`).

## Architecture

### Provider tree

`App` initializes Firebase and wraps the app in four providers (outermost to innermost): `AuthProvider` → `MantineProvider` → `QueryClientProvider` → `AppRouter`.

- **`AuthProvider`** (`src/components/AuthProvider.tsx`) — subscribes to Firebase `onAuthStateChanged`, exposes `{ userId, displayName, isLoading, error, signIn, signOut }` via `authContext`. Blocks child render until auth is resolved.
- **`CurrentUserProvider`** (`src/components/CurrentUserProvider.tsx`) — sits inside `AuthenticatedRoute`; asserts `userId` is non-null and re-exposes it via `currentUserContext` so child components can call `useCurrentUser()` without null checks.

### Routing

`HashRouter` with three authenticated routes (`/`, `/plan`, `/history`) wrapped by `AuthenticatedRoute` (redirects to `/sign-in` when unauthenticated).

### Data model

A single `Workout` document is the core Firestore entity:

```
Workout
  exerciseDefinitionsById: Record<id, ExerciseDefinition>
  days: Day[]
    exercises: DayExercise[]
      workingSets: Record<setNumber, WorkingSet>
```

`ExerciseDefinition` holds the canonical exercise config (name, type, training load, warm-up sets). `DayExercise` references a definition by ID and holds the per-workout set results.

### Data flow

- **`src/api/workoutsApi.ts`** — raw Firestore CRUD (no React).
- **`src/hooks/`** — React Query wrappers: `useCurrentWorkoutQuery`, `useWorkoutsQuery`, `useCreateWorkoutMutation`, `useUpdateWorkoutMutation`. Mutations do optimistic updates against the React Query cache and invalidate both query keys on settle.
- **`src/utils/workoutMutationHelpers.ts`** — pure functions that compute `Partial<Workout>` updates (add/edit/delete/reorder days and exercises, complete/skip/undo sets). Components call these and pass results directly to `useUpdateWorkoutMutation`.
- **`src/utils/workoutSelectors.ts`** — pure selector functions over `Workout` (e.g. `selectExerciseIsComplete`, `selectIncompleteWorkoutDays`).

### Forms

`useAppForm` (`src/hooks/useAppForm.ts`) is a typed wrapper around `@tanstack/react-form` with shared field components (`AppTextInput`, `AppNumberInput`, `AppRadioGroup`, `AppSubmitButton`) bound via `createFormHook`. All forms in the app go through this hook.

### Pages

- **CurrentWorkoutPage** — log sets for the active workout; create next workout when done.
- **PlanWorkoutPage** — add/edit/reorder days and exercises for the current workout plan.
- **HistoryPage** — read-only view of all past completed workouts.

## Testing

**Runner:** Vitest with `jsdom`. **Setup file:** `src/test-utils/setup.ts` (mocks `matchMedia`, `ResizeObserver`, `scrollIntoView`).

**Shared test utilities** (`src/test-utils/`):

- `factories.ts` — factory functions for all domain types (`makeWorkout`, `makeDay`, `makeDayExercise`, `makeExerciseDefinition`, `makeWarmUpSet`, `makeAuthContext`, `makeCurrentUserContext`). Always add new factories here.
- `utils.ts` — `deferred<T>()` for controlling promise resolution.

**Key patterns:**

- Import `describe`, `it`, `expect` explicitly from `"vitest"`.
- Use `@testing-library/user-event` (not `fireEvent`) for interactions.
- Wrap components needing Mantine in `<MantineProvider env="test">`
- Use `getByRole("textbox", { name: "Label" })` with the `name` option for labeled inputs.
- Use `toBeInTheDocument()` (jest-dom) instead of `toBeDefined()` for DOM assertions.
- After `await user.click(submitButton)`, callbacks are already called — no `waitFor` needed.
- For components with many props, use the `propsOverrides` pattern (see MEMORY.md for detail).
