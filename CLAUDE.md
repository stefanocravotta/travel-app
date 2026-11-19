# Travel App

Travel planning app with AI-generated itineraries. Learning project: the developer
(experienced in Angular) is learning React. Code quality matters more than speed.

## Stack

- Vite + React + TypeScript (strict)
- Tailwind CSS v4
- shadcn/ui (Radix base, `radix-nova` style) — components in `src/components/ui`, theme via CSS variables in `src/index.css` (`:root` light / `.dark` dark), toggled by `ThemeProvider` in `src/components/theme/`
- React Router v8 (data mode: `createBrowserRouter` in `src/router.ts`; import from `react-router`, `RouterProvider` from `react-router/dom`)
- i18n: react-i18next + i18next-browser-languagedetector, setup in `src/i18n/index.ts`. Languages `en` (fallback, source of truth) and `it`; namespaces `common` and `trips` in `src/i18n/locales/<lang>/<ns>.ts`; typed keys via `src/i18n/i18next.d.ts`. Language detected from the browser, choice saved in localStorage (`travel-app:lang`)
- Deploy: Vercel (`vercel.json` rewrites all routes to `/index.html` for client-side routing)
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
- **No hardcoded text in the UI.** Every user-visible string (text, labels, `aria-label`, `title`, validation messages) goes through `t()` from `useTranslation('<ns>')`. Add new keys to `en` first (the source of truth), then to `it`. TypeScript fails the build if a key is missing in `it` or misspelled in code.
- Logic returns translation keys, not text (e.g. `validate()` returns `ValidationErrorKey`); components translate at render time.
- Format dates and numbers with `Intl` in the active language (`i18n.resolvedLanguage`), via the helpers in `src/features/trips/format.ts`; never hardcode a locale.
- Tests run in English (`src/test/setup.ts`); get expected strings with `i18n.getFixedT('en', '<ns>')`.
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

## Git workflow (GitHub Flow)

- `main` is protected (GitHub ruleset): no direct pushes, no force pushes; merges only through a PR with the CI check "Lint, test, build" green.
- Every task goes on its own branch created from an up-to-date `main`: `feat/…`, `fix/…`, `chore/…`, `docs/…`, `refactor/…`, `test/…`.
- Close every task with a PR opened via `gh pr create` (English title in conventional-commit style, body with summary and test plan).
- Merge with squash (`gh pr merge --squash --delete-branch`) only after CI is green, then `git switch main && git pull`.
