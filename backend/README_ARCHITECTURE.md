# PET_CARE Backend — Architecture & Development Guide

> **Tài liệu bắt buộc dành cho Backend Engineer trước khi sửa hoặc tạo code.**
>
> Mục tiêu: toàn bộ backend PET_CARE phải phát triển theo cùng một kiến trúc, tránh code chồng chéo, gọi Prisma trực tiếp sai layer, làm vỡ Swagger/API contract, hoặc tạo migration không được phê duyệt.

---

## 1. Mục đích và phạm vi

PET_CARE backend được xây dựng theo định hướng:

```text
NestJS Modular Monolith
+ Feature-first folders
+ Clean Architecture ở mức vừa phải
+ Prisma Repository Pattern
+ Use Case cho các nghiệp vụ quan trọng
+ DTO/Controller tách khỏi business logic
+ Unit test cho Use Case
```

### Điều này có nghĩa là gì?

- Hệ thống hiện là **một NestJS backend duy nhất**, không phải microservice.
- Mỗi nghiệp vụ lớn là một **feature module** độc lập: `auth`, `users`, `pets`, `bookings`, `availability`, `payments`, `service-execution`, v.v.
- Module có nghiệp vụ phức tạp phải tách rõ Controller, Use Case, Repository/Port và Infrastructure.
- Không dùng Clean Architecture quá nặng: không tạo Domain Entity, Aggregate, BaseRepository, BaseUseCase hoặc Port nếu chúng không mang lại giá trị thật cho task hiện tại.
- Đảm bảo business rule có thể unit test mà không cần chạy database/Supabase thật.

---

## 2. Quy tắc vàng — dependency direction

Đường phụ thuộc hợp lệ cho feature module mới:

```text
HTTP Request
  → Controller
    → Use Case
      → Port / Repository / Gateway / Application Service
        → Prisma / Supabase / Payment Gateway / Redis / Storage
```

### Không được đi ngược chiều

```text
Controller → PrismaService                         ❌
Controller → Supabase client / Stripe / Storage    ❌
Use Case → PrismaService                            ❌
Use Case → DTO / Request / Response / Swagger      ❌
Repository → Controller                             ❌
Module A → Prisma model của Module B trực tiếp      ❌
```

---

## 3. Cấu trúc backend hiện tại và chuẩn cần giữ

```text
backend/
├── src/
│   ├── common/
│   │   ├── constants/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   └── interceptors/
│   │
│   ├── database/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── pets/                    # future / when approved
│   │   ├── services/                # future / when approved
│   │   ├── providers/               # future / when approved
│   │   ├── availability/            # future / when approved
│   │   ├── bookings/                # future / when approved
│   │   ├── payments/                # future / when approved
│   │   ├── service-execution/       # future / when approved
│   │   └── notifications/           # future / when approved
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── test/
├── docs/
├── AGENTS.md
├── package.json
└── README.md
```

> **Feature-first** nghĩa là code của một nghiệp vụ phải ở cùng một module. Không chia toàn project thành thư mục `controllers/`, `services/`, `repositories/` chung cho tất cả nghiệp vụ.

---

## 4. Cấu trúc bắt buộc cho module mới

Dùng cho feature có business logic quan trọng như `pets`, `availability`, `bookings`, `payments`, `service-execution`.

```text
src/modules/<feature>/
├── <feature>.controller.ts
├── <feature>.module.ts
├── <feature>.tokens.ts                 # tạo khi cần Symbol DI token
│
├── dto/
│   ├── create-<feature>.dto.ts
│   ├── update-<feature>.dto.ts
│   └── query-<feature>.dto.ts          # chỉ tạo khi có filter/pagination
│
├── application/
│   ├── ports/
│   │   └── <feature>.repository.port.ts
│   │
│   ├── types/
│   │   └── <feature>.types.ts          # plain TS types nếu cần
│   │
│   ├── services/
│   │   └── <feature>-policy.service.ts # chỉ khi có logic dùng chung thật sự
│   │
│   └── use-cases/
│       ├── create-<feature>.use-case.ts
│       ├── list-my-<feature>.use-case.ts
│       ├── get-<feature>.use-case.ts
│       ├── update-<feature>.use-case.ts
│       └── delete-<feature>.use-case.ts
│
└── infrastructure/
    └── persistence/
        ├── prisma-<feature>.repository.ts
        └── prisma-<feature>.repository.spec.ts   # khi repository logic cần test
```

