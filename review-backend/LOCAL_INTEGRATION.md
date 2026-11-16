# Local finished-UI integration — 9 November 2026

The finished `../review/` frontend now uses the real copied review API through a same-origin development proxy. Everything needed is inside this checkout. No employee-app checkout, production database, cloud service, credentials, deployment or Git push was used.

## Try the finished UI locally

Requires Windows x64 and Node 22+. From this project's `review-backend/` directory:

```powershell
npm ci --ignore-scripts --no-audit --no-fund
npm install --no-save --package-lock=false @embedded-postgres/windows-x64@18.6.0-beta.19 --no-audit --no-fund
npm run dev:fixture
```

Open **http://127.0.0.1:4175/review/**. Use that exact host, not `localhost`: browser Origin must match the API's configured origin.

- `100021`: synthetic “Local RC member”, ghost role.
- `100024`: synthetic “Local director”, director role.

These are synthetic test records, not actual employee identities or credentials. The API still applies its real allowlist/access/session logic. No fake authentication response is used. The independent PostgreSQL cluster binds only to loopback, uses trust authentication for disposable synthetic data, and is never a production configuration. It is created under ignored `scratch/`; Ctrl+C stops services and removes it. Accounts/sessions are temporary; browser-local chat demo data remains in the browser. Do not use this fixture for real users.

Set `REVIEW_PREVIEW_PORT` before the command to choose another free frontend port. Startup refuses an occupied port; it does not stop other applications. Optional PostgreSQL binaries live in ignored `node_modules/` and are deliberately not production dependencies. Running `npm ci` again removes them; reinstall the optional package afterward.

## Connect a separately configured local database

No normal local database credentials/roster were supplied. To use an authorized local database instead of synthetic fixtures:

1. Inside `review-backend/`, privately copy `.env.example` to `.env.local` and configure `REVIEW_DATABASE_URL`, `REVIEW_DATABASE_SSL`, `REVIEW_PORT=4180`, `REVIEW_ORIGIN=http://localhost:4174`, `NODE_ENV=development`. The database must already have compatible canonical `accounts` / `employee_access` tables. Startup adds only the review schema. Do not point this local setup at production.
2. Start the API: `node --env-file=.env.local src/main.mjs`. This development setup retains additive schema creation; production requires a separate migration identity and no runtime DDL (see RESTRICTED_DATABASE.md).
3. In a second terminal at the project root:

```powershell
$env:PORT='4174'
$env:REVIEW_API_TARGET='http://127.0.0.1:4180'
node server.mjs
```

4. Open `http://localhost:4174/review/`. The browser calls only relative `/review-api/*`; the frontend must not call port 4180 directly.

The proxy accepts loopback HTTP origins only. It streams methods/bodies, preserves original browser Origin, Authorization, Cookie and Set-Cookie, returns uncached JSON 503 for missing/unreachable upstreams, and never falls back to HTML for API paths. Backend files and sample fixture pages cannot be served statically by the root server. No credentials are placed in frontend code or logs.

## Repeat automated verification

From `review-backend/`, install the optional PostgreSQL binaries above. Set `REVIEW_PLAYWRIGHT_MODULE` to an installed Playwright module path (or install Playwright separately without saving it), and `REVIEW_WEBKIT_EXECUTABLE` if the installed WebKit is not discoverable. Edge and Playwright WebKit must be installed. Then run:

```powershell
npm run test:proxy
npm run test:actual-ui
```

The actual-UI suite automatically creates/stops/removes its own independent database cluster, runs the copied SQL/HTTP integration suite, then starts the real API with sample-fixture serving disabled and the root frontend proxy on temporary loopback ports. Screenshots are in ignored `scratch/actual-ui/`. Authentication responses are not fabricated. Delay/cookie-blocking tests forward real backend responses; outage tests actually stop/restart the backend. No external API or production data is contacted.

## Verified results

