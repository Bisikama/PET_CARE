## Summary
- Business goal:
- Scope:

## Architecture compliance
- [ ] I read `AGENTS.md` and `docs/architecture/README.md`.
- [ ] Code is organized inside the correct feature module.
- [ ] Controller has no Prisma/external SDK/business workflow logic.
- [ ] Use Case has plain input/output and no DTO/Request/Response/Prisma/SDK imports.
- [ ] Prisma access is in a feature-specific repository.
- [ ] No generic BaseRepository/BaseUseCase was added.
- [ ] No circular dependency was introduced.

## Contract protection
- [ ] Routes, HTTP methods, DTOs, Swagger decorators, status codes, response shape, error behavior, cookie behavior, and JWT behavior are unchanged, or the approved change is documented below.
- [ ] No private/sensitive field is exposed.

## Security and ownership
- [ ] Current user identity comes from JWT/server state.
- [ ] Client does not control ownerId, role, internal status, price, payment state, or verification state.
- [ ] Ownership and role checks were tested where relevant.

## Database
- [ ] No schema/migration changed.
- [ ] If schema/migration changed, an ADR is linked and an owner approved it:
  - ADR:
  - Migration:
  - Owner:

## Tests and manual evidence
- [ ] Unit tests for changed/new Use Cases added or updated.
- [ ] Existing tests were preserved or equivalently replaced.
- [ ] `npm run test` passed.
- [ ] `npm run build` passed.
- [ ] `git diff --check` passed.
- [ ] Swagger/manual regression performed for changed endpoints.

## Evidence
- Test/build output:
- Swagger/manual cases:
- Known risks or follow-up backlog:
