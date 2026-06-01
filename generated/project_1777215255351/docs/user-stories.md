# User Stories

**User Stories**

| # | User Story | Acceptance Criteria | Definition of Done | Priority |
|---|------------|----------------------|--------------------|----------|
| 1 | **As a client application, I want to create a new to‑do item, so that users can add tasks to their list.** | • POST `/api/todos` accepts a JSON payload with required fields `title` (string, max 255 chars) and optional fields `description`, `dueDate`, `status` (default **PENDING**).<br>• Returns **201 Created** with the created item including a generated `id`.<br>• Validation errors return **400 Bad Request** with meaningful messages.<br>• The item is persisted in PostgreSQL. | • Spring Boot controller, service, and repository implemented.<br>• Entity mapped to a `todos` table (auto‑generated schema).<br>• Unit tests for service layer and integration test for the endpoint (in‑memory PostgreSQL or Testcontainers).<br>• API documented with OpenAPI/Swagger.<br>• Code passes static analysis and all tests. | High |
| 2 | **As a client application, I want to retrieve all to‑do items, so that users can view their task list.** | • GET `/api/todos` returns **200 OK** with a JSON array of to‑do items.<br>• Supports optional query parameters `status`, `dueBefore`, `page`, `size` for filtering and pagination (if provided).<br>• Empty list returns an empty array, not an error.<br>• Results are ordered by `createdAt` descending. | • Pagination logic implemented (Spring Data `Pageable`).<br>• Repository query supports filter criteria.<br>• Integration test covering default list and filtered list.<br>• Swagger doc includes query parameters.<br>• All tests pass and code is reviewed. | High |
| 3 | **As a client application, I want to retrieve a single to‑do item by its ID, so that users can view details of a specific task.** | • GET `/api/todos/{id}` returns **200 OK** with the item JSON when the ID exists.<br>• Returns **404 Not Found** when no item matches the ID.<br>• The response includes all fields (`id`, `title`, `description`, `dueDate`, `status`, timestamps). | • Controller method handling path variable.<br>• Service throws a custom `TodoNotFoundException` mapped to 404.<br>• Unit test for successful retrieval and test for 404 case.<br>• Documentation updated. | High |
| 4 | **As a client application, I want to update an existing to‑do item, so that users can modify task details.** | • PUT `/api/todos/{id}` accepts a JSON payload with any updatable fields (`title`, `description`, `dueDate`, `status`).<br>• Returns **200 OK** with the updated item.<br>• If the ID does not exist, returns **404 Not Found**.<br>• Validation errors return **400 Bad Request**. | • Partial update logic (full replace) implemented in service.<br>• Concurrency handled with optimistic locking (`@Version` column).<br>• Tests for successful update, validation failure, and 404 case.<br>• Swagger reflects request/response schema. | Medium |
| 5 | **As a client application, I want to delete a to‑do item, so that users can remove tasks they no longer need.** | • DELETE `/api/todos/{id}` returns **204 No Content** on successful deletion.<br>• Returns **404 Not Found** when the ID does not exist.<br>• The item is permanently removed from PostgreSQL. | • Repository `deleteById` call wrapped in service with proper exception handling.<br>• Integration test verifying the record is removed.<br>• Documentation updated. | Medium |
| 6 | **As a developer, I want the API to be documented automatically, so that consumers can discover how to use it.** | • OpenAPI (Swagger) JSON/YAML is generated and accessible at `/v3/api-docs` and UI at `/swagger-ui.html`.<br>• All endpoints, parameters, request/response models, and error codes are described. | • `springdoc-openapi` (or similar) dependency added and configured.<br>• Documentation validated against the actual implementation (no missing fields).<br>• Documentation is part of the CI build verification. | Medium |
| 7 | **As a DevOps engineer, I want the application to run with PostgreSQL in Docker, so that developers can start the full stack quickly.** | • `docker-compose.yml` defines two services: `app` (Spring Boot) and `db` (PostgreSQL 15).<br>• The application reads DB connection properties from environment variables.<br>• `docker compose up` starts the stack with no manual DB migrations required. | • Dockerfile for the Spring Boot jar (multi‑stage build).<br>• `docker-compose.yml` committed.<br>• Integration test suite runs against the Docker PostgreSQL container (via Testcontainers) in CI.<br>• README contains clear startup instructions. | Medium |
| 8 | **As a QA engineer, I want automated tests covering the API, so that regressions are caught early.** | • Unit tests for service layer (≥ 80 % branch coverage).<br>• Integration tests for all controller endpoints against a real PostgreSQL instance (Testcontainers).<br>• Tests verify success paths, validation errors, and 404 cases. | • Maven/Gradle `verify` phase fails if any test fails.<br>• Test reports are generated and published in CI.<br>• Code coverage report meets the defined threshold. | High |
| 9 | **As a security stakeholder, I want the API to reject unauthenticated requests, so that only authorized users can manipulate to‑do data.** | • All `/api/todos/**` endpoints require a valid JWT Bearer token.<br>• Requests without token return **401 Unauthorized**.<br>• Invalid or expired token returns **403 Forbidden**. | • Spring Security configured with JWT filter (placeholder implementation if auth provider not defined).<br>• Security tests verifying protected endpoints.<br>• Documentation notes the security requirement. | **Low (pending clarification)** |
| 10 | **As a product owner, I want multi‑user support, so that each user sees only their own to‑do items.** | • `Todo` entity includes a `userId` field (foreign key to a Users table).<br>• All list, get, update, delete operations are scoped to the authenticated user's `userId`.<br>• Endpoints return only items belonging to the caller. | • Users table/model created (or mocked if external auth).<br>• Service methods filter by `userId`.<br>• Tests covering data isolation between users.<br>• API versioning if needed. | **Low (pending clarification)** |