- Copied real PostgreSQL/HTTP suite passed: allow/deny boundaries, 90-day renewal, hashed storage, expiry, recovery, cookie-only restoration, logout revocation and isolated sessions/audits.
- Actual finished UI passed in **headless Edge and WebKit**: single Employee ID field, allowed ghost/director and denied excluded/ordinary/blocked identities, server-owned Profile identity, ghost RC visibility and director RC exclusion including direct RC navigation.
- Reload/reopen reuse the saved session. Missing-cookie bearer recovery recreates the HttpOnly **`__session`** cookie through the proxy. Cookie-only restoration and cookie-blocked bearer restoration passed. With localStorage blocked, login/Profile restoration works through the cookie; the separate local chat demo still requires browser storage.
- Stopping the API produces restore/logout retry states and preserves the credential. Retry after restart succeeds. Logout revokes the SQL session and clears the browser token; the old recovery credential then receives 401.
- Held an actual ghost `/me` response, switched to a director in another tab, released the old response: the old Profile stayed hidden, Retry mounted only the director identity. Canonical access revocation also redirects back to login and clears the rejected session.
- Proxy and service-worker regressions passed: Origin/header/body/cookie propagation, empty 204, no-store, backend-file denial, unavailable upstream, loopback-only configuration; poisoned auth caches are bypassed for GET, POST and navigation in a worker-handler test.
- Root `npm run check` passed. Public homepage and Rocketier, AB Express, Match It, Blast It entry files still serve successfully. No game runtime/assets/layouts changed in this integration. This is not a full gameplay or physical-device certification.
- Checked login widths 320/390/1440, Profile at 320px, and inspected Edge login / WebKit Profile screenshots. No horizontal overflow or browser runtime errors in the tested flows. Temporary SQL clusters were removed after tests.
- Manual fixture startup/routing/cleanup smoke passed. Hash checks against the original copy manifest confirm backend `src/` and production dependency lock are unchanged. `REVIEW_BACKEND_MANIFEST.json` remains the original copy snapshot; documentation/package-script changes listed below intentionally postdate it.

## Still awaiting configuration and approval

- No deployed review API or final live origin. GitHub Pages still cannot proxy these endpoints. A separate Firebase Hosting site and dedicated Cloud Run service remain a proposal requiring explicit authorization.
- Production database credentials, dedicated least-privilege access, current 22-ghost/20-director roster audit, migration ownership, connection/TLS setup, operational sizing and release/rollback configuration remain pending. Tests verify synthetic representatives and backend policy; they do not certify the live roster.
- Firebase forwarding of `__session`, HTTPS Secure cookies, live no-store routing and actual hosted worker updates need deployment-specific testing after approval. Physical iPhone/Android, mobile keyboard/device checks and production capacity are unverified.
- Chats, votes, reactions, references and screenshots remain simulated browser-local data. Login alone does not make them shared or backend-persisted. Real RC access must be independently enforced by any future conversation backend.

## Changed files for this integration

- `../server.mjs`: optional loopback API proxy, exported server factory, backend static-file denial; existing game static/range handling retained.
- `local-proxy.mjs`: replaceable development reverse proxy, no secret configuration.
- `../sw.js`: auth network-only/no-store bypass and shell cache version 486. Other pending homepage/branding changes predate this integration.
- `../review/session.js`: source comment now points to the copied local contract; authentication behavior and approved UI retained.
- `scripts/with-test-postgres.mjs`, `scripts/actual-ui-e2e.mjs`, `scripts/local-preview.mjs`, `test/local-proxy.test.mjs`: isolated SQL fixture, actual-UI tests, manual preview and proxy/cache regressions.
- `package.json`: local fixture and verification commands; production dependency lock unchanged.
- `README.md`, `VALIDATION.md`, `LOCAL_INTEGRATION.md`, `../review/README.md`, `../review/BACKEND-CONTRACT.md`, `../review/DESIGN.md`, `../review/PROGRESS.md`, `../REVIEW_BACKEND_HANDOFF.md`: current instructions/results. Earlier handoff statements describe the pre-integration snapshot.

To reverse only this integration, remove the optional proxy hook/helper and these local fixture/test commands, and restore the prior worker handler/version. Do not revert unrelated pending game/UI changes or delete existing browser demo data.
