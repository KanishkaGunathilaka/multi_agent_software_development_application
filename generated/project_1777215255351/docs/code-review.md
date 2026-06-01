# Code Review Report

**Code Review – Todo‑App (Spring Boot, Java 17)**  
*Prepared by: Senior Engineer – 2026‑04‑26*  

---

## Summary
Overall the project is well‑structured and follows modern Spring Boot conventions. The layered architecture (controller → service → repository), use of MapStruct, Flyway migrations, OpenAPI, Docker, and Testcontainers are all solid foundations. Most user‑story requirements are satisfied, and the code is cleanly organized with Lombok and validation annotations. A few gaps remain around input‑validation error handling, pagination limits, JWT secret handling, and minor consistency/robustness issues that could affect security, maintainability, and test coverage.

---

## Issues

| # | Severity | Location | Description | Recommended Fix |
|---|----------|----------|-------------|----------------|
| 1 | **Major** | `src/main/java/com/example/todo/dto/ErrorResponseDto.java` & `GlobalExceptionHandler` | The RFC‑7807 `ErrorResponseDto` fields `type`, `instance` are never populated, and the generic `detail` often contains the raw exception message (e.g., stack‑trace fragments). This leaks internal details and breaks the spec. | Populate `type` with a URI identifying the error (e.g., `"https://example.com/errors/validation"`), set `instance` to `request.getRequestURI()`, and extract user‑friendly messages from `BindingResult`. Example: <br>`String detail = ((MethodArgumentNotValidException) ex).getBindingResult().getAllErrors().stream().map(ObjectError::getDefaultMessage).collect(Collectors.joining("; "));` |
| 2 | **Major** | `src/main/java/com/example/todo/service/TodoServiceImpl.java` – `currentUserId()` | Throws `IllegalStateException` when no authentication is present. This bubbles up as a 500 Internal Server Error, whereas the contract expects **401 Unauthorized**. | Replace with a custom `UnauthenticatedException` mapped to 401, or simply let Spring Security’s entry point handle missing auth by returning `null` and letting the filter reject the request. |
| 3 | **Major** | `src/main/java/com/example/todo/security/JwtTokenProvider.java` | Secret key is taken directly from the string property. For HS256 the key must be at least 256 bits; the default `"defaultSecretKey"` (≈ 128 bits) will cause `InvalidKeyException` at runtime. | Enforce a minimum length (e.g., 32‑byte Base64) and document it. Consider generating a secret with `java -classpath ...` or using `JwtTokenProvider` to decode a Base64‑encoded secret: `Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey))`. |
| 4 | **Major** | `src/main/java/com/example/todo/security/SecurityConfig.java` | The `authenticationEntryPoint` returns **401** for any failure, but the spec (user story 9) expects **403 Forbidden** for *invalid* or *expired* tokens. | Create a `JwtAuthenticationEntryPoint` that distinguishes between missing (`401`) and invalid/expired (`403`) credentials, or configure `ExceptionTranslationFilter` with a custom `AccessDeniedHandler`. |
| 5 | **Major** | `src/main/java/com/example/todo/api/TodoController.java` – `createTodo` | Location header built with a manual string (`/api/todos/{id}`) which may be wrong when the app is behind a reverse proxy or runs on a non‑root context. | Use Spring’s `ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.getId()).toUri()` to generate an absolute URI. |
| 6 | **Major** | `src/main/java/com/example/todo/api/TodoController.java` – pagination parameters | The `Pageable` object exposed directly allows any page size, potentially leading to DoS (large `size` values). The helper `PageRequestBuilder` is never used. | Replace the `Pageable` argument with the builder: <br>`Pageable pageable = PageRequestBuilder.build(Optional.of(page), Optional.of(size), Sort.by(...));` <br>or configure Spring Boot property `spring.data.web.pageable.max-page-size=200`. |
| 7 | **Major** | `src/main/java/com/example/todo/repository/TodoSpecification.java` – `dueBefore` | Uses `<` which excludes items whose `dueDate` equals the provided timestamp. The user story says “due before”, but a typical filter might be inclusive. | Clarify requirement; if inclusive, change to `cb.lessThanOrEqualTo`. Also guard against `null` `dueDate` (e.g., `cb.isNotNull(root.get("dueDate"))`). |
| 8 | **Major** | `src/main/java/com/example/todo/service/TodoServiceImpl.java` – optimistic lock handling | Catches `OptimisticLockException` but re‑throws a custom `TodoConflictException` *without* preserving the original exception cause, losing stack‑trace. | `throw new TodoConflictException("Concurrent modification …", ex);` and add a constructor that accepts `Throwable`. |
| 9 | **Minor** | `src/main/java/com/example/todo/domain/Todo.java` – `userId` type | Stored as `String` (VARCHAR(36)). Since the application already uses `UUID` for the primary key, using `UUID` would give stronger type safety and avoid accidental non‑UUID strings. | Change field to `private UUID userId;` and adjust mapping (`@Column(columnDefinition = "uuid")`). Update `TodoMapper` and `JwtAuthenticationFilter` to convert `String` → `UUID`. |
|10| **Minor** | `src/main/java/com/example/todo/mapper/TodoMapper.java` – unmapped target policy | `ReportingPolicy.IGNORE` hides accidental unmapped fields (e.g., future added fields). | Switch to `ReportingPolicy.WARN` during CI to surface missing mappings, or add explicit `@Mapping(target = "newField", ignore = true)` with a comment. |
|11| **Minor** | `Dockerfile` – `ARG JAR_FILE` usage | The ARG is defined but never passed during `docker build`, which could break if the JAR name changes. | Either remove the ARG and hard‑code the path, or expose a build‑arg in the CI pipeline: `--build-arg JAR_FILE=target/todo-app-0.0.1-SNAPSHOT.jar`. |
|12| **Minor** | `application.yml` – `hibernate.ddl-auto=validate` | If a developer runs the app with a fresh DB and Flyway hasn't yet executed (e.g., when `spring.flyway.enabled=false`), the startup will fail with schema validation errors. | Keep `validate`, but ensure Flyway runs **before** JPA initialization (default works). Document this order in the README. |
|13| **Suggestion** | `src/main/java/com/example/todo/util/PageRequestBuilder.java` | Utility class is not used anywhere. | Either integrate it (as per Issue 6) or remove it to avoid dead code. |
|14| **Suggestion** | `src/main/java/com/example/todo/security/JwtAuthenticationFilter.java` – logging | Uses `logger.debug` but the class also has Lombok `@Slf4j`. The variable `log` is the correct logger; `logger` will not compile. | Replace `logger.debug` with `log.debug`. |
|15| **Suggestion** | `pom.xml` – Lombok declared as `optional` | Maven will not include Lombok at compile time for downstream modules; while optional is fine for a single‑module app, it can cause IDE warnings. | Remove `<optional>true</optional>` or set `<provided>` scope if you want it only at compile time. |
|16| **Suggestion** | Tests are not included in the snippet | The backlog requires ≥80 % branch coverage and Testcontainers integration, but no test classes are shown. | Add unit tests for `TodoServiceImpl` (Mockito) and integration tests (`@SpringBootTest` with `@Testcontainers`). Ensure JaCoCo thresholds are configured in the Maven plugin. |
|17| **Suggestion** | Documentation – README missing | The user story 7 expects clear startup instructions, but no README is present. | Add a `README.md` with Docker Compose commands, JWT generation example, and API endpoint overview. |
|18| **Suggestion** | Swagger UI URL `swagger-ui.html` is deprecated in newer springdoc versions (now `/swagger-ui/index.html`). | Update `SecurityConfig` `permitAll` matcher to include the new path or configure `springdoc.swagger-ui.path`. | Add `"/swagger-ui/**"` and `"/swagger-ui/index.html"` to permitted URLs. |