### Không tạo folder rỗng

Không bắt buộc tạo toàn bộ các folder ở trên. Ví dụ:

- Feature chỉ có read query đơn giản có thể không cần `application/services/`.
- Feature không dùng database thì không cần `infrastructure/persistence/`.
- Feature có 1 use case đơn giản vẫn cần cấu trúc vừa đủ, không sinh file vô nghĩa.

---

## 5. Trách nhiệm của từng layer

| Layer                        | Được phép làm                                                                                      | Không được làm                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `controller`                 | Route, HTTP method, DTO validation, Guard, Swagger, lấy user ID từ JWT, gọi Use Case, trả response | Prisma query, Supabase/Payment/Storage call, ownership logic, pricing, state transition |
| `dto`                        | Validate dữ liệu HTTP, Swagger schema                                                              | Business logic, Prisma type, quyền sở hữu                                               |
| `application/use-cases`      | Business rule, ownership, state transition, orchestration, gọi Port/Gateway                        | DTO/Express/Swagger import, PrismaService direct, HTTP cookie handling                  |
| `application/services`       | Logic nghiệp vụ dùng chung giữa nhiều Use Case trong cùng feature                                  | Controller logic hoặc Prisma direct nếu không có lý do đặc biệt                         |
| `application/ports`          | Interface/plain contract mà Use Case cần                                                           | Prisma type hoặc SDK type rò rỉ ra ngoài nếu có thể tránh                               |
| `infrastructure/persistence` | Prisma query, mapping persistence, transaction detail                                              | Route/DTO/Swagger/business rule lớn                                                     |
| `common`                     | Guard, decorator, filter, interceptor, constant dùng chung                                         | Logic đặc thù của một feature                                                           |

---

## 6. Quy tắc Controller

Controller chỉ có bốn trách nhiệm:

1. Nhận request và validate bằng DTO.
2. Áp dụng Guard / Role / Swagger decorator.
3. Lấy user hiện tại từ JWT.
4. Gọi **một Use Case** hoặc facade hợp lệ và trả result.

### Ví dụ đúng

```ts
@Post()
@ApiBearerAuth()
@ApiOperation({ summary: 'Create a pet profile' })
async create(
  @GetCurrentUserId() userId: string,
  @Body() dto: CreatePetDto,
) {
  return this.createPetUseCase.execute({
    ownerId: userId,
    name: dto.name,
    species: dto.species,
    breed: dto.breed,
    birthDate: dto.birthDate,
  });
}
```

### Ví dụ sai

```ts
@Post()
async create(@Body() dto: CreatePetDto) {
  return this.prisma.pet.create({
    data: {
      ...dto,
      ownerId: dto.ownerId, // frontend tự gửi ownerId → nguy hiểm
    },
  });
}
```

### Quy tắc bảo mật bắt buộc

- **Không bao giờ tin** `ownerId`, `userId`, `role`, `price`, `bookingStatus`, `paymentStatus`, `providerId` do frontend gửi như nguồn sự thật.
- Current user ID luôn lấy từ JWT:

```ts
@GetCurrentUserId() userId: string
```

- Ownership check phải nằm trong Use Case hoặc repository query, không chỉ dựa vào frontend.

---

## 7. Quy tắc DTO

DTO chỉ tồn tại ở HTTP/Presentation layer.

### DTO được dùng ở đâu?

```text
Controller ✅
Swagger ✅
ValidationPipe ✅
Use Case ❌
Repository ❌
```

### Cách map DTO đúng

```ts
// Controller
return this.createBookingUseCase.execute({
  customerId: userId,
  providerId: dto.providerId,
  serviceId: dto.serviceId,
  slotId: dto.slotId,
});
```

```ts
// Use Case — plain TypeScript input
export type CreateBookingInput = {
  customerId: string;
  providerId: string;
  serviceId: string;
  slotId: string;
};
```

