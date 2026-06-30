# PET_CARE Backend Architecture & Code Generation Handbook

> **Status:** Team source of truth for backend architecture, AI-assisted code generation, review, and MVP-safe refactoring.
>
> **Applies to:** NestJS backend under `backend/src`.
>
> **Short instruction file:** [`../../../AGENTS.md`](../../../AGENTS.md)
>
> This document defines the working rules for the following target:
>
> ```text
> NestJS Modular Monolith
> + Feature-first folders
> + Clean Architecture ở mức vừa phải
> + Prisma Repository Pattern
> + Use Case cho các nghiệp vụ quan trọng
> + DTO/Controller tách khỏi business logic
> + Unit test cho use case
> ```

---

## 1. Why this architecture exists

PET_CARE is an MVP marketplace with flows that will quickly become stateful and sensitive: authentication, provider verification, pet ownership, availability, booking, payment/escrow, evidence, dispute, and reviews.

The goal is **not** to force textbook DDD or create many files for simple CRUD. The goal is to make business rules testable, prevent controllers from becoming large services, isolate Prisma/Supabase/external integrations, and allow several team members to work without changing each other’s code accidentally.

This project uses a **Modular Monolith**:

- One deployable NestJS backend.
- One shared database while the MVP is small.
- Clear module boundaries so the project can grow without immediately becoming microservices.
- Each feature owns its controllers, use cases, repositories, tests, and external adapters.

Do **not** introduce microservices, event buses, CQRS frameworks, domain events, generic base classes, or generic repositories merely to look “enterprise”. Introduce them only after a concrete need and explicit design decision.

---

## 2. Architecture principles

### 2.1 Feature-first is mandatory

The first way to locate code must be by business feature, not technical type.

Good:

```text
src/modules/
├── auth/
├── users/
├── pets/
├── services/
├── providers/
├── availability/
├── bookings/
├── payments/
├── service-execution/
├── reviews/
├── notifications/
└── admin/
```

Avoid creating global folders such as:

```text
src/controllers/
src/services/
src/repositories/
src/dto/
```

Those structures become difficult to navigate once multiple people work on the same project.

### 2.2 Practical Clean Architecture

The dependency direction is:

```text
Presentation → Application → Domain
Infrastructure → Application through ports/tokens
```

In this project, “moderate Clean Architecture” means:

- Controllers and DTOs are HTTP transport code.
- Use Cases contain business decisions.
- Repositories hide Prisma access.
- Gateway/wrapper services hide Supabase or other external SDKs.
- Domain code is optional and only introduced when a feature has meaningful business rules that deserve an explicit type, value object, or domain error.
- Existing legacy modules may use a compatibility facade while code is migrated gradually.

It does **not** mean every CRUD endpoint requires an entity, aggregate, domain event, command, handler, mapper, presenter, and 10 files.

### 2.3 The current Auth module is a compatibility exception

Auth already had public routes, DTOs, tests, Supabase integration, JWT/cookie behavior, and existing imports. Its safe design is:

```text
AuthController
→ AuthService compatibility facade
→ Register/Login/Verify OTP/Google/Refresh Use Cases
→ AuthSessionService / SupabaseUserSyncService
→ RefreshTokenRepository / UsersService / SupabaseAuthService
→ Prisma / Supabase
```

For **new modules**, prefer:

```text
FeatureController
→ Use Case
→ Repository/Gateway
→ Prisma/External system
```

Do not copy `AuthService` into new modules merely because the file exists in Auth. A facade is only justified where legacy compatibility is required.

---

## 3. Standard module template

### 3.1 Default structure for a new feature

```text
src/modules/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts
├── dto/
│   ├── create-<feature>.dto.ts
│   ├── update-<feature>.dto.ts
│   └── <feature>-query.dto.ts              # only if needed
│
├── application/
│   ├── ports/
│   │   └── <feature>.repository.port.ts
│   ├── types/
│   │   └── <feature>.types.ts              # only if shared plain types are needed
│   ├── services/
│   │   └── <feature>-policy.service.ts     # only if genuinely reused by multiple use cases
│   └── use-cases/
│       ├── create-<feature>.use-case.ts
│       ├── list-my-<feature>.use-case.ts
│       ├── get-<feature>.use-case.ts
│       ├── update-<feature>.use-case.ts
│       └── delete-<feature>.use-case.ts
│
├── domain/                                  # optional, never create empty
│   ├── errors/
│   ├── value-objects/
│   └── <feature>.entity.ts
│
└── infrastructure/
    └── persistence/
        ├── prisma-<feature>.repository.ts
        └── prisma-<feature>.repository.spec.ts
```