---

## Security & Safety

| Issue | Impact | Mitigation |
|-------|--------|------------|
| **Weak default JWT secret** (`defaultSecretKey`) – may be less than 256 bits, leading to runtime failure or weak signing. | Authentication bypass if secret is guessed; runtime crashes. | Enforce a minimum-length secret; fail fast if property length < 32 bytes, document generation (`openssl rand -base64 32`). |
| **Leak of internal exception messages** in `ErrorResponseDto`. | Could expose implementation details to attackers. | Return sanitized error messages; log the full stack trace internally. |
| **Missing max page size** – unbounded `size` parameter can cause memory exhaustion. | DoS via large result sets. | Enforce `max-page-size` (e.g., 200) via Spring property or custom validator. |
| **Potential for unauthenticated access**: `currentUserId()` throws `IllegalStateException` leading to 500 instead of 401. | Confusing error for clients; may hide authentication failures. | Replace with proper 401 handling. |
| **No CSRF protection** – disabled globally, which is acceptable for stateless APIs but should be documented. | If the API ever serves browsers with cookies, CSRF becomes a risk. | Keep CSRF disabled for JWT‑based stateless API; note in security docs. |
| **Lack of role‑based checks** – all authenticated users have `ROLE_USER` and can access any resource, but multi‑user isolation is enforced only by `userId` filter. | If future roles are added, missing checks could grant excessive rights. | Plan for method‑level security (`@PreAuthorize`) once role model expands. |

---

## Positive Highlights

* **Clear layered architecture** (controller → service → repository) with transaction boundaries.
* **MapStruct usage** eliminates boilerplate mapping code and is well‑configured (`componentModel = "spring"`).
* **Flyway migration** (`V1__create_todos_table.sql`) ensures reproducible DB schema.
* **OpenAPI/Swagger** auto‑generated via `springdoc-openapi`; the UI is exposed correctly.
* **Docker Compose** provides a ready‑to‑run stack, and the Dockerfile uses a multi‑stage build for small runtime image.
* **Optimistic locking** (`@Version`) protects concurrent updates.
* **RFC‑7807 compliant error DTO** (good intent, just needs full population).
* **Testcontainers dependencies** are present, showing intention to run integration tests against a real PostgreSQL container.
* **Lombok** reduces boilerplate while keeping immutable builders.
* **Validation annotations** (`@NotBlank`, `@Size`, `@FutureOrPresent`) enforce request constraints.

---

## Verdict
**⚠️ Approved with minor comments**

The codebase meets the primary functional requirements and follows solid engineering practices. Address the *major* items (error response handling, JWT secret/key length, pagination limits, proper 401/403 handling, and location header generation) before merging to production. Minor and suggestion items should be resolved to improve maintainability, security, and developer experience. Once these changes and the missing test suite are in place, the project will be ready for release.