> ACTIVE DECISION: Firestore. See review-backend/CURRENT_STATUS.md relative to repository root. Previous SQL plans below are historical.

> CURRENT 10 November: SQL selected again. Runtime code restored; cloud recreation held pending runtime IAM/secret access. See review-backend/SQL_RESTORATION.md relative to repository root. Historical states below are superseded.

> CURRENT: Firestore selected. Database creation was permission-denied; migration and SQL deletion are pending. See review-backend/FIRESTORE_MIGRATION.md (relative to repository root). Earlier SQL evidence below is historical.

# Review login backend ? standalone handoff

**Current architecture:** the owner selected a completely independent QC Core database and roster. Read [STANDALONE.md](STANDALONE.md) first. It supersedes the old cross-project identity/grant instructions below; do not access the employee project. The live service remains login-disabled pending its own roster/runtime setup.

Start here. This package no longer imports anything from F:/aurobindo-pwa. Keep it isolated from the employee PWA. Owner authorized copying, not deployment or push.

## Scope and agreed behavior

- Login input: employee ID only. No unique ID, password or OTP. This intentionally does not prove possession of the employee identity; anyone knowing an allowed ID can claim it. Do not silently add another login requirement.
- Only original 22 ghosts (100001?100021 and 100023) and 20 directors (100024?100043); additionally canonical accounts.is_ghost must be true and employee_access.status must be allowed. A role allowlist is not a current live-roster audit.
- Account name and role come from canonical public.accounts joined to public.employee_access by email. Do not copy canonical accounts into a second production identity source.
- Separate review_auth.sessions and review_auth.audit tables. Never writes employee game progress, employee login/device keys, rewards or employee-PWA sessions.
- Random session credentials stored hashed in PostgreSQL. Cookie is HttpOnly; recovery bearer token is saved by the existing frontend. 90-day session, sliding renewal at most once per 24 hours. Restoration revalidates canonical access. Logout revokes that device session. Missing cookie can be restored from recovery token. If both storage methods are blocked/cleared, persistent login cannot be guaranteed.
- No polling or heartbeat added. SQL pool max 2 per instance; HTTP inflight gate 12. These bounds are not a load-test capacity guarantee.
- Chats, comments, screenshots, reactions and voting are still frontend simulations. No conversation persistence is implemented by this package.

## Files

src/: server, entrypoint, access/session policy, database store and additive SQL.
test/login.test.mjs: real PostgreSQL + HTTP integration tests with synthetic identities.
scripts/browser-smoke.mjs and test-fixtures/web/: sample login browser smoke test, not the finished review UI.
Dockerfile, package-lock.json: isolated reproducible deployment build.
firebase.review.template.json: INCOMPLETE separate-site same-origin routing template, not an active site configuration.
.env.example: placeholder configuration only. Real credentials are intentionally excluded.

## Local setup

Requires Node 22+, npm and local PostgreSQL. Work inside review-backend, not the root game package.

1. Run npm ci.
2. Copy .env.example to .env.local; fill LOCAL database credentials privately. Never commit it.
3. npm test runs only when REVIEW_TEST_DATABASE_URL is present; use:
   node --env-file=.env.local --test test/login.test.mjs
   Tests reject non-local database hosts and create/drop only uniquely named disposable fixture databases. The local DB role needs CREATEDB. Tests seed their own synthetic account/access records.
4. For the API: node --env-file=.env.local src/main.mjs
   REVIEW_DATABASE_URL must point to a prepared local database with compatible canonical accounts/access tables. Non-production startup applies src/schema.sql additively. Production requires separately provisioned tables and performs no startup DDL; see RESTRICTED_DATABASE.md. The integration test database is temporary and removed afterward; it is not a reusable development seed.
5. The root development server now includes the LOCAL proxy. Set REVIEW_API_TARGET=http://127.0.0.1:4180 and PORT=4174 when starting ../server.mjs. Set REVIEW_ORIGIN=http://localhost:4174 for the API and open that exact frontend origin. The proxy preserves method/body/headers/Set-Cookie and original browser Origin. Do not change the browser adapter to call a second origin. See LOCAL_INTEGRATION.md for complete commands and a self-contained synthetic fixture preview.
6. API-only runtime serves no static frontend. Use ../review, not test-fixtures/web, for the actual app.

Optional sample browser smoke test:
- Install playwright-core separately with npm install --no-save --package-lock=false playwright-core, or set REVIEW_PLAYWRIGHT_MODULE to an already installed module path.
- Edge is required; install Playwright WebKit or set REVIEW_WEBKIT_EXECUTABLE.
- Set REVIEW_TEST_DATABASE_URL and run npm run test:browser. It uses port 4182 and disposable local SQL fixtures. Screenshots under scratch/ are ignored. This validates the sample login adapter; rerun the existing ../tests/review-*.browser.cjs suites and real end-to-end checks for the finished UI.