The exact tree must be smaller if the feature is simpler. Do not create empty `domain`, `services`, `types`, or `ports` folders just to match a diagram.

### 3.2 When to create a Use Case

A separate Use Case is mandatory when an operation has one or more of these:

- Authorization/ownership decision.
- State transition.
- Multi-step validation.
- Multiple repository/gateway calls.
- External provider call.
- Financial, scheduling, availability, verification, or trust rule.
- Non-trivial error precedence.
- A workflow that must be unit tested independently.

Examples in PET_CARE:

| Feature | Operations that should be Use Cases |
|---|---|
| Pets | Create Pet, Update My Pet, Delete My Pet |
| Availability | Create Slot, Reserve Slot, Release Slot, Block Slot |
| Booking | Create Booking, Provider Accept, Provider Reject, Customer Cancel |
| Payments | Create Payment Hold, Release Escrow, Refund Payment |
| Service execution | Check In, Submit Evidence, Mark Complete, Report Issue |
| Provider | Submit Verification, Approve/Reject Provider Capability |
| Review | Create Review only after eligible completed booking |

Simple read-only helpers can stay in a feature application service or direct repository query, but their authorization rule must still be explicit.

### 3.3 When to create Domain types

Create a domain error, value object, or entity only when it eliminates a real ambiguity. Examples:

- `BookingStatus` transition policy.
- `Money` if payment calculations appear in more than one place.
- `TimeSlot` if overlap and boundary rules are reused.
- `PetOwnershipError` if ownership is enforced in several use cases.

Do not create “Entity” classes that only duplicate Prisma model fields with no behavior.

---

## 4. Layer rules

## 4.1 Presentation layer: Controller, DTO, Swagger, Guards

### Controllers may do

- Receive route params, query params, request headers, and DTOs.
- Obtain current user identity with existing decorators such as `@GetCurrentUserId()`.
- Invoke a Use Case or a legacy compatibility facade.
- Set or clear HTTP-only cookies when this is part of the HTTP contract.
- Use guards, roles decorators, throttling, Swagger decorators, and HTTP status decorators.
- Map a route parameter and current JWT user ID into a plain Use Case input.

### Controllers must not do

- Call `PrismaService`.
- Call Supabase, Stripe/payment provider, storage provider, email provider, or queue SDK directly.
- Contain multi-branch business logic.
- Trust a client-provided `ownerId`, `customerId`, role, price, booking status, payment status, provider verification flag, or availability status.
- Decide whether another user’s resource is accessible based only on a request body field.
- Return raw Prisma records that expose private fields.

### DTOs

DTOs are for HTTP input validation and Swagger documentation.

DTOs must:

- Use `class-validator` and existing Swagger conventions.
- Describe only fields accepted from the caller.
- Never include server-owned fields such as `ownerId`, `userId`, `createdAt`, `updatedAt`, trust badges, payment state, or internal verification state unless the API contract explicitly permits them.
- Not be passed as the business input type to a Use Case.

Do not rename DTO fields, validation constraints, or Swagger metadata in a refactor-only task.

### Swagger contract protection

A refactor must keep these unchanged unless a dedicated API-contract decision exists:

- Controller path.
- Method (`GET`, `POST`, etc.).
- DTO class and request field names.
- `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`.
- HTTP status.
- Response shape.
- Cookie behavior.
- Error code and message behavior used by frontend/tests.

---

## 4.2 Application layer: Use Cases, ports, application services

### Use Case requirements

Each Use Case:

- Represents one business intent.
- Has a clear `execute(input)` method.
- Accepts plain TypeScript input.
- Returns plain TypeScript output, not Express/Nest response objects.
- Contains the decision flow and validates business preconditions.
- Is unit tested in a co-located `*.spec.ts` file.

Preferred naming:

```text
create-pet.use-case.ts
update-my-pet.use-case.ts
create-booking.use-case.ts
accept-booking.use-case.ts
release-escrow.use-case.ts
```

### Use Case import boundary

A Use Case must not import:

```text
DTO classes
Request / Response / Express
Swagger decorators
Controller decorators
PrismaService
Prisma client directly
Supabase client directly
Payment provider SDK directly
AuthService (when AuthService is only a facade)
```