Use Case **không được** import `CreateBookingDto`.

---

## 8. Quy tắc Use Case

Tạo Use Case khi flow có bất kỳ điều kiện nào sau:

- Có ownership/permission rule.
- Có nhiều nhánh business rule.
- Có state transition.
- Có external integration.
- Có payment/refund/escrow.
- Có availability conflict hoặc matching.
- Có nhiều database operation cần kiểm soát.
- Có rule cần test độc lập.

### Chuẩn tối thiểu

```ts
@Injectable()
export class CreatePetUseCase {
  constructor(
    @Inject(PET_REPOSITORY)
    private readonly petRepository: PetRepositoryPort,
  ) {}

  async execute(input: CreatePetInput) {
    // Validate business rules here.
    // Do not use PrismaService here.
    return this.petRepository.create(input);
  }
}
```

### Use Case không được import

```text
CreatePetDto                       ❌
Request / Response / Express       ❌
@ApiOperation / Swagger decorator  ❌
PrismaService                      ❌
PrismaClient                       ❌
Controller của module khác         ❌
```

### Không tạo Use Case hình thức

Không cần tạo Use Case chỉ để “đúng kiến trúc” nếu đó là read-only query cực đơn giản và không có business rule. Tuy nhiên các flow quan trọng của PetCare như booking, payment, availability, provider eligibility, cancellation, dispute, service evidence **bắt buộc** dùng Use Case.

---

## 9. Prisma Repository Pattern

Prisma chỉ được truy cập ở Infrastructure layer.

### Pattern bắt buộc

```text
Use Case
→ Repository Port (interface)
→ Symbol DI token
→ Prisma Repository implementation
→ PrismaService
```

### 9.1 Token

```ts
export const PET_REPOSITORY = Symbol('PET_REPOSITORY');
```

> TypeScript interface không tồn tại khi runtime, nên **không inject interface trực tiếp**.

### 9.2 Port

```ts
export interface PetRepositoryPort {
  create(input: CreatePetPersistenceInput): Promise<PetRecord>;
  findByIdAndOwner(id: string, ownerId: string): Promise<PetRecord | null>;
  findManyByOwner(ownerId: string): Promise<PetRecord[]>;
  updateByIdAndOwner(
    id: string,
    ownerId: string,
    input: UpdatePetPersistenceInput,
  ): Promise<PetRecord | null>;
}
```

### 9.3 Prisma implementation

```ts
@Injectable()
export class PrismaPetRepository implements PetRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByIdAndOwner(id: string, ownerId: string) {
    return this.prisma.pet.findFirst({
      where: { id, ownerId },
    });
  }
}
```

### 9.4 Module wiring

```ts
@Module({
  imports: [PrismaModule],
  controllers: [PetsController],
  providers: [
    CreatePetUseCase,
    {
      provide: PET_REPOSITORY,
      useClass: PrismaPetRepository,
    },
  ],
})
export class PetsModule {}
```

### Cấm tuyệt đối

```text
Generic BaseRepository                   ❌
Repository dùng chung cho tất cả model   ❌
Use Case gọi prisma.<model> trực tiếp    ❌
Controller gọi PrismaService             ❌
```

---

## 10. Auth module — exception hợp lệ

Auth là module đã tồn tại và đã refactor incremental.

### Flow Auth hiện tại

```text
AuthController
→ AuthService compatibility facade
→ Register / Login / Verify OTP / Google / Refresh Use Cases
→ AuthSessionService / SupabaseUserSyncService
→ RefreshTokenRepository / UsersService / SupabaseAuthService
→ Prisma / Supabase
```

### Những flow Auth đã tách Use Case

- Register
- Verify Email OTP
- Login
- Google ID Token Sign-In
- Refresh Token Rotation

### Những flow Auth được phép giữ ở facade

- Resend OTP
- Get Profile
- Logout
- LogoutAll

> Đây là **exception legacy có kiểm soát**. Không dùng Auth làm lý do để viết `PetsService`, `BookingsService`, hoặc `PaymentsService` dày chứa tất cả business logic cho module mới.