## API contract ? same origin only

POST /review-api/login
Content-Type: application/json
Origin: exact REVIEW_ORIGIN
Body: {"employeeId":"100024"}
200: {"account":{"id":"uuid","employeeId":"100024","name":"server-owned name","role":"director","identityMethod":"employee-id-only"},"recoveryToken":"opaque token","expiresAt":"ISO timestamp"}
Sets __session cookie (Path=/review-api, HttpOnly, SameSite=Lax, Secure in production).

GET /review-api/me
Send credentials: same-origin; optionally Authorization: Bearer <recoveryToken>.
200: {"account":{...same fields...},"expiresAt":"ISO timestamp"}. May recreate/renew cookie. Does not return a new recovery token.

POST /review-api/logout
Same credentials and exact Origin. 204 with EMPTY body; clear browser recovery token after success. No automatic session/history deletion.

GET /review-api/health -> {"ready":true}. Process liveness only, NOT a database-readiness test.

Errors: JSON {"message":"..."}; 400 malformed request, 401 invalid/expired session, 403 disallowed access/origin, 404 unknown route, 405 method, 413 size, 415 content type, 429 rate limit, 503 unavailable. Preserve credentials on transient errors; clear only rejected session credentials. Never log tokens or login/session response bodies.

## Differences from the original F: copy

- __session cookie replaces review_session, because Firebase Hosting forwards only __session to rewritten Cloud Run requests. No deployed review-session migration is required: this backend has never been deployed.
- Tests read explicit REVIEW_TEST_DATABASE_URL; no F: .env dependency.
- Browser paths are package-relative/configurable; no F: imports.
- Sample pages moved to test-fixtures/web. Production entrypoint disables static fixture serving.
- Added independent dependency lock, Docker build, ignored env files and deployment template.
- Existing ../review/session.js was inspected, not overwritten. It already uses the matching endpoints, same-origin credentials, recovery token and response guards; cookie name is server-controlled.

## Deployment plan ? only after explicit owner authorization

1. No external checkout is required. Use this README and ../REVIEW_BACKEND_HANDOFF.md. Confirm current frontend review files and test results in this repository.
2. Use the owner-selected Blaze project apl-qc-core-app-f5a3e and its verified default Hosting site of the same ID. The dedicated Cloud Run service aurobindo-review-api in asia-south1 remains planned, not deployed. Do not deploy to employee-PWA project/services or live aliases. Existing Cloud SQL is in the other project; access requires separately approved cross-project permissions.
3. Choose the final review origin first. Configure REVIEW_ORIGIN to that exact HTTPS origin, NODE_ENV=production and REVIEW_DATABASE_URL privately. No production credentials were copied. Use an authorized Google account and a dedicated least-privilege review database role; never ask the frontend to contain SQL credentials. Provisioning access is still pending.
4. Production startup no longer performs DDL. Provision the schema separately using an approved migration identity; scripts/migrate.mjs requires REVIEW_MIGRATION_DATABASE_URL explicitly. Runtime needs canonical identity reads and review-schema session/audit writes only; no employee-table UPDATE or schema ownership. RESTRICTED_DATABASE.md documents local role tests. Existing runtime SSL mode REVIEW_DATABASE_SSL=true uses rejectUnauthorized:false; validate the chosen Cloud SQL connection/TLS method before production.
5. Stage only review frontend and required assets for the new site. Do not publish review-backend, .env, node_modules, tests, SQL, private docs or credentials. Fill firebase.review.template.json with separate site ID and staged public path. API rewrite precedes any HTML fallback. All /review-api responses must stay no-store, including errors. Keep API GETs out of the root service worker cache or isolate its scope.
6. Build/release only the dedicated backend. Initial proposed bounds: min instances 0, max 2, concurrency 12, 15-second request timeout, pool 2 each. Min 0 can cold-start; adjust only after measuring review traffic and database connection headroom. Do not reuse employee-PWA service sizing blindly. API reachable through Hosting still must enforce its own access rules.
7. Verify real login + reload + browser reopen, cookie-only persistence through Firebase, missing-cookie recovery, denied ordinary/blocked accounts, logout revocation, identity change race, 404 API routing, no cached API data, no secrets in published files; run Edge/WebKit and physical iPhone/Android checks. Sample/synthetic tests do not prove production routing or device behavior.
8. Record prior review-service revision and review Hosting release before switching traffic. Roll back only those review resources. Additive review_auth tables/history stay retained; no rollback SQL deleting canonical data. Do not automatically modify employee-PWA services or routing.

Local proxy and actual finished-UI/API integration are complete and verified with independent synthetic PostgreSQL fixtures in Edge/WebKit; see LOCAL_INTEGRATION.md and VALIDATION.md. Pending: production roster audit, chosen Hosting site/origin, dedicated DB access, live routing/cookie tests, physical devices and authorized publication. No deployment or push occurred.