A Use Case may import:

- Plain types.
- A repository port.
- A gateway/wrapper service.
- An application service.
- Meaningful domain types/errors.
- Nest `@Injectable()` / `@Inject()` for practical dependency injection.
- Existing Nest exceptions only when preserving a pre-existing API error contract; do not use HTTP exceptions as a substitute for domain design in new complex flows without a clear reason.

### Ports

A port belongs to the Application layer and expresses what the Use Case needs, not what Prisma happens to provide.

Example:

```ts
export interface PetRepositoryPort {
  create(input: CreatePetPersistenceInput): Promise<PetRecord>;
  findOwnedById(petId: string, ownerId: string): Promise<PetRecord | null>;
  listByOwnerId(ownerId: string): Promise<PetRecord[]>;
  updateOwned(input: UpdateOwnedPetPersistenceInput): Promise<PetRecord | null>;
  archiveOwned(petId: string, ownerId: string): Promise<boolean>;
}
```

Do not put Prisma model types, DTO types, `Prisma.*Args`, Express types, or API response types into a port.

Because TypeScript interfaces do not exist at runtime, bind ports through a `Symbol` token:

```ts
export const PET_REPOSITORY = Symbol('PET_REPOSITORY');
```

### Application services

Create an application service only when two or more Use Cases share non-trivial behavior that is not persistence-specific, for example:

- Booking state transition policy.
- Session/token generation for Auth.
- Syncing a remote Supabase identity with a local User.
- Availability conflict rule.

Do not create a `FeatureService` that is just another name for a repository.

---

## 4.3 Infrastructure layer: Prisma, Supabase, external providers

### Prisma repositories

Only repositories in:

```text
src/modules/<feature>/infrastructure/persistence/
```

may query the feature’s Prisma model directly.

Repository responsibilities:

- Translate persistence input into Prisma calls.
- Apply feature-local query filters.
- Return plain persistence-safe records.
- Keep Prisma-specific details inside the repository.
- Preserve transaction semantics specified by the calling Use Case/application policy.

Repositories must not:

- Read HTTP headers/cookies.
- Call controllers.
- Decide high-level business workflows.
- Become generic `BaseRepository`.
- Return sensitive fields to API callers automatically.

### External gateways

Only a wrapper/gateway service may import and call an external SDK such as:

- Supabase.
- Payment gateway.
- Object storage.
- Email provider.
- Queue/notification provider.

Use Cases call the wrapper/gateway, not the SDK client.

Existing `SupabaseAuthService` is the approved Auth wrapper. Do not instantiate a second Supabase client inside a Use Case.

### Transactions

Do not add a generic transaction abstraction before a real cross-repository consistency case exists.

When a feature requires atomic behavior, such as booking reservation + booking creation or payment ledger + payment state update:

1. Write a small ADR/schema decision.
2. Decide which use case owns the transaction boundary.
3. Use a feature-specific transaction approach.
4. Add tests that cover partial-failure behavior.

---

## 5. Database and Prisma governance

## 5.1 Schema ownership

`prisma/schema.prisma` and `prisma/migrations/` are shared high-risk areas. Every schema change must have:

- A named owner.
- A short written schema decision.
- The business reason.
- Impacted modules/endpoints.
- Migration name.
- Rollback/compatibility note.
- Seed/test data impact.
- Team approval when it touches Booking, Payment, User, Provider, or shared enum/state fields.

Never let an AI invent a migration because a feature “probably needs” a field.

## 5.2 Required pre-migration decision

Before any migration task, create a decision document under:

```text
docs/architecture/decisions/
```

Suggested name:

```text
ADR-00X-<short-name>.md
```

Minimum content:

```md
# ADR-00X: <Decision title>

## Status
Proposed / Accepted / Superseded

## Owner
<team member>

## Business reason
Why this data change is needed.

## Proposed schema change
Models, fields, relations, enums, indexes, constraints.

## Ownership and security
Who can read/write each record and how ownership is enforced.

## Backward compatibility
Existing endpoints/data/tests that could be affected.

## Migration plan
Migration name, data backfill requirement, rollback strategy.

## Test plan
Unit/integration/Swagger/manual tests.
```

## 5.3 Migration execution rule

No implementation prompt may run:

```bash
prisma db push
prisma migrate reset
prisma migrate dev
prisma generate
seed
docker compose down -v
```