---

## 11. Module boundaries và chống circular dependency

### Quy tắc

- Mỗi feature sở hữu business rule và persistence access của chính nó.
- Không import module khác chỉ để truy cập Prisma model của module đó.
- Không tạo `forwardRef()` chỉ để “chạy được” nếu chưa hiểu nguyên nhân circular dependency.
- Nếu cần dữ liệu từ module khác, ưu tiên dùng exported application-facing service/port đã được thiết kế rõ.
- Phải báo rõ nguy cơ circular dependency trước khi code nếu task có chạm nhiều module.

### Ví dụ nguy hiểm

```text
BookingsModule → ProvidersModule
ProvidersModule → BookingsModule
```

Không tự dùng `forwardRef()` để chữa cháy. Dừng, báo cáo dependency map, rồi chốt boundary với team.

---

## 12. Database, schema và migration ownership

### Mặc định: không được đổi schema

Không sửa các mục sau nếu task không ghi rõ phê duyệt:

```text
prisma/schema.prisma
prisma/migrations/
.env
```

Không chạy:

```bash
npx prisma migrate dev
npx prisma db push
npx prisma generate
npx prisma migrate reset
npm run seed
```

### Khi task có schema change

Prompt/task phải ghi rõ:

```text
SCHEMA CHANGE APPROVED: YES
Migration owner: <tên người chịu trách nhiệm>
Approved schema decision:
- Model / field / relation / enum / index nào được thêm hoặc sửa.
- Lý do.
- Backward compatibility.
- Rollback hoặc migration risk nếu có.
```

### Nếu schema chưa đủ

AI/Developer phải:

1. Dừng trước khi code persistence.
2. Nêu model/field/relation/index còn thiếu.
3. Đề xuất thay đổi nhỏ nhất.
4. Chờ người sở hữu schema phê duyệt.
5. Không tự phát minh field và migration.

---

## 13. API, Swagger và contract protection

Trừ khi task cho phép thay đổi contract, phải giữ nguyên:

- Route path.
- HTTP method.
- Controller method signature.
- DTO class và field name.
- Validation decorators.
- Swagger decorators.
- HTTP status code.
- Response body shape.
- Error code/message behavior.
- Cookie behavior.
- JWT payload, token TTL và Guard behavior.

### Không được “tự cải tiến” API

Các thay đổi sau cần approval rõ ràng:

```text
Rename DTO field                    ❌ without approval
Change HTTP status                  ❌ without approval
Change response wrapper             ❌ without approval
Expose additional private fields    ❌ without approval
Remove an existing endpoint         ❌ without approval
```

### Swagger checklist

Sau mỗi task có endpoint:

- Module/endpoint vẫn hiển thị trong Swagger.
- Request schema có đúng field/validation.
- Response success đúng shape.
- Response error đúng status/code.
- Bearer auth/role guard vẫn hoạt động.
- HTTP-only refresh cookie cần kiểm tra bằng browser/Postman nếu Swagger UI không hiển thị được cookie.

---

## 14. Security and ownership checklist

Mỗi task tạo resource phải trả lời rõ:

1. Ai tạo resource?
2. Ai được đọc resource?
3. Ai được sửa resource?
4. Ai được xóa/archive resource?
5. User A có thể truy cập resource của User B không?
6. Role nào được override ownership rule?
7. State nào frontend không được phép tự set?

### Quy tắc chung

- User ID luôn lấy từ JWT.
- Ownership check phải server-side.
- Không expose `passwordHash`, `refreshToken`, `supabaseId`, secret, audit internals, payment secret, private address/evidence không được phép công khai.
- State transition kiểm tra ở backend, ví dụ frontend không tự đặt `BookingStatus = ACCEPTED` hoặc `PaymentStatus = PAID`.

---

## 15. Testing rules

### Unit test bắt buộc cho Use Case quan trọng

Mỗi Use Case có business rule phải test tối thiểu:

- Success path.
- Ownership/authorization failure.
- Business rule/state transition failure.
- External provider/repository failure nếu có mapping.
- Downstream dependency không được gọi sau khi validation thất bại.

### Mocking

Unit test phải mock:

