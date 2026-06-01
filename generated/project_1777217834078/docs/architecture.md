# Architecture Design

# Technical Design – Authentication Service (Node‑JS / Express)

> **Assumptions (to resolve the ambiguities)**  
> * **Database** – PostgreSQL via Prisma ORM (relational model fits users + refresh‑token tables and can be swapped for any other RDBMS).  
> * **User schema** – `id`, `email`, `passwordHash`, `firstName?`, `lastName?`, `role` (enum: `user`, `admin`), `isActive`, `createdAt`, `updatedAt`.  
> * **Password policy** – Minimum 8 characters, at least one letter and one number. (Can be extended later).  
> * **JWT** – Access token lifetime **15 min** (`ACCESS_TOKEN_TTL=900`). Claims: `{ sub: userId, role, iat, exp }`.  
> * **Refresh token** – Stored server‑side in a `RefreshToken` table (hashed token, expiry, revoked flag). TTL **30 days** (`REFRESH_TOKEN_TTL=2592000`).  
> * **Logout** – Revokes only the refresh token; access tokens are short‑lived and are not black‑listed.  
> * **Rate limiting** – Basic login throttling (5 attempts / 5 min per IP) using `express-rate-limit`.  
> * **Error contract** – `{ error: { code: string; message: string; details?: any } }`.  
> * **Secrets** – Loaded from `.env` (development) or injected by the platform (Docker/K8s secrets, CI).  
> * **Documentation** – Swagger/OpenAPI generated from JSDoc/`swagger-jsdoc`.  
> * **Test DB** – SQLite in‑memory for unit tests; a dedicated PostgreSQL instance for integration tests (managed by Docker Compose).  

---

## 1. Component / Module Breakdown

