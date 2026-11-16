# Firestore migration — 9 November 2026

Owner decision: Firestore replaces QC Core PostgreSQL. Work targets only `apl-qc-core-app-f5a3e`; no employee-project dependency or access is allowed.

## Verified this turn

- Firestore database list was empty.
- Creating Standard Native `(default)` in `asia-south1` failed with caller permission denied for the active Google account. No database was created.
- New server-side Firestore adapter preserves Employee-ID-only login, approved ID/role checks, blocked status checks, opaque account IDs, 90-day sessions, daily sliding renewal, hashed cookie/recovery credentials, recovery precedence, and idempotent logout audit.
- Existing HTTP/session adapter and frontend UI are unchanged. API remains same-origin; browser Firestore access must be denied.
- Six local tests passed: deterministic Firestore store contracts, real HTTP adapter with synthetic storage, disabled production entrypoint, proxy and worker cache bypass. These do NOT prove real Firestore permissions, transaction retries, emulator behavior or browser E2E against Firestore.
- SQL remains intact because the replacement database/roster is not yet verified. No live service deployment or Git push occurred.

## Administrator action, QC Core project only

1. Create Firestore `(default)`, Native mode, Standard edition, Mumbai `asia-south1`. Do not enable test-mode browser access.
2. Grant `roles/datastore.user` to `qc-core-review-runtime@apl-qc-core-app-f5a3e.iam.gserviceaccount.com`. This identity has no employee-project access. The server SDK bypasses client rules; its IAM role includes database writes, so runtime code must continue to expose no roster-edit endpoint.
3. An authorized provisioning operator needs Firestore document read/write permission. No downloaded service-account key is required; use approved Application Default Credentials.

## Complete migration after access is available

1. Deploy `firestore.rules` with `firebase.firestore.json` scoped to this project (deny all direct client access).
2. From `review-backend`, run `npm run provision:firestore` using an authorized provisioning identity. It reads ignored `private/approved-reviewers.json`, validates 42 unique IDs / 22 ghosts / 20 directors, refuses an unexpected existing roster, preserves existing IDs, verifies every persisted name/ID/role/status, then marks the roster verified. It prints no private credentials. New Firestore opaque account IDs are acceptable because live login has never been enabled; Employee IDs and approved names/roles remain identical.
3. Run real emulator/database integration and actual Edge/WebKit UI tests: allow/deny roles, recovery, cookie-only restore, blocked access, renewal, expiry, revocation, transient failures and stale responses. Current local contract tests use an explicitly synthetic storage double; real Firestore validation is pending.
4. Build/deploy the new backend with `REVIEW_FIRESTORE_PROJECT=apl-qc-core-app-f5a3e`, `REVIEW_LOGIN_ENABLED=true`, exact HTTPS `REVIEW_ORIGIN`, no SQL env/secrets/attachments. Enable only after tests pass. Existing UI requires no Firebase SDK.
5. Verify live Hosting `/review-api` routes and profile/restore/logout. Keep chats/votes/attachments labelled local simulations.
6. Recheck SQL target: project `apl-qc-core-app-f5a3e`, instance `qc-core-db`, connection `apl-qc-core-app-f5a3e:asia-south1:qc-core-db`. Only after persisted Firestore roster and live login pass, disable its deletion protection and delete that instance as authorized. Inspect retained SQL backups and obsolete QC Core SQL secret before scoped cleanup. Do not delete any other instance or project.

## Local commands

`cd review-backend; npm ci; npm test` runs current contract/proxy/disabled-entry checks. `npm start` defaults to login disabled. `.env.example` has no SQL credentials. Java/Firestore emulator and authorized ADC must be configured for real integration testing. Earlier SQL scripts and tests are historical tools under `legacy:*` commands; their prior results are not Firestore results. Production container excludes SQL source and PostgreSQL dependencies.

## Current blocking boundary

Firestore creation denied. SQL deletion deliberately pending verified migration; SQL continues to incur its existing charges until deletion. No claim of completed migration, shared chat or working live authentication is warranted yet.

## Subsequent explicit SQL deletion authorization

The owner explicitly requested deletion before Firestore provisioning. Verified exact connection name apl-qc-core-app-f5a3e:asia-south1:qc-core-db and 42 unique reviewers in the ignored local roster. Deletion protection was disabled successfully; the delete request was accepted and is processing. Firestore remains permission-blocked; live login remains disabled. Backup inspection returned permission denied, so retained backup state is unverified. No employee-project commands were issued.


Deletion completed successfully: gcloud returned exit 0 and confirmed deletion of projects/apl-qc-core-app-f5a3e/instances/qc-core-db. The instance is deleted; prior paragraphs describing SQL as retained are superseded. Retained backup inspection remains permission-denied and no claim of zero residual backup charges is made.