- Repository port.
- Gateway/Supabase/payment provider.
- External service.

Unit test không cần chạy:

- Prisma thật.
- Supabase thật.
- Gmail thật.
- HTTP server thật.

### Không được xóa test vô lý

Chỉ được xóa test cũ nếu behavior tương đương hoặc mạnh hơn được chuyển sang Use Case test. Phải nêu rõ test thay thế trong report/PR.

### Quality gate do developer tự chạy

```bash
npm run test
npm run build
git diff --check
git status --short
```

Không dùng `--forceExit` làm tiêu chuẩn chính cho Jest, trừ khi đang chẩn đoán open handles và có giải thích cụ thể.

---

## 16. Quy trình bắt buộc sau khi pull code

Mỗi Backend Engineer phải làm theo các bước này trước khi tạo/sửa feature:

### Step 1 — Pull và kiểm tra workspace

```bash
git pull
git status --short
```

Không bắt đầu chỉnh sửa khi chưa biết branch/worktree có thay đổi gì.

### Step 2 — Đọc tài liệu

Bắt buộc đọc:

```text
AGENTS.md
README.md này
docs/architecture/README.md (nếu có)
```

### Step 3 — Antigravity onboarding audit

Không giao ngay task gen code. Trước tiên dùng prompt onboarding ở phần 17 để AI đọc cấu trúc code hiện tại.

### Step 4 — Chỉ làm feature sau khi audit trả READY

Nếu audit trả `BLOCKED_NEED_CLARIFICATION`, không để AI tự đoán. Developer phải hỏi team/chủ feature/schema owner.

### Step 5 — Làm task theo prompt có scope

Prompt task phải ghi rõ:

- Module/file được phép sửa.
- Module/file cấm sửa.
- Có được đổi API contract không.
- Có được đổi schema/migration không.
- Migration owner là ai nếu được phép.
- Existing API/business rule nào cần giữ.
- Test bắt buộc.

---

## 17. Prompt onboarding bắt buộc cho Antigravity

Copy nguyên khối sau sau khi pull code và trước khi làm task đầu tiên:

```text
You are working in the PET_CARE backend repository.

THIS IS A REPOSITORY ONBOARDING + ARCHITECTURE READ-ONLY AUDIT.

Purpose:
Read the current codebase and understand the mandatory backend architecture before any feature work.
Do not infer architecture from a default NestJS project.

READ FIRST:
1. AGENTS.md
2. README.md
3. docs/architecture/README.md if it exists
4. package.json
5. src/app.module.ts
6. src/main.ts
7. src/database/
8. prisma/schema.prisma
9. all src/common/
10. all src/modules/auth/
11. all src/modules/users/
12. all existing tests related to Auth/User
13. all other existing feature modules.

THIS TASK IS READ-ONLY:
- Do not create, edit, move, rename, format, or delete any file.
- Do not run migration, Prisma commands, seed, reset database, Docker destructive commands, or Git commands.
- Do not modify .env, Swagger, Auth, schema, or existing API contract.

MANDATORY ARCHITECTURE:
NestJS Modular Monolith
+ Feature-first folders
+ Clean Architecture at a practical/moderate level
+ Prisma Repository Pattern
+ Use Cases for important business workflows
+ DTO/Controller separated from business logic
+ Unit tests for important Use Cases

Mandatory dependency direction:
Controller → Use Case → Port/Repository/Gateway → Prisma/External Provider

Rules:
- Controllers never call PrismaService or external SDKs directly.
- Use Cases never import DTO, Request, Response, Express, Swagger decorators, or PrismaService.
- Repositories own Prisma queries.
- Use Symbol DI tokens for runtime repository injection.
- New modules do not use a thick legacy Service as their default architecture.
- Current user/owner ID comes from JWT only, never from trusted request body fields.
- Do not create schema changes without explicit approval.

RETURN A REPORT ONLY:
A. Current backend tree.
B. Current architecture pattern.
C. How Auth currently works and why AuthService is a compatibility facade exception.
D. How JWT/current-user/decorators/guards work.
E. How Prisma repositories and Symbol DI tokens work.
F. Ten rules you will follow for the next feature task.
G. Existing contracts that must not break.
H. Risks before implementing a new feature.
I. Final status exactly one of:
   READY_FOR_FEATURE_TASK
   BLOCKED_NEED_CLARIFICATION

Do not change code.
```