---

**Flagged Ambiguities / Missing Requirements**

1. **Authentication & Authorization**  
   *The raw requirement does not specify whether the API should be public, protected by API keys, JWT, OAuth2, or similar.*  
   → Clarify required security model and whether user accounts are needed.

2. **User Management**  
   *If authentication is required, does the system need its own user registration/password management, or will it rely on an external identity provider?*  
   → Define user model, registration flow, password policies, and how `userId` is linked to to‑do items.

3. **To‑Do Item Fields**  
   *Only “to‑do list” is mentioned. What attributes are required?*  
   - `title` (mandatory?)  
   - `description` (optional)  
   - `dueDate` / `reminder` (optional)  
   - `status` (e.g., PENDING, COMPLETED)  
   - `priority` (low/medium/high)  
   → Confirm the exact schema.

4. **Filtering & Search**  
   *Do we need search by text, filtering by status, priority, due date range, etc.?*  
   → Prioritize required query parameters.

5. **Pagination & Sorting**  
   *Is pagination mandatory for list endpoints?*  
   → Specify default page size, max size, sorting options.

6. **Error Handling Standards**  
   *What format should error responses follow (e.g., RFC 7807 Problem Details)?*  
   → Confirm error payload structure.

7. **Deployment & Environment**  
   *Any specific cloud platform, CI/CD pipeline, or environment variables expected?*  
   → Detail deployment pipeline requirements.

8. **Testing Scope**  
   *Do we need contract tests (e.g., Pact), performance tests, or security penetration tests?*  
   → Clarify testing expectations beyond unit/integration.

9. **Documentation**  
   *Is only Swagger/OpenAPI needed, or also Markdown API guide, versioning policy, changelog?*  
   → Define documentation deliverables.

10. **Database Migration Strategy**  
    *Will we use Flyway, Liquibase, or rely on JPA auto‑DDL?*  
    → Choose migration tool and versioning approach.

Addressing these points will allow the team to flesh out the backlog with precise, testable stories and avoid rework later.