unless the task explicitly authorizes it.

When a developer chooses to run migration commands manually, record the exact command and result in the task evidence.

---

## 6. Security and ownership rules

These rules are mandatory in every module that holds user-owned data.

### 6.1 Server-owned identity

- The current user ID comes from JWT via the existing decorator/guard flow.
- Do not accept `ownerId` from create/update DTOs.
- Do not accept role from public registration/update DTOs.
- Do not accept provider verification/trust tier/badge state from the provider client.
- Do not accept booking/payment status from a client update request.
- Do not accept final prices or escrow-release values from the client if the server can calculate or validate them.

### 6.2 Ownership enforcement

For every “my resource” operation, the Use Case must query/update/delete with both:

```text
resourceId + currentUserId
```

not:

```text
resourceId only
```

Example safe pattern:

```text
GET /pets/:petId
currentUserId from JWT
→ GetMyPetUseCase.execute({ petId, ownerId: currentUserId })
→ repository.findOwnedById(petId, ownerId)
```

If no owned record exists, return the project’s chosen not-found/forbidden behavior consistently. Do not leak the existence of another user’s private resource unless the product explicitly needs it.

### 6.3 Role enforcement

- Route-level role guard protects broad access categories.
- Use Case validates business eligibility and state.
- Never rely on frontend hiding a button as access control.
- Admin/provider/customer boundaries must be enforced server-side.

---

## 7. Auth invariants to preserve

The Auth module has been refactored and is now a stable MVP baseline.

Do not change the following in unrelated feature work:

- Auth route paths and DTO contracts.
- Existing response wrapper behavior.
- Access token claim structure.
- Access/refresh token TTL.
- Refresh cookie name/options.
- Refresh token rotation order:
  ```text
  validate old token
  → delete old token record
  → generate new tokens
  → persist new refresh token
  → return new tokens
  ```
- Logout behavior for the current session.
- Supabase OTP flow.
- Supabase user synchronization rules.
- Existing guards/strategies/decorators.

Auth changes require a dedicated task, regression plan, and manual Swagger test matrix.

---

## 8. Testing policy

## 8.1 Unit tests for Use Cases

Every new or changed Use Case must have unit tests that mock only ports/gateways/application services.

Minimum tests:

1. Happy path.
2. Expected business failure.
3. Authorization or ownership denial when applicable.
4. External provider/repository failure mapping when applicable.
5. Ensure forbidden side effects do not occur after a failure.
6. Critical ordering where applicable, e.g. refresh rotation or booking reservation.

Example for `CreateBookingUseCase`:

- Creates booking when provider/service/pet/slot are eligible.
- Rejects when slot conflicts.
- Rejects when pet belongs to another customer.
- Does not reserve slot when precondition fails.
- Does not create payment intent if booking creation fails.

## 8.2 Repository tests

Repository tests are needed when query mapping is non-trivial, especially for:

- Ownership filters.
- Soft-delete filters.
- State/availability conflict queries.
- Unique constraint mapping.
- Transactional persistence behavior.

Mock `PrismaService` for focused repository unit tests. Add integration tests only when the behavior cannot be trusted through mocks.

## 8.3 E2E/Swagger manual tests

Use Swagger/manual testing for:

- Request DTO validation.
- Guard/role behavior.
- HTTP status and response wrapper.
- Cookie behavior.
- Supabase/email/Google integration.
- Real database migration behavior.
- Cross-module workflow behavior.

Swagger cannot show the value of an HttpOnly cookie. Use browser DevTools or Postman where cookie inspection is needed.

## 8.4 Never game tests

Do not:

- Delete an old test without replacing equivalent coverage.
- Change expected errors solely because a refactor accidentally changed behavior.
- Use `--forceExit` as the only proof that tests are healthy.
- Count tests as proof of correctness without checking what they assert.

---

## 9. Team workflow

## 9.1 Before generating code

Every task must start with:

1. Named module/feature.
2. One-sentence business goal.
3. Exact permitted scope.
4. Exact forbidden scope.
5. Contract that must not change.
6. Schema ownership decision if database changes are needed.
7. Existing files/tests to read first.
8. Definition of done.

For AI-assisted work, use the prompt prefix in `ANTIGRAVITY_TASK_TEMPLATE.md`.

## 9.2 During implementation

The agent must:

