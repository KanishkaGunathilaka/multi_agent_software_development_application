# Code Review Report

**Code Review – Auth Service (Node JS + Express + TypeScript)**  

---

## Summary
The repository provides a solid foundation for a JWT‑based authentication service with Prisma, rate‑limiting, Swagger docs and a CI‑ready toolchain. The overall folder layout, environment handling, and use of TypeScript typings are commendable. However, several critical bugs around refresh‑token handling, missing imports, and insecure defaults prevent the service from running correctly and compromise security. Minor issues such as unused placeholder functions, ESLint configuration gaps, and type‑augmentation omissions also need attention.

---

## Issues  

| Severity | Location | Description | Recommended Fix |
|----------|----------|-------------|-----------------|
| **Critical** | `src/controllers/auth.controller.ts` (login & refresh) | `config` is referenced but never imported, causing a runtime/compile error (`ReferenceError: config is not defined`). | Add `import { config } from '../config/config';` at the top of the file. |
| **Critical** | `src/controllers/auth.controller.ts` (refresh) | Role is obtained via `await UserService.getProfile(userId)).role` – the `getProfile` DTO does **not** contain a `role` field, so `role` is always `undefined` and the new access token falls back to `'USER'`. | Either fetch the user directly with `UserRepository.findById` or extend `UserService.getProfile` to return the role, then use that value when signing the token. |
| **Critical** | `src/services/token.service.ts` (refresh token verification) | `hashRefreshToken` uses bcrypt with a random salt each call, then `verifyRefreshToken` hashes the supplied raw token **again** and attempts a direct `findByHash` lookup. Because the hash will be different, verification *always fails*. | Store a deterministic hash (e.g., SHA‑256) of the raw token in the DB and compare using `bcrypt.compare` or, simpler, store the SHA‑256 hash directly. Implementation example: <br>```ts<br>// store<br>const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');<br>// verify<br>const stored = await RefreshTokenRepository.findByHash(tokenHash);<br>if (!stored || stored.revoked || stored.expiresAt < new Date()) throw new UnauthorizedError(...);<br>``` |
| **Critical** | `src/services/token.service.ts` (hashRefreshToken & compareRefreshToken) | Two separate hashing strategies (SHA‑256 then bcrypt) are mixed, and `compareRefreshToken` is never used. This adds unnecessary complexity and CPU overhead. | Choose a single deterministic hash (SHA‑256) stored in DB, and compare with `===`. Remove the bcrypt step and the unused `compareRefreshToken` method. |
| **Critical** | `src/config/config.ts` | Default `JWT_SECRET` falls back to the literal `'default_secret'`. If a developer forgets to set `.env`, the service runs with a known secret – a severe security flaw. | Throw an error when `JWT_SECRET` is missing: <br>```ts<br>if (!process.env.JWT_SECRET) { throw new Error('JWT_SECRET is required'); }<br>``` |
| **Critical** | `src/controllers/profile.controller.ts` | Throws a generic `Error` when `req.user?.id` is missing, which bypasses the structured error‑handling middleware and results in a 500 response rather than a 401/400. | Throw a `UnauthorizedError` (or `BadRequestError`) instead of `new Error`. |
| **Critical** | `src/controllers/auth.controller.ts` (refresh) | The endpoint does **not** rotate the refresh token. Best practice is to issue a new refresh token and revoke the old one to mitigate token‑theft. | After verifying the old refresh token, call `TokenService.createRefreshToken(userId)` and set the new token as an HttpOnly cookie, then revoke the old token. |
| **Major** | `src/utils/cryptoUtils.ts` | `sha256Hash` returns a random zero‑length hash (`randomBytes(0)`). It is unused but misleading. | Either implement proper SHA‑256 hashing (`crypto.createHash('sha256').update(token).digest('hex')`) or delete the function. |
| **Major** | `src/middleware/authMiddleware.ts` | Extends `req` with a `user` property without augmenting Express’ `Request` type, causing TypeScript compile errors in strict mode. | Create a global declaration file (e.g., `src/types/express.d.ts`) that adds `interface Request { user?: { id: string; role: string } }`. |
| **Major** | `src/app.ts` | `swagger-jsdoc` `apis` glob points only at `./src/routes/*.ts`. Controllers and DTO schemas are annotated only in routes, which is fine, but the `components.schemas` are defined manually – risk of drift. | Consider using `swagger-autogen` or keep docs in sync; add a comment reminding maintainers to update Swagger when DTO changes. |
| **Major** | `package.json` → `scripts` | `npm run dev` uses `ts-node` without transpiling type‑checking (`--transpile-only`). Could hide type errors during development. | Use `ts-node-dev` with `--transpile-only` for speed **and** run `npm run lint` in a pre‑commit hook, or keep the current setup but be aware. |
| **Minor** | `.eslintrc.js` | Uses `@typescript-eslint/parser` but the corresponding plugin (`eslint-plugin-@typescript-eslint`) is **not** listed in `devDependencies`. | Add `"eslint-plugin-@typescript-eslint": "^6.0.0"` (or appropriate version) to `devDependencies`. |
| **Minor** | `src/controllers/auth.controller.ts` (login) | After setting the refresh‑token cookie, the token is removed from the JSON response via destructuring (`const { refreshToken, ...rest } = result;`). The variable `result` still contains the raw token which could be logged accidentally. | Remove the raw token from the `result` object before any logging, or construct a fresh response object without the token. |
| **Minor** | `src/controllers/auth.controller.ts` (refresh) | Accepts refresh token from body **or** cookie but does not validate which source is used, potentially allowing CSRF via body. | Prefer cookie‑only transport for refresh tokens, or enforce SameSite=`strict` (already set) and add CSRF token if body usage is allowed. |
| **Minor** | `src/services/user.service.ts` (login) | Returns an object with `refreshToken` but the type of the method is not declared. It should explicitly return `Promise<LoginResponse>`. | Add proper return type annotation. |
| **Minor** | `src/services/token.service.ts` – `hashRefreshToken` | Hard‑codes `saltRounds = 10`. Ideally this should be driven by an env var (e.g., `BCRYPT_SALT_ROUNDS`). | Use the same constant as password hashing (`SALT_ROUNDS`). |
| **Minor** | `src/config/config.ts` – `db.url` default is empty string; Prisma client will throw if not set. | Add validation similar to `JWT_SECRET`. |
| **Minor** | `src/docs/swagger.ts` – `servers` URL uses placeholder `{port}` but does not reference `config.port`. | Replace with actual runtime port or keep as placeholder but document it. |
| **Suggestion** | `src/utils/passwordUtils.ts` – `isStrongPassword` only checks length, letters, numbers. | Provide a more configurable policy (e.g., special chars, entropy) or expose as env‑configurable. |
| **Suggestion** | `src/middleware/rateLimiter.ts` – global rate limiter only for login. Consider adding generic limiter for other auth endpoints. | Export a reusable limiter creator for other routes. |
| **Suggestion** | `src/services/token.service.ts` – `verifyAccessToken` returns `any`. | Define a proper `interface AccessTokenPayload { sub: string; role: string; iat: number; exp: number }` and type the return value. |
| **Suggestion** | `src/app.ts` – `cors` is set with `origin: true`. In production, restrict to known origins. | Change to `origin: process.env.CORS_ORIGIN?.split(',') ?? []` and document. |

