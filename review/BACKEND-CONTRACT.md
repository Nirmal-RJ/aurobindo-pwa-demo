# Review API integration boundary

**Standalone update:** identity is now owned by `review_auth.accounts` in QC Core's own database, alongside its sessions/audits. No employee-project account tables or endpoints are used. The HTTP/session contract below is preserved. See `../review-backend/STANDALONE.md`; prior external-database assumptions are superseded. Live login remains explicitly disabled pending independent roster and runtime setup.

## Authentication implemented in the frontend

The client session adapter matches the copied `../review-backend/` contract, with operation versions, token snapshots, timeout/error handling and a read-only account snapshot. It has no external-checkout dependency. Local validation uses the real copied API and PostgreSQL with synthetic accounts; the API is not deployed and no production data is used.

| Operation | Relative same-origin contract |
| --- | --- |
| Login | POST `/review-api/login`, JSON `{employeeId}`. HTTP 200 returns `{account,recoveryToken,expiresAt}` and the server sets an HttpOnly `__session` cookie, scoped to `/review-api`. |
| Restore | GET `/review-api/me`, optional saved Bearer recovery token. HTTP 200 returns `{account,expiresAt}`. Cookie-only restore is supported. |
| Logout | POST `/review-api/logout`, JSON `{}`, optional saved Bearer token. HTTP 204 has no body. Clear saved token after success. |

Every request uses `credentials: same-origin` and `cache: no-store`. `qsl-review-session-v1` contains the private recovery token only, never a serialized demo account or a URL parameter. UI callers receive the account/expiry without the token. Server roles ghost/director are authoritative. Unexpected account payloads cannot mount the frontend.

Restore precedes review/Profile entry and the login decision. Protected 401/403 clear rejected credentials; temporary failures, network errors, timeout, 429 and 5xx preserve them and allow retry. No polling, heartbeat, client-generated expiry or automatic login is added. Session duration/renewal remain the backend's 90-day policy. Delayed operations cannot overwrite newer login state or remove a newer credential. Account/role changes invalidate the mounted local preview.

Employee-ID-only login is owner-approved and identifies a claimed account, not proof of identity. Ordinary employee access is denied by the backend. No password, OTP or other identification requirement was added.

## Hosting pending

Relative endpoints require a shared origin. The root local server now proxies `/review-api/**` to a configured loopback `REVIEW_API_TARGET`, preserving browser Origin, credentials and Set-Cookie. Unconfigured/unreachable upstreams return JSON 503. Root service-worker API handling is network-only with no-store, including navigation and POST requests. Backend source/fixture files are blocked from local static serving.

GitHub Pages cannot provide that proxy. The proposed production deployment remains a separate Firebase Hosting site rewriting `/review-api/**` to the dedicated Cloud Run review service. No live origin or cross-origin support is assumed. Production infrastructure/data changes need separate approval.

## Chat not connected

All discussion operations still use `createMockAPI`. Their state is explicitly browser-local demonstration data, not authenticated shared conversations. The server identity is shown in Profile; fictitious demo participants remain labeled separately. Preview role choices are limited by the server role so directors cannot expose RC in the UI.

No chat APIs, subscriptions, upload endpoints, shared votes, notification delivery, database access or employee-PWA integration were implemented. Future work must define/authenticate/authorize room history, message-by-ID, screenshot access, reply/reference operations, reactions and votes independently on the backend, especially RC membership. Never use the local demo participant selector as production authorization.

Existing typed message contracts, stable pagination, client view/version guards and local UI components remain available for that separately approved integration. Game discussions retain immutable build scope; General Discussion has an independent room scope. There is no final release approval or tracked-feedback feature.

## Validation boundary

`../review-backend/scripts/actual-ui-e2e.mjs` runs the finished review UI with real same-origin HTTP and SQL authentication in Edge/WebKit. Authentication responses are not fabricated: delayed responses and cookie-blocked scenarios forward real backend responses. Proxy outages stop/restart the actual API. The older intercepted suites remain focused regressions for errors/timeouts and UI behavior. See `../review-backend/LOCAL_INTEGRATION.md` for verified results and limits.

## Configuration boundary

The copied backend, its lockfile, schema and tests are entirely in this checkout. No employee-app endpoints, external checkout or production credentials are required for synthetic local testing. Running against an authorized database still requires private `REVIEW_DATABASE_URL` configuration and an exact frontend `REVIEW_ORIGIN`; production configuration and real roster verification remain pending. The local fixture is not an employee roster and does not establish access for real users.
