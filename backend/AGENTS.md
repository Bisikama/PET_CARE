# PET_CARE — Agent Coding Rules

> This file is the short, mandatory instruction set for any AI/code-generation task in this repository.
> The detailed source of truth is `docs/architecture/README.md`.
>
> Do not assume an AI tool reads this file automatically. Every implementation prompt must explicitly say:
> **"Read `AGENTS.md` and `docs/architecture/README.md` before changing any file."**

## 1. Required architecture

All new backend work must follow:

- NestJS Modular Monolith.
- Feature-first folders.
- Clean Architecture at a practical/moderate level.
- Prisma Repository Pattern.
- Use Case for non-trivial business operations.
- DTO/Controller separated from business logic.
- Unit tests for every new or changed Use Case.

## 2. Mandatory dependency direction

```text
Presentation (Controller / DTO / Guards)
        ↓
Application (Use Cases / application services / ports)
        ↓
Domain (optional: meaningful rules, value objects, errors)
        ↑
Infrastructure (Prisma repositories / Supabase / external gateways)
```

Allowed for new modules:

```text
Controller → Use Case → Port/Repository/Gateway → Prisma/Supabase
```

Legacy compatibility exception:

```text
Controller → Existing <Feature>Service facade → Use Case → Port/Repository/Gateway
```

Use a compatibility facade only when an existing service/public method/import must be preserved. New modules must not add a facade merely by habit.

## 3. Forbidden shortcuts

Do not:

- Call `PrismaService` from a Controller, DTO, Guard, Strategy, or Use Case.
- Call Supabase client / payment SDK / storage SDK directly from a Controller or Use Case.
- Import an HTTP DTO, `Request`, `Response`, Express, Swagger decorator, or Controller decorator into a Use Case.
- Trust `ownerId`, `userId`, role, price, payment status, or permission sent from the client when it must come from JWT/server-side state.
- Create `BaseRepository`, generic CRUD repositories, generic `BaseUseCase`, fake DDD entities, or empty architectural folders.
- Change routes, status codes, error codes/messages, cookie options, JWT claims/TTL, DTO fields, Swagger decorators, or response shape without an explicit API-contract decision.
- Run `prisma db push`, reset, seed, migration, destructive Docker, or Git commands unless the task explicitly authorizes them.
- Refactor unrelated modules in the same task.
- Remove old methods/files while imports or API contracts still depend on them.

## 4. Prisma rules

- `PrismaService` has one shared owner/provider in `src/database`.
- A feature accesses Prisma models only through a feature repository in:
  `src/modules/<feature>/infrastructure/persistence/`.
- A repository implements a feature port declared in:
  `src/modules/<feature>/application/ports/`.
- Use `Symbol` tokens for runtime injection of interfaces.
- Do not expose Prisma model types across Controller/DTO boundaries.
- No generic repository.
- Every schema or migration change requires a written schema decision and named owner before code generation.

## 5. Controller and DTO rules

Controllers may:

- Read DTOs, route params, query params, headers, and authenticated user ID.
- Call a Use Case or a legacy facade.
- Set/clear HTTP-only cookies when the transport contract requires it.
- Apply Swagger decorators, guards, roles, throttling, status codes.

Controllers may not:

- Contain business branches.
- Query Prisma or call external SDKs.
- Decide ownership from request body.
- Reimplement validation/business rules that belong in a Use Case.

DTOs are transport validation only. Do not reuse DTOs as Use Case input types.

## 6. Use Case rules

A Use Case:

- Has one business intent and one `execute(input)` method.
- Receives plain TypeScript input/output.
- Calls ports, repositories, application services, or approved gateway wrappers.
- Preserves existing error semantics when migrating a legacy flow.
- Has unit tests for success, expected failures, authorization/ownership when applicable, and unwanted side effects not occurring after failure.

A Use Case may use Nest dependency-injection decorators (`@Injectable`, `@Inject`) and existing Nest exceptions only when needed to preserve the current API error contract. It must not depend on HTTP transport objects.

## 7. Testing and completion gate

For every implementation task:

1. Read current code and tests first.
2. State the exact scope and contract that must not change.
3. Implement the smallest safe change.
4. Add/update unit tests for changed Use Cases.
5. Do not weaken/remove old tests to hide regressions.
6. Report created/modified files and known risks.
7. The developer runs:
   ```bash
   npm run test
   npm run build
   git diff --check
   git status --short
   ```
8. Run Swagger/manual regression tests for impacted endpoints.

## 8. Existing Auth exception

`src/modules/auth/auth.service.ts` is an approved compatibility facade for legacy contracts. Core Auth flows are implemented as Use Cases. Do not move or redesign Auth Controller/DTO/Swagger behavior unless a separately approved task says so.

## 9. Read-first line for every AI prompt

```text
READ FIRST: Read AGENTS.md and docs/architecture/README.md. Then read every file named in this task. If the task conflicts with current code or the architecture rules, stop and report the conflict; do not guess or redesign unrelated code.
```
