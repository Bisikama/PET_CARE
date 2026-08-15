# AI Code-Generation Task Template — PET_CARE

Copy this prefix into every Antigravity task. Replace text in `<...>`.

```text
READ FIRST:
1. Read AGENTS.md.
2. Read docs/architecture/README.md.
3. Read every file listed in this task before modifying code.

If this task conflicts with current code, API contract, schema ownership, or the architecture rules:
- stop,
- explain the conflict,
- propose the smallest safe option,
- do not guess and do not redesign unrelated modules.

PROJECT ARCHITECTURE:
NestJS Modular Monolith
+ Feature-first folders
+ Clean Architecture at a practical/moderate level
+ Prisma Repository Pattern
+ Use Case for non-trivial business operations
+ DTO/Controller separated from business logic
+ Unit test for every changed/new Use Case

TASK:
<one sentence business goal>

ALLOWED SCOPE:
- <file/module allowed>
- <file/module allowed>

FORBIDDEN SCOPE:
- Do not modify <routes/DTOs/Auth/schema/etc.>
- Do not create migration unless explicitly authorized.
- Do not change response format/status/error/cookie/JWT behavior unless explicitly authorized.
- Do not refactor unrelated files.
- Do not run destructive database, Docker, Git, seed, or migration commands.
- Do not commit.

ARCHITECTURE RULES:
- Controller may only map HTTP input/current JWT identity and call a Use Case or approved legacy facade.
- Use Cases must use plain input/output; no DTO/Request/Response/Swagger/PrismaService/external SDK client imports.
- Prisma access must be through a feature repository in infrastructure/persistence.
- Repository port lives in application/ports and uses Symbol DI token.
- Do not trust ownerId/userId/role/status/price from request body.
- Enforce ownership with resource ID + current user ID from JWT.
- No BaseRepository, generic CRUD abstraction, fake domain entity, or empty folders.
- Preserve existing Auth behavior unless this task is explicitly Auth-scoped.

REQUIRED FIRST READ:
- <list exact files/tests/schema involved>

IMPLEMENTATION REQUIREMENTS:
- <exact business rule>
- <exact API contract requirements>
- <exact ownership/security requirements>
- <exact test requirements>

QUALITY GATE:
Do not run commands. Report these for the developer to run:
npm run test
npm run build
git diff --check
git status --short

FINAL REPORT:
A. Files created.
B. Files modified.
C. Dependency flow before/after.
D. API/Swagger/cookie/JWT contract preserved.
E. Tests added or updated and what behavior they prove.
F. Known risks / conflicts found.
G. Manual Swagger regression checklist.
```