---

## 18. Prompt template cho task code mới

Sau onboarding audit, dùng template này. Thay nội dung trong `[ ... ]`.

```text
CONTEXT:
You have completed the PET_CARE backend onboarding audit.
You must continue following AGENTS.md and README.md.

MANDATORY ARCHITECTURE:
Controller → Use Case → Port / Repository / Gateway → Prisma / External Provider

TASK:
[Describe exactly one feature slice or one safe refactor task.]

SCOPE:
- Allowed modules/files:
  [List exact modules/files.]
- Forbidden modules/files:
  [List exact modules/files.]
- Existing APIs that must remain unchanged:
  [List endpoints/contracts.]
- API CONTRACT CHANGE APPROVED: YES / NO
- SCHEMA CHANGE APPROVED: YES / NO
- Migration owner: [Name or N/A]
- Approved schema decision: [Exact decision or N/A]

ARCHITECTURE REQUIREMENTS:
1. Read all relevant schema, module, controller, DTO, repository, use-case, test, and dependency files before coding.
2. Do not call PrismaService from Controller or Use Case.
3. Do not import DTO/HTTP/Swagger/Express in Use Cases.
4. Use feature-specific Port + Symbol token + Prisma repository when persistence is needed.
5. Current user ID must come from JWT; never trust ownerId/userId/role/status/price from request body.
6. Add or update unit tests for every important Use Case.
7. Preserve Swagger, DTO, status code, response shape, error contract, cookie/JWT behavior unless explicitly approved.
8. Do not modify unrelated modules.
9. Do not create migrations, run Prisma commands, reset/seed database, edit .env, commit Git, or run destructive commands unless explicitly authorized.
10. If the real code conflicts with this prompt, stop and report the exact conflict instead of guessing.

BEFORE CODING, REPORT:
A. Files read.
B. Current behavior and contract to preserve.
C. Files planned to create/modify.
D. Schema/API/security risks.
E. Proposed dependency flow.

AFTER CODING, REPORT:
A. Files created.
B. Files modified.
C. Final dependency flow.
D. Business rules implemented.
E. API contract preserved.
F. Tests added/updated and what each proves.
G. Commands I will run manually:
   npm run test
   npm run build
   git diff --check
   git status --short
H. Swagger/manual regression checklist.
I. Remaining risks or intentionally deferred work.
```

---

## 19. Prompt examples

### 19.1 Pet Profile example

```text
TASK:
Implement Pet Profile Phase 2C: create, list my pets, get my pet detail, update my pet, and delete/archive my pet.

SCOPE:
- Allowed modules/files:
  - src/modules/pets/**
  - test files directly related to pets
  - src/app.module.ts only to import PetsModule if required
- Forbidden modules/files:
  - src/modules/auth/**
  - src/modules/users/**
  - prisma/schema.prisma
  - prisma/migrations/**
  - src/main.ts
- API CONTRACT CHANGE APPROVED: YES
- SCHEMA CHANGE APPROVED: NO
- Migration owner: N/A

Security rules:
- All endpoints require authenticated user.
- ownerId comes only from JWT.
- A user cannot read, update, or delete another user's pet.
- Do not accept ownerId from request body.
```

### 19.2 Booking example

```text
TASK:
Implement Booking Phase 1: create a booking request using an approved existing schema.

SCOPE:
- Allowed modules/files:
  - src/modules/bookings/**
  - tests directly related to bookings
- Forbidden modules/files:
  - src/modules/auth/**
  - src/modules/payments/**
  - prisma/schema.prisma
  - prisma/migrations/**
- API CONTRACT CHANGE APPROVED: YES
- SCHEMA CHANGE APPROVED: NO
- Migration owner: N/A

Business rules:
- customerId comes from JWT.
- Frontend cannot set booking status or payment status.
- Provider availability must be checked server-side.
- Booking creation must not access another customer's pet.
- If a required schema field/relation/index is missing, stop and report it; do not invent it.
```

