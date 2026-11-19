# Travel App

Travel planning app with AI-generated itineraries. Learning project: the developer
(experienced in Angular) is learning React. Code quality matters more than speed.

## Stack

- Vite + React + TypeScript (strict)
- Tailwind CSS v4
- shadcn/ui (Radix base, `radix-nova` style) — components in `src/components/ui`, theme via CSS variables in `src/index.css` (`:root` light / `.dark` dark), toggled by `ThemeProvider` in `src/components/theme/`
- React Router v8 (data mode: `createBrowserRouter` in `src/router.ts`; import from `react-router`, `RouterProvider` from `react-router/dom`)
- TanStack Query (to add later)
- React Hook Form + Zod (to add later)
- Vitest + Testing Library (jsdom; setup in `src/test/setup.ts`); Playwright (to add later)
- Git hooks: husky + lint-staged (pre-commit in `.husky/pre-commit` runs ESLint `--fix` + Prettier on staged files)
- CI: GitHub Actions (`.github/workflows/ci.yml`) runs lint, test and build on every push and PR
- Supabase (auth, Postgres, Edge Functions) — AI calls ONLY from Edge Functions, never expose API keys in the client

## Commands

- `npm run dev` — dev server
- `npm run build` — type-check + build
- `npm run lint` — ESLint
- `npm run format` — Prettier (write); `npm run format:check` — Prettier (check only)
- `npm test` — run the Vitest suite once (used by CI)
- `npm run test:watch` — Vitest in watch mode
- Pre-commit hook (automatic): `lint-staged` runs ESLint + Prettier on staged files

## Conventions

- Functional components + hooks only, no class components
- One component per file, PascalCase file names (`TripForm.tsx`)
- Custom hooks in `src/hooks/`, named `useXxx`
- Feature-based folders: `src/features/<feature>/`
- Shared UI in `src/components/`
- Import alias `@/` → `src/` (configured in `tsconfig.json`, `tsconfig.app.json` and `vite.config.ts`). Use `@/...` instead of `../` paths; `./` only for files in the same folder.
- **Use the shadcn components in `src/components/ui` before creating new ones.** If one is missing, add it with `npx shadcn@latest add <name>` instead of writing it by hand; avoid editing generated files unless necessary.
- Use theme tokens (`bg-background`, `text-muted-foreground`, `text-destructive`, `border`, …) instead of fixed colors (`gray-*`, `blue-*`), so light and dark both work.
- Tests next to the file they test (`TripForm.test.tsx`). Query by role/label (`getByRole`, `getByLabelText`) and interact with `userEvent`; test visible behavior, not internals.
- Types next to the code that uses them; shared types in `src/types/`
- No `any`. Prefer explicit types for props.
- Conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`)

## How to work with me

- This is a learning project: before changing code, briefly explain the plan and why.
- Do NOT write core components, hooks or state logic unless I explicitly ask.
  Prefer reviewing my code, pointing out issues and suggesting improvements.
- OK to do without asking: tooling setup, config, boilerplate, tests, refactors I request.
- When you introduce a React concept, relate it to the Angular equivalent when useful.
- Keep changes small. Run `npm run lint`, `npm test` and `npm run build` before saying a task is done.
- Never commit or push unless I ask.
