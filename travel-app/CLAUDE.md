# Travel App

Travel planning app with AI-generated itineraries. Learning project: the developer
(experienced in Angular) is learning React. Code quality matters more than speed.

## Stack
- Vite + React + TypeScript (strict)
- Tailwind CSS
- React Router, TanStack Query (to add later)
- React Hook Form + Zod (to add later)
- Vitest + Testing Library, Playwright (to add later)
- Supabase (auth, Postgres, Edge Functions) — AI calls ONLY from Edge Functions, never expose API keys in the client

## Commands
- `npm run dev` — dev server
- `npm run build` — type-check + build
- `npm run lint` — ESLint

## Conventions
- Functional components + hooks only, no class components
- One component per file, PascalCase file names (`TripForm.tsx`)
- Custom hooks in `src/hooks/`, named `useXxx`
- Feature-based folders: `src/features/<feature>/`
- Shared UI in `src/components/`
- Types next to the code that uses them; shared types in `src/types/`
- No `any`. Prefer explicit types for props.
- Conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`)

## How to work with me
- This is a learning project: before changing code, briefly explain the plan and why.
- Do NOT write core components, hooks or state logic unless I explicitly ask.
  Prefer reviewing my code, pointing out issues and suggesting improvements.
- OK to do without asking: tooling setup, config, boilerplate, tests, refactors I request.
- When you introduce a React concept, relate it to the Angular equivalent when useful.
- Keep changes small. Run `npm run lint` and `npm run build` before saying a task is done.
- Never commit or push unless I ask.