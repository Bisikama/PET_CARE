<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
# PET_CARE Project Rules

## Project Structure

This repository is a monorepo:

PET_CARE/
- frontend/ = Next.js frontend
- backend/ = NestJS backend

## Frontend Rules

Frontend must stay inside `frontend`.

Structure:

frontend/src/
- app/ = Next.js App Router pages/layouts only
- features/ = business features
- components/ = shared UI/layout/common components
- hooks/ = shared hooks
- lib/ = axios, constants, auth config
- types/ = shared TypeScript types
- utils/ = shared helper functions

Do not put feature logic directly inside `app/page.tsx`.
Pages should only import and render feature components.

Feature structure:

features/auth/
- components/
- hooks/
- services/
- schemas/
- stores/
- types/
- utils/

Use:
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- Axios
- Zustand
- TanStack Query if API state is needed

## Backend Rules

Backend must stay inside `backend`.

Do not modify backend unless the task explicitly asks.

## Important Rules

- Never delete existing code without asking.
- Never move frontend/backend folders unless explicitly requested.
- Keep imports using `@/*` for frontend.
- Run build after changes:
  - frontend: `cd frontend && npm run build`
  - backend: `cd backend && npm run build`