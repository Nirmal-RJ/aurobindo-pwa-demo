# SQL restoration — 10 November 2026

The owner superseded the Firestore decision and selected standalone PostgreSQL again. All cloud inspection is restricted to `apl-qc-core-app-f5a3e`. No employee project, database or F: checkout was accessed.

## Permission preflight

Verified current caller permissions: cloudsql.instances.create/update/connect, cloudsql.users.create/update, run.services.update. Project IAM policy changes and Secret Manager version access were not granted by the permission test. The dedicated runtime identity has no project IAM role bindings in the current policy.

Do not recreate a billable SQL instance until the runtime connection/secret permission plan is resolved. The previous `qc-core-db` remains deleted. A prior project-wide backup list returned empty. The approved 42-reviewer private local JSON is retained.

Required runtime identity: `qc-core-review-runtime@apl-qc-core-app-f5a3e.iam.gserviceaccount.com`.
- Grant `roles/cloudsql.client` in QC Core only.
- Once a NEW restricted-runtime database credential secret exists, grant `roles/secretmanager.secretAccessor` on that specific secret only. The old SQL admin secret must not become the runtime credential.
- The SQL user itself must have only reviewer roster SELECT, session SELECT/INSERT/UPDATE and audit SELECT/INSERT; no roster changes, DDL or employee access.

Creating SQL alone does not solve these identity permissions. No switch to the broad Editor compute identity has been made.

## Local restoration

- `src/main.mjs` uses PostgreSQL again. No credentials defaults to disabled login; explicit enabled mode requires a private connection string. Production checks pre-provisioned schema and performs no DDL.
- PostgreSQL driver is a production dependency. Firestore dependency and source remain development-only historical migration work; excluded from the production upload/container.
- Restored SQL test/fixture commands. `.env.example` contains no actual credential and defaults login off.
- Login/session HTTP contract and existing frontend/games are unchanged. Secure production cookie, recovery tokens, stale guards and transient-failure handling remain in place. Direct TLS verifies certificates; Cloud SQL socket transport should use its authenticated connector with no pg TLS flag.
- No cloud creation, deployment, Git push or production data change in this restoration turn.

Validation results are appended below after execution. Earlier Firestore and SQL provisioning documents describe historical states and are superseded by this file.

## Verified restoration results

- Isolated PostgreSQL/API suite: 5 tests passed, no failures.
- Actual finished review UI passed in Edge and WebKit against the real local SQL backend through the same-origin proxy: allowed/denied IDs, server profile and roles, reload/reopen, cookie/bearer recovery, outage/retry, logout revocation, stale identity guard, access revocation and small-screen layout.
- Restricted SQL role denied roster writes and DDL; actual login/recovery/renewal/logout/audit succeeded. Production entrypoint started without DDL and set Secure cookie.
- No billable cloud resource recreated, no deployment or push. Runtime Cloud SQL Client/secret access remains the deployment prerequisite. These are browser-engine results, not physical-device certification.

