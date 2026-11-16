> ACTIVE DECISION: Firestore. See review-backend/CURRENT_STATUS.md relative to repository root. Previous SQL plans below are historical.

> CURRENT 10 November: SQL selected again. Runtime code restored; cloud recreation held pending runtime IAM/secret access. See review-backend/SQL_RESTORATION.md relative to repository root. Historical states below are superseded.

> CURRENT: Firestore selected. Database creation was permission-denied; migration and SQL deletion are pending. See review-backend/FIRESTORE_MIGRATION.md (relative to repository root). Earlier SQL evidence below is historical.

# Handoff verification ? 9 November 2026

Before copying to the destination:
- Standalone npm ci succeeded from its own lockfile (14 dependency packages).
- PostgreSQL/HTTP integration test passed: synthetic accounts; allow/deny roles, origin validation, 90-day sessions, hashed credentials, recovery, cookie-only restore, daily renewal coalescing, blocking, expiry, logout, isolated sessions and retained audits.
- Sample frontend browser smoke passed in headless Edge and WebKit: 320/390/1440 widths, login, reload/reopen, delayed identity response, missing cookie recreation, cookie-blocked bearer fallback, storage-blocked cookie fallback, logout; no page errors.
- __session cookie used by the passing copied tests. Actual Firebase forwarding is still a release test, not tested here.
- No production database/cloud calls, publication or push performed.

The checks above describe the original copied sample fixture. Finished-UI integration was subsequently completed in this checkout; see the update below. Physical iPhone/Android, production identity roster/permissions, Cloud SQL connectivity and production Firebase routing are not verified by these tests.

The original node test runner hit sandbox spawn EPERM; rerunning with --test-isolation=none passed. Browser tests ran with approved process permissions.

## Finished review UI, same-origin proxy and independent SQL fixture

On 9 November 2026, `npm run test:actual-ui` passed for both Edge and WebKit using the actual `../review/` frontend, real copied API (`webRoot:null`) and an independently installed disposable PostgreSQL cluster in this checkout. No authentication success/error response was mocked. The copied SQL/HTTP suite also passed in that cluster.

Verified allowed/denied identities, authoritative Profile/role, reload/reopen persistence, missing-cookie recreation, cookie-only/cookie-blocked recovery, storage-blocked Profile persistence, backend outages/retry, server logout revocation, delayed cross-tab identity response guards and access revocation. Proxy/cache tests passed (2 tests), root syntax checks passed, public/game entry files remained served. UI screenshots were reviewed; test clusters were stopped and removed. Detailed cases, commands, limitations and changed files: LOCAL_INTEGRATION.md.

The existing chat demo requires browser storage; cookie-only authentication does not remove that separate constraint. Backend source/policy, approved review UI and game code/assets were not changed. No production data, employee-app checkout, cloud resource, deploy or Git push was used. Live deployment and physical-device checks remain pending.

## Subsequent restricted-runtime fix

The owner then authorized fixing/testing restricted SQL access locally. `store.mjs` now uses a normal identity SELECT rather than FOR SHARE. Production `main.mjs` requires pre-provisioned review tables and no longer applies DDL; an explicit, separate migration command requires its own credential. These source changes supersede the earlier unchanged-backend statement for this subsequent task.

Actual SQL tests connect as a new non-superuser role with SELECT-only canonical-table grants, no schema CREATE privileges, review-session SELECT/INSERT/UPDATE and audit INSERT/sequence USAGE. The former locking query and canonical writes/DDL are denied, while login/recovery/renewal/logout/audit succeed and canonical identity rows remain unchanged. The actual production entrypoint also starts under that role, supports login/logout and sets Secure cookies. Finished-UI Edge/WebKit coverage uses the restricted runtime pool; see RESTRICTED_DATABASE.md. No cloud/live database grants or schema migration was performed.

## Explicit disconnected deployment preparation

With REVIEW_LOGIN_ENABLED=false, the actual production entrypoint starts without database configuration and refuses a supplied database URL. No SQL pool is created. Auth routes return no-store 503 without account/token/cookie creation or false logout success; health explicitly says loginReady=false and databaseConnected=false. Disconnected endpoint/entrypoint and proxy/cache tests passed (4 tests). Child-process checks required elevated execution after a sandbox spawn EPERM; no database/cloud action is part of these tests. Connected-mode code is retained in the normal branch. Deployment is blocked on QC Core build IAM; no employee-project access or deployment was performed.

## Standalone approved roster

After the owner-selected standalone database/schema update, all 42 owner-supplied reviewer identities were validated against the 22/20 policy and preserved exactly in ignored private input. The generated transaction was tested in disposable local PostgreSQL, including login/restore/logout for every reviewer under restricted roster-read permissions and refusal to overwrite an existing roster. QC Core-only managed import and exact server-side row assertions then completed successfully; no other-project query, administrator-secret read or live API enablement was involved. Import objects, temporary bucket grant and bucket were removed. See deployment/qc-core/ROSTER_PROVISIONING.md for operation IDs and verification limits. Live runtime login remains disabled.
