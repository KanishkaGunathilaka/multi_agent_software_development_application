# Architecture Design

## 1️⃣ Component / Module Breakdown  

| Module (Java package) | Primary files / classes | Responsibility |
|-----------------------|------------------------|----------------|
| **`com.example.todo.api`** | `TodoController` | REST entry‑point; request validation, pagination handling, delegates to service. |
| **`com.example.todo.service`** | `TodoService`, `TodoServiceImpl` | Business rules (create → set defaults, optimistic‑lock update, filter by user, etc.). |
| **`com.example.todo.repository`** | `TodoRepository` (extends `JpaRepository<Todo, UUID>`), `TodoSpecification` | DB access; dynamic JPA‑Specification for filter criteria. |
| **`com.example.todo.domain`** | `Todo` (JPA entity), `TodoStatus` (enum), `User` (if “users” table is internal) | Persistence model, includes `@Version` for optimistic locking and `@ManyToOne` → `User`. |
| **`com.example.todo.dto`** | `TodoCreateDto`, `TodoUpdateDto`, `TodoResponseDto`, `PagedResponseDto<T>`, `ErrorResponseDto` | **DTOs** that travel over the wire.  All validation annotations live here (`@NotBlank`, `@Size`, `@FutureOrPresent`, …). |
| **`com.example.todo.mapper`** | `TodoMapper` (MapStruct interface) | Convert between entity ↔ DTO. |
| **`com.example.todo.exception`** | `TodoNotFoundException`, `TodoConflictException`, `GlobalExceptionHandler` (uses `@ControllerAdvice`) | Centralised error handling; produces RFC‑7807 “Problem Details”. |
| **`com.example.todo.security`** | `JwtAuthenticationFilter`, `JwtTokenProvider`, `SecurityConfig` | JWT validation, extraction of `userId` claim, populates `Authentication`. |
| **`com.example.todo.config`** | `SwaggerConfig`, `FlywayConfig`, `AppProperties` | External‑config binding, OpenAPI customisation, DB migration. |
| **`com.example.todo.util`** | `PageRequestBuilder` (helper to build `Pageable` from query params) | Re‑use pagination logic. |
| **`Docker`** | `Dockerfile` (multi‑stage), `docker-compose.yml` | Containerised app + PostgreSQL. |
| **`test`** | `TodoServiceTest`, `TodoControllerIT`, `SecurityIntegrationTest`, `DockerComposeIT` (Testcontainers) | Unit & integration test suites; CI hooks. |

> **Note** – The design is language‑agnostic for the *contract* layer – TypeScript interfaces are supplied in §2 so front‑end teams can generate clients even though the server is Java‑based.

---

## 2️⃣ Data Models (TypeScript‑idiomatic)

```ts
// --------------------------------------------------
// Enums
// --------------------------------------------------
export enum TodoStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

// --------------------------------------------------
// Core entity (DTO that mirrors the DB row)
// --------------------------------------------------
export interface Todo {
  id: string;                // UUID v4
  userId: string;            // foreign key to Users
  title: string;             // max 255
  description?: string;
  dueDate?: string;           // ISO‑8601 date‑time
  status: TodoStatus;
  createdAt: string;         // ISO‑8601
  updatedAt: string;         // ISO‑8601
  version: number;           // optimistic‑lock column
}

// --------------------------------------------------
// DTOs used on the wire
// --------------------------------------------------
export interface TodoCreateDto {
  title: string;                     // required, 1‑255 chars
  description?: string;
  dueDate?: string;                 // optional ISO‑8601, must be future or present
  status?: TodoStatus;              // defaults to PENDING if omitted
}

export interface TodoUpdateDto {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: TodoStatus;
}

export interface TodoResponseDto extends Todo {}

// --------------------------------------------------
// Pagination envelope
// --------------------------------------------------
export interface PagedResponseDto<T> {
  content: T[];
  pageNumber: number;          // 0‑based
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// --------------------------------------------------
// Problem Details (RFC‑7807)
// --------------------------------------------------
export interface ErrorResponseDto {
  type: string;                // URI identifying the error type
  title: string;               // short summary
  status: number;              // HTTP status code
  detail?: string;             // human readable
  instance?: string;           // request path
  timestamp?: string;          // ISO‑8601
}
```

*All DTOs will be generated as Java classes using Lombok + Bean Validation annotations (mirroring the TS definitions).*

---

## 3️⃣ API Design  