---

## 20. Pull request / code review checklist

Người tạo PR và reviewer phải kiểm tra:

### Architecture

- [ ] Module theo feature-first.
- [ ] Controller không gọi Prisma/external SDK trực tiếp.
- [ ] Use Case không import DTO/HTTP/Swagger/PrismaService.
- [ ] Repository port dùng Symbol DI token nếu persistence phức tạp.
- [ ] Prisma access chỉ ở Infrastructure repository.
- [ ] Không tạo Generic BaseRepository/BaseUseCase không cần thiết.
- [ ] Không tạo circular dependency hoặc `forwardRef()` chữa cháy không giải thích.

### Security

- [ ] User/owner ID lấy từ JWT.
- [ ] Ownership được kiểm tra server-side.
- [ ] Frontend không kiểm soát role/status/payment/price nhạy cảm.
- [ ] Không leak secret/password hash/refresh token/Supabase ID.

### Contract

- [ ] Swagger route/DTO/status/response hiện có không bị vỡ.
- [ ] Không sửa API contract ngoài scope.
- [ ] Không sửa schema/migration nếu chưa được phép.

### Tests

- [ ] Important Use Case có unit test.
- [ ] Có success path và business/ownership failure path.
- [ ] Test cũ không bị xóa mà không có test thay thế tương đương.
- [ ] `npm run test` pass.
- [ ] `npm run build` pass.
- [ ] `git diff --check` pass.

---

## 21. Khi phải dừng và hỏi team

Dừng lại, không tự đoán, khi gặp một trong các trường hợp:

1. Cần model, field, enum, relation, index hoặc migration chưa được phê duyệt.
2. Không rõ ownership của resource.
3. Có thể làm vỡ Swagger/API/Frontend contract.
4. Cần sửa Auth, Users, hoặc module do người khác sở hữu ngoài scope.
5. Phát hiện circular dependency.
6. Business rule có nhiều cách hiểu hoặc xung đột với tài liệu hiện có.
7. Cần tạo transaction giữa nhiều module mà ownership transaction chưa được chốt.

Báo cáo theo format:

```text
BLOCKED — NEED DECISION

1. Exact conflict:
   [file + method/model + current behavior]

2. Why implementation cannot safely continue:
   [technical/business reason]

3. Smallest safe options:
   Option A: ...
   Option B: ...

4. Decision needed from:
   [feature owner / database owner / PM / architect]
```

---

## 22. Definition of Done cho một feature task

Một task chỉ được xem là hoàn thành khi:

1. Đúng scope được phê duyệt.
2. Kiến trúc đúng dependency direction.
3. Không đổi schema/API nếu chưa được phép.
4. Ownership/security rule được enforce server-side.
5. Use Case quan trọng có unit test.
6. Existing tests vẫn pass.
7. Build pass.
8. Swagger/manual regression được test nếu có endpoint.
9. Diff không chứa thay đổi ngoài phạm vi.
10. Báo cáo file sửa, test, contract và rủi ro được gửi cùng task/PR.

---

## 23. Tóm tắt nhanh cho developer

Trước khi code, hãy tự hỏi:

```text
1. Feature này thuộc module nào?
2. Controller có đang làm nhiều hơn HTTP handling không?
3. Business rule đã nằm trong Use Case chưa?
4. Prisma query có nằm trong Repository chưa?
5. User ID/owner ID có lấy từ JWT không?
6. Có cần schema approval không?
7. Swagger/API cũ có bị đổi không?
8. Use Case có unit test không?
9. Tôi có đang sửa file ngoài scope không?
10. Nếu code hiện tại mâu thuẫn yêu cầu, tôi đã dừng để hỏi chưa?
```

Nếu bất kỳ câu nào chưa rõ, **không tự đoán — báo team trước khi code**.

---

## 24. Maintainer note

Tài liệu này là source of truth về cách tổ chức code backend PET_CARE. Khi kiến trúc thay đổi có chủ đích, cập nhật README này và `AGENTS.md` trong cùng PR/commit với thay đổi kiến trúc đó.