- Read `AGENTS.md` and this README.
- Read the listed real code first.
- State conflicts rather than guessing.
- Make the smallest safe change.
- Avoid unrelated formatting/refactors.
- Report all created and modified files.
- Preserve API behavior unless the task explicitly changes it.

## 9.3 After implementation

The developer—not the AI agent—runs the project checks unless the task explicitly authorizes execution:

```bash
npm run test
npm run build
git diff --check
git status --short
```

Then run the relevant Swagger regression matrix.

## 9.4 Pull request/merge gate

A pull request is not ready until:

- Scope is clear.
- Architecture rules were followed.
- No unrelated files changed.
- New/changed Use Cases have tests.
- Existing tests did not get weakened.
- Build/test evidence is attached.
- Swagger/manual evidence is attached for changed endpoints.
- Migration/ADR is attached if schema changes exist.
- A reviewer checks ownership/security paths.

---

## 10. Definition of done by task type

### 10.1 Refactor-only task

Must include:

- No route/DTO/Swagger/schema contract change.
- Existing behavior preserved.
- Tests updated only to relocate coverage, not weaken it.
- Unit tests and build pass.
- Swagger regression for affected endpoints.

### 10.2 New feature without schema change

Must include:

- New module follows feature-first layout.
- Controller has no business logic.
- Use Case has unit tests.
- Persistence access remains in repository.
- Ownership/roles are enforced.
- Swagger docs are complete.
- Existing shared contracts are not broken.

### 10.3 Schema-changing feature

Must include all of the above plus:

- Accepted ADR/schema decision.
- Named migration owner.
- Migration reviewed.
- No unsafe database command run by the agent.
- Backward compatibility described.
- Migration/manual test evidence.

---

## 11. Required review checklist

Use this checklist in every implementation review.

### Architecture

- [ ] Module is feature-first.
- [ ] Controller delegates to Use Case or approved legacy facade.
- [ ] Use Case does not import DTO/Request/Response/Prisma/SDK imports.
- [ ] Repository is feature-specific and not generic.
- [ ] External SDK stays behind a wrapper/gateway.
- [ ] No circular dependency introduced.
- [ ] No empty folders or unused abstractions created.

### API contract

- [ ] Route, method, DTO, Swagger, response shape, status, and errors are unchanged unless approved.
- [ ] Existing response wrapper behavior is respected.
- [ ] No private fields are exposed.
- [ ] Cookie/token behavior is unchanged unless approved.

### Security

- [ ] User/owner identity comes from JWT, not client body.
- [ ] Ownership is enforced on reads/updates/deletes.
- [ ] Role checks are server-side.
- [ ] Sensitive state is server-controlled.

### Persistence

- [ ] Prisma access is in repository.
- [ ] Schema/migration changes have an ADR and owner.
- [ ] No accidental migration/schema/.env changes.
- [ ] No generic BaseRepository introduced.

### Tests

- [ ] Use Case happy path tested.
- [ ] Important failure paths tested.
- [ ] Authorization/ownership tested when relevant.
- [ ] Side effects/order tested when relevant.
- [ ] Existing tests are preserved or equivalently replaced.
- [ ] `npm run test`, `npm run build`, and `git diff --check` evidence exists.
- [ ] Swagger/manual test evidence exists.

---

## 12. Backlog items intentionally deferred

The following are known improvements but not MVP blockers unless a feature requires them:

1. Move JWT access/refresh expiration strings to configuration variables.
2. Replace Prisma P2002 duck typing with typed Prisma error handling.
3. Introduce a User-facing port only when the number of Auth/User cross-module dependencies makes it necessary.
4. Add feature-specific transaction support for Booking/Payment once their state machine is implemented.
5. Add CI checks and import-boundary linting after the team has stabilized module patterns.

Do not refactor these items opportunistically during unrelated feature tasks.

---

## 13. Standard architecture decision records

Create ADRs in:

```text
docs/architecture/decisions/
```

Use them for:

- Schema/migration decisions.
- Booking state machine.
- Payment/escrow lifecycle.
- Soft delete vs hard delete.
- Data retention/security policy.
- Cross-module transaction choice.
- Major API contract change.

Keep each ADR focused, short enough to review, and linked from the related task/PR.

---

## 14. Final rule

The architecture is successful only if it helps the team ship the MVP safely.

When choosing between:

- a simple, tested feature-specific solution; and
- a generic abstraction with no current consumer,

choose the simple, tested feature-specific solution.