| Layer / Folder | Module / File | Responsibility |
|----------------|---------------|----------------|
| **root** | `package.json` | Scripts (start, dev, lint, test, coverage). |
| | `.eslintrc.js`, `.prettierrc` | Lint/format config. |
| | `README.md` | Project overview, setup, CI instructions. |
| | `jest.config.js` | Jest configuration (coverage, ts‑jest). |
| | `docker-compose.yml` | Development DB & optional Redis for future token blacklist. |
| **src/** | `app.ts` | Express application bootstrap (middleware registration, error handling). |
| | `server.ts` | Starts HTTP server (`npm start`). |
| | **config/** | `config.ts` – Centralised env‑var parsing (port, JWT secret, TTL, DB URL). |
| | **middleware/** | `authMiddleware.ts` – JWT validation & `req.user`. <br> `errorHandler.ts` – Central error formatter. <br> `rateLimiter.ts` – login‑specific limiter. |
| | **routes/** | `auth.routes.ts` – `/api/auth/*` endpoints (register, login, refresh, logout). <br> `profile.routes.ts` – `/api/profile` protected endpoint. |
| | **controllers/** | `auth.controller.ts` – Orchestrates register/login/refresh/logout. <br> `profile.controller.ts` – Returns current user profile. |
| | **services/** | `user.service.ts` – CRUD + password hashing. <br> `token.service.ts` – JWT & refresh‑token generation/verification. <br> `email.service.ts` (stub for future verification). |
| | **repositories/** | `user.repository.ts` – Prisma calls for `User`. <br> `refreshToken.repository.ts` – Prisma calls for `RefreshToken`. |
| | **models/** | `user.model.ts` – TypeScript interfaces / Prisma schema. <br> `auth.dto.ts` – Request/response DTO typings. |
| | **utils/** | `passwordUtils.ts` – Bcrypt wrapper & strength validator. <br> `cryptoUtils.ts` – Secure token generator (crypto.randomBytes). |
| | **docs/** | `swagger.ts` – Swagger definition generation. |
| | **tests/** | Unit tests (`*.spec.ts`) for services, middleware. <br> Integration tests (`*.int.spec.ts`) for routes using `supertest`. |
| | **prisma/** | `schema.prisma` – DB models + migrations. |

---

## 2. Data Models (TypeScript + Prisma)

```ts
// src/models/user.model.ts
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface IUser {
  id: string;               // UUID v4
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// src/models/auth.dto.ts
export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface RegisterResponse {
  id: string;
  accessToken: string;
  expiresIn: number; // seconds
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string; // sent as httpOnly cookie *or* in body
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

export interface LogoutResponse {
  message: string;
}

// src/models/refreshToken.model.ts
export interface IRefreshToken {
  id: string;               // UUID
  userId: string;
  tokenHash: string;        // bcrypt/sha256 of raw token
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}
```

**Prisma schema (simplified)**

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  firstName    String?
  lastName     String?
  role         Role     @default(USER)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(uuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  tokenHash String
  expiresAt DateTime
  revoked   Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([userId])
}
enum Role {
  USER
  ADMIN
}
```

---

## 3. API Design (OpenAPI‑style)

| Method | Path | Auth | Request Body / Params | Success Response | Error Responses |
|--------|------|------|-----------------------|------------------|-----------------|
| **POST** | `/api/auth/register` | ✗ | `RegisterRequest` (JSON) | `201 Created`<br>`RegisterResponse` | `400 Validation`, `409 Conflict (email taken)` |
| **POST** | `/api/auth/login` | ✗ | `LoginRequest` (JSON) | `200 OK`<br>`LoginResponse` (accessToken + refreshToken) | `401 Unauthorized` |
| **POST** | `/api/auth/refresh` | ✗ (refresh token in body or httpOnly cookie) | `RefreshRequest` | `200 OK`<br>`RefreshResponse` | `401 Unauthorized` |
| **POST** | `/api/auth/logout` | ✗ (refresh token) | `{ refreshToken: string }` | `200 OK`<br>`LogoutResponse` | `401 Unauthorized` |
| **GET** | `/api/profile` | ✅ (access token) | – | `200 OK`<br>`{ id, email, firstName?, lastName?, createdAt }` | `401 Unauthorized` |

*All responses follow the “error contract” when an error occurs:*

```json
{
  "error": {
    "code": "ERR_INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": null
  }
}
```

---

## 4. Key Algorithms / Flows

### 4.1 Registration Flow
1. Validate request payload (email format, password strength).  
2. Check `UserRepository.findByEmail(email)`. If exists → **409 Conflict**.  
3. `passwordHash = await PasswordUtils.hash(password)`.  
4. Create user via `UserRepository.create({ email, passwordHash, role: USER, isActive: true })`.  
5. Generate access JWT (`TokenService.signAccessToken(user.id, user.role)`).  
6. Return `201` with user id, token, expiry.

### 4.2 Login Flow
1. Validate payload.  
2. Retrieve user via email; if missing or `!user.isActive` → **401**.  
3. Compare password with stored hash (`PasswordUtils.compare`).  
4. On success:  
   * `accessToken = TokenService.signAccessToken(user.id, user.role)`.  
   * `refreshToken = TokenService.createRefreshToken(user.id)` – generates a random 256‑bit token, hashes it (`bcrypt` or `sha256` + salt), stores hash + expiry in DB, returns raw token.  
5. Set refresh token in `httpOnly` secure cookie **or** return in body (configurable).  
6. Return `200` with access token & expiry.

### 4.3 JWT Validation Middleware
1. Extract `Authorization` header → `Bearer <token>`.  
2. If missing → **401**.  
3. `payload = jwt.verify(token, JWT_SECRET)`. Catch `TokenExpiredError` / `JsonWebTokenError`.  
4. Attach `req.user = { id: payload.sub, role: payload.role }`.  
5. `next()`.

### 4.4 Refresh Token Flow
1. Receive raw refresh token (body or cookie).  
2. Hash same way as stored (`hashRefreshToken(raw)`).  
3. Lookup `RefreshTokenRepository.findByHash(hash)`.  
4. Verify `!revoked && expiresAt > now`. If not → **401**.  
5. Generate new access JWT (`signAccessToken`).  
6. (Optional) Rotate refresh token – create new token, revoke the old one.  
7. Return new access token.

### 4.5 Logout Flow
1. Extract refresh token.  
2. Hash & locate DB entry.  
3. Set `revoked = true`.  
4. Clear client‑side cookie (if used).  
5. Return `200` confirmation.

### 4.6 Rate Limiting (Login)
* Middleware applied only to `/api/auth/login`. Uses `express-rate-limit` with key = IP address (or email+IP) → 5 attempts per 5 min → `429 Too Many Requests`.

---

## 5. Technology Choices & Rationale

| Concern | Choice | Why |
|---------|--------|-----|
| **Runtime** | **Node 18 LTS** + **Express 4.x** | Mature, minimal boilerplate, large ecosystem. |
| **Language** | **TypeScript** (target ES2022) | Strong typing for auth models, reduces runtime bugs. |
| **ORM** | **Prisma** | Type‑safe DB access, auto‑generated TS types, easy migrations. |
| **Database** | **PostgreSQL** (Docker) | Relational, ACID guarantees for user/refresh‑token integrity, widely used in enterprise. |
| **Password hashing** | **bcryptjs** (or native **bcrypt**) | Proven, slow‑hash algorithm resistant to GPU attacks. |
| **JWT** | **jsonwebtoken** | De‑facto standard, supports HS256/HRS256. |
| **Refresh token storage** | **DB table** (hashed token) | Allows revocation, audit, and rotation; avoids unbounded memory use. |
| **Env handling** | **dotenv** + **dotenv-expand** | Simple, CI‑friendly. |
| **Validation** | **class-validator** + **class-transformer** (or **Joi**) | Declarative, integrated with DTO typings. |
| **Testing** | **Jest** + **ts-jest** + **supertest** | Fast unit tests, full request‑level integration tests. |
| **Coverage** | **nyc** (via `npm run coverage`) | Enforces 80 % threshold. |
| **Lint/Format** | **ESLint** (Airbnb) + **Prettier** | Consistent code style, CI‑ready. |
| **API docs** | **swagger-jsdoc** + **swagger-ui-express** | Auto‑generated from JSDoc, viewable locally (`/api-docs`). |
| **CI** | **GitHub Actions** – `node/setup`, cache `node_modules`, run `npm ci`, `npm test`, `npm run coverage`. |
| **Security Headers** | **helmet** | Mitigate common HTTP‑based attacks. |
| **Rate limiting** | **express-rate-limit** + **redis-store** (future‑proof). | Prevent brute‑force login. |
| **Cookie handling** | **cookie-parser** | Needed for httpOnly refresh token support. |

---

## 6. Risks, Trade‑offs & Mitigations

| Risk | Description | Mitigation |
|------|-------------|------------|
| **Refresh‑token leakage** | If token is stored client‑side insecurely, attacker can gain long‑lived access. | Default to `httpOnly; Secure; SameSite=Strict` cookie. Provide option to send in body only over TLS. |
| **Token revocation scaling** | Revoking only refresh tokens is cheap; revoking access tokens would require a blacklist (Redis) and extra DB hits. | Keep access tokens short (15 min) – reduces need for revocation. Add optional Redis blacklist later if required. |
| **Password hash cost** | Bcrypt cost (`10`) may be heavy on low‑end CI runners. | Provide separate `BCRYPT_COST_DEV=8` for tests; enforce higher cost in production via env variable. |
| **Database lock contention** | High login volume could cause race conditions on refresh‑token insert/revoke. | Use DB unique constraint on `(userId, tokenHash)` and atomic `UPDATE` with `WHERE revoked = false` to avoid duplicates. |
| **Rate‑limit bypass (distributed IP)** | Attackers could rotate IPs. | Add optional email‑based limiter (key = `${email}:${ip}`) and consider CAPTCHA after threshold. |
| **Schema migration drift** | Prisma migrations may become out‑of‑sync with production DB. | Enforce migration step in CI (`prisma migrate deploy`) and require PR check for pending migrations. |
| **Secret exposure** | `.env` file may be committed inadvertently. | Add `.env.example` to repo, `.env` to `.gitignore`. Use CI secret store for CI runs. |
| **Testing against real DB** | Integration tests may flake if DB not ready. | Use Docker Compose `depends_on` and healthchecks; spin up a fresh PostgreSQL container per CI job. |
| **Compliance (GDPR)** | Storing email & personal data requires ability to delete user. | Provide `UserService.deleteUser(id)` that also cascades delete of refresh tokens; log deletions. |
| **Future auth mechanisms (OAuth, SSO)** | Current design is tightly coupled to JWT + custom DB. | Keep auth logic in `services/auth/*` and expose interfaces; new strategies can be added as plug‑ins without touching core routes. |

---

## 7. Summary of Development Flow

1. **Scaffold** (`npm init`, install dependencies, add ESLint/Prettier, create `README`).  
2. **Configure** `src/config.ts` reads env vars, sets defaults.  
3. **Database** – Add Prisma schema, run `prisma migrate dev`. Generate client (`prisma generate`).  
4. **Implement** core modules: repositories → services → controllers → routes.  
5. **Middleware** – attach `authMiddleware` globally for `/api/profile`; attach `rateLimiter` to login route.  
6. **Docs** – annotate routes with JSDoc, generate Swagger at `/api-docs`.  
7. **Testing** – write unit tests for `PasswordUtils`, `TokenService`, middleware; write integration tests using `supertest` against an in‑memory SQLite DB.  
8. **CI** – GitHub Actions runs `npm ci`, `npm run lint`, `npm test`, `npm run coverage`.  
9. **Release** – bump version, tag, push to remote repository.

---

> **Next Steps for the Team**  
> 1. Confirm database choice (or decide to keep the Prisma‑agnostic abstraction).  
> 2. Approve password policy & JWT TTL values.  
> 3. Choose refresh‑token transport (cookie vs. body).  
> 4. Decide on any additional user fields (profile data, email‑verification flag).  
> 5. Sign‑off on rate‑limit limits & error contract.  

Once the above points are validated, the implementation can proceed directly from this design.