| # | Method | Path | Query / Path | Request Body | Success Response | Error Responses |
|---|--------|------|--------------|--------------|------------------|----------------|
| 1 | **POST** | `/api/todos` | – | `TodoCreateDto` (JSON) | **201** `TodoResponseDto` (with generated `id`) | **400** `ErrorResponseDto` (validation) |
| 2 | **GET** | `/api/todos` | `status?` `dueBefore?` `page?` `size?` | – | **200** `PagedResponseDto<TodoResponseDto>` (ordered `createdAt` desc) | **400** `ErrorResponseDto` (invalid params) |
| 3 | **GET** | `/api/todos/{id}` | `id` (UUID) | – | **200** `TodoResponseDto` | **404** `ErrorResponseDto` |
| 4 | **PUT** | `/api/todos/{id}` | `id` (UUID) | `TodoUpdateDto` (any subset) | **200** `TodoResponseDto` | **400**, **404**, **409** (`optimistic‑lock`) |
| 5 | **DELETE** | `/api/todos/{id}` | `id` (UUID) | – | **204** *no body* | **404** |
| 6 | **GET** | `/v3/api-docs` | – | – | **200** OpenAPI JSON | – |
| 7 | **GET** | `/swagger-ui.html` | – | – | **200** UI | – |

*All endpoints are secured (see §9) – a valid `Authorization: Bearer <jwt>` header is required.  The JWT must contain a `sub` (or `userId`) claim that is injected into the request’s `Principal`.*

---

## 4️⃣ Key Algorithms / Flows  

### 4.1 Create Todo Flow
1. **Controller** receives `TodoCreateDto`, Spring Validation (`@Valid`) runs.  
2. Extract `userId` from `Authentication` (`SecurityContextHolder`).  
3. **Service** builds a `Todo` entity:  
   - `title` from DTO (trimmed).  
   - `status` = DTO.status ?? `PENDING`.  
   - `dueDate` parsed to `OffsetDateTime` (must be future/present).  
   - `userId` set, timestamps = `now()`.  
4. Persist via `TodoRepository.save`. JPA returns generated UUID and `version = 0`.  
5. **Mapper** → `TodoResponseDto`; controller returns 201 + `Location: /api/todos/{id}`.

### 4.2 List Todos with Filtering & Pagination
1. Parse optional query params: `status`, `dueBefore`, `page`, `size`.  
2. Build a **Specification\<Todo\>**:  
   - `userId = currentUserId` (mandatory).  
   - add `status` predicate if provided.  
   - add `dueDate < dueBefore` predicate if provided.  
3. Build `Pageable` via `PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))`.  
4. Call `todoRepository.findAll(spec, pageable)`.  
5. Map `Page<Todo>` → `PagedResponseDto<TodoResponseDto>`.

### 4.3 Update Todo (optimistic locking)
1. Controller receives `TodoUpdateDto`.  
2. Service loads existing entity **with lock** (`findByIdAndUserId` + `@Version` field).  
3. Apply non‑null fields from DTO onto the entity.  
4. Persist (`save`). If `OptimisticLockException` is thrown → map to **409 Conflict** (`TodoConflictException`).  
5. Return mapped `TodoResponseDto`.

### 4.4 Delete Todo
1. Service calls `todoRepository.deleteByIdAndUserId(id, userId)`.  
2. If `0` rows affected → throw `TodoNotFoundException`.  
3. Return **204**.

### 4.5 JWT Authentication Filter (Spring Security)
1. `Authorization` header extracted.  
2. Strip **Bearer** prefix → raw token.  
3. `JwtTokenProvider.validateToken(token)`.  
   - Verify signature (HS256 / RS256 based on config).  
   - Check expiry, issuer, audience.  
4. Extract `userId` claim, build `UsernamePasswordAuthenticationToken` with `ROLE_USER`.  
5. Set `SecurityContextHolder.getContext().setAuthentication(auth)`.  
6. Continue filter chain; if any step fails → `AuthenticationEntryPoint` returns **401** (no token) or **403** (invalid/expired).

---

## 5️⃣ Technology Choices & Justifications  

| Concern | Choice | Why |
|---------|---------|-----|
| **Framework** | Spring Boot 3.x (Java 17+) | Mature, auto‑configuration, fast start‑up, excellent DB & security ecosystems. |
| **ORM** | Spring Data JPA + Hibernate | Declarative repositories, paging, specifications, `@Version` for O/L. |
| **DB** | PostgreSQL 15 (docker) | Robust, native UUID support, rich indexing, widely used in production. |
| **Migrations** | Flyway (SQL scripts) | Source‑controlled, repeatable, works with Testcontainers & CI. |
| **DTO Mapping** | MapStruct (annotation‑processor) | Zero‑runtime cost, compile‑time type‑safe mapping between entity ↔ DTO. |
| **Validation** | Bean Validation (Jakarta Validation) + Hibernate Validator | Declarative, integrates with Spring MVC (`@Valid`). |
| **API Docs** | springdoc‑openapi‑ui (v2) | Generates OpenAPI 3 from Spring MVC; UI at `/swagger-ui.html`. |
| **Testing** | JUnit 5, AssertJ, Mockito for unit; Testcontainers + @SpringBootTest for integration; JaCoCo for coverage | Fast, isolated DB per test, coverage enforced. |
| **Security** | Spring Security + JWT (io.jsonwebtoken / java‑jwt) | Stateless, easy to mock in tests, fits “API‑only” scenario. |
| **Containerisation** | Multi‑stage Dockerfile (builder + runtime using `openjdk:17-jdk-slim`) | Small final image, reproducible builds. |
| **Orchestration** | docker‑compose (app + db) | One‑command dev environment, also used by CI to spin DB. |
| **Project Build** | Maven (or Gradle) – whichever team prefers | Established tooling, supports all plugins above. |
| **Code Quality** | SpotBugs, Checkstyle, Lombok‑config, SonarQube integration | Enforce static analysis, reduce boilerplate. |