---

## Security & Safety
| Issue | Impact | Mitigation |
|-------|--------|------------|
| Default `JWT_SECRET` = `'default_secret'` | Anyone could forge JWTs if env is missing. | Throw on missing secret; never ship default. |
| Refresh token stored as bcrypt hash with random salt – verification impossible → leads to denial‑of‑service (all refresh attempts fail) and may force fallback to insecure token reuse. | Fix hashing strategy as described; store deterministic hash. |
| Refresh token accepted from request body (potential CSRF) | Attackers could force a victim’s browser to POST a token. | Prefer HttpOnly cookie only; enforce SameSite Strict (already set) and consider CSRF token if body usage required. |
| Missing validation of `config.JWT_SECRET` and `config.db.url` allows server start with invalid configuration, creating hidden runtime failures. | Add early validation and exit with clear error. |
| No token revocation for access tokens – although short‑lived, a compromised token remains usable until expiry. | Consider token blacklist (optional) or rotate secret on critical events. |
| Logging of raw refresh token (in login route) before stripping could leak to console or log aggregators. | Ensure no `console.log` of raw token; remove from any logs. |
| Use of `res.cookie` with `secure: process.env.NODE_ENV === 'production'`. In non‑production environments (e.g., staging) with HTTPS, cookie may be sent over plain HTTP. | Make `secure` configurable or enforce HTTPS in all environments. |

---

## Positive Highlights
* **Project scaffolding** – clean `package.json` scripts, TypeScript build pipeline, ESLint + Prettier integration, and Docker compose for PostgreSQL.  
* **Prisma ORM** – strong typing for DB entities, relation between `User` and `RefreshToken`.  
* **Rate limiting** on login using `express-rate-limit`.  
* **Centralised error handling** with custom `HttpError` hierarchy delivering a consistent error contract.  
* **Swagger documentation** auto‑generated from route annotations.  
* **Security headers** via `helmet` and CORS configuration.  
* **Separation of concerns** – repositories, services, controllers, and middleware are well‑structured.  
* **Refresh‑token model** includes revocation flag and expiry, ready for rotation logic.  

---

## Verdict
**❌ Requires changes**

The code contains critical functional bugs (refresh‑token verification, missing imports, insecure defaults) that prevent the service from operating securely and correctly. Address the critical issues first, then resolve the major/minor points. Once those are fixed and the test suite (once added) passes the coverage thresholds, the project can be approved.