---

## 6️⃣ Risks & Trade‑offs  

| Area | Risk / Trade‑off | Mitigation |
|------|------------------|-------------|
| **Authentication model** | Stories 9 & 10 are marked *low* and ambiguous. If JWT provider changes (OAuth2, Keycloak, custom), token parsing and `userId` extraction will need adjustments. | Abstract token validation behind `JwtTokenProvider` interface; write integration tests against a mock provider; keep `userId` claim name configurable. |
| **User persistence** | If external IdP is used, the `users` table may be unnecessary → foreign‑key constraint might break. | Make `User` entity optional (`@ManyToOne(optional = true)`) and keep `userId` as a plain `String`. Add migration script that creates the table only when internal auth is selected. |
| **Optimistic locking conflicts** | High concurrency updates could cause frequent `409` responses. | Return the current version in the response body; client can reload and retry. Consider increasing `@Version` column to `Long` to avoid overflow. |
| **Pagination defaults** | No explicit limit → large page size could OOM test containers. | Enforce a maximum `size` (e.g., 200) in `PageRequestBuilder`; throw `400` if exceeded. |
| **Error payload consistency** | Multiple exception handlers could diverge from RFC‑7807 spec. | Centralise all error responses in `GlobalExceptionHandler` and unit‑test it. |
| **Docker compose DB init** | Relying on JPA `ddl-auto=none` + Flyway; race condition on first start. | Add `depends_on` with `condition: service_healthy` (healthcheck `pg_isready`) and ensure Flyway runs on app startup (`flyway.migrate`). |
| **Testcontainers performance** | Starting a PostgreSQL container for every test class can be slow. | Use a static shared container (`@Testcontainers @Container static PostgreSQLContainer<?> db = …;`) and reuse across tests. |
| **Schema evolution** | Adding new columns (e.g., `priority`) later will require migration and DTO updates. | Version the API (`/api/v1/...`) and keep backward‑compatible migrations (add nullable columns). |
| **OpenAPI drift** | Manual annotations may get out of sync with code. | Use `springdoc-openapi` to generate docs directly; add a CI step that validates the generated JSON against a JSON‑Schema (provided by OpenAPI). |
| **Coverage threshold enforcement** | 80 % branch coverage may be unrealistic for simple getters/setters. | Exclude Lombok‑generated code and simple DTOs from coverage metrics; focus on business logic. |

---

## 7️⃣ Quick Reference Summary (for developers)

```text
src/
 ├─ main/
 │   ├─ java/com/example/todo/
 │   │   ├─ api/                → TodoController
 │   │   ├─ service/            → TodoService, TodoServiceImpl
 │   │   ├─ repository/         → TodoRepository, TodoSpecification
 │   │   ├─ domain/             → Todo, TodoStatus, User
 │   │   ├─ dto/                → *.Dto
 │   │   ├─ mapper/             → TodoMapper
 │   │   ├─ exception/          → *Exception, GlobalExceptionHandler
 │   │   ├─ security/           → JwtAuthenticationFilter, JwtTokenProvider, SecurityConfig
 │   │   └─ config/             → SwaggerConfig, FlywayConfig, AppProperties
 │   └─ resources/
 │       ├─ db/migration/      → V1__init.sql, V2__add_user_fk.sql …
 │       └─ application.yml    → datasource, jwt secret, etc.
 └─ test/
     ├─ java/com/example/todo/
     │   ├─ service/… (unit)
     │   ├─ api/… (integration with Testcontainers)
     │   └─ security/… (mock JWT)
Dockerfile
docker‑compose.yml
README.md
```

The above design satisfies **all high‑priority stories (1‑5, 8)**, provides **automatic OpenAPI docs (6)**, **containerised dev stack (7)**, **comprehensive test strategy (8)**, and **a pluggable security foundation (9‑10)** ready to be refined once the pending ambiguities are clarified.