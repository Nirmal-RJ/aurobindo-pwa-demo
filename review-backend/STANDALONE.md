> ACTIVE DECISION: Firestore. See review-backend/CURRENT_STATUS.md relative to repository root. Previous SQL plans below are historical.

> CURRENT 10 November: SQL selected again. Runtime code restored; cloud recreation held pending runtime IAM/secret access. See review-backend/SQL_RESTORATION.md relative to repository root. Historical states below are superseded.

> CURRENT: Firestore selected. Database creation was permission-denied; migration and SQL deletion are pending. See review-backend/FIRESTORE_MIGRATION.md (relative to repository root). Earlier SQL evidence below is historical.

# Standalone QC Core — current architecture

Owner decision, 9 November 2026: QC Core must own its database and reviewer identity data. **Do not access or depend on the employee project, its database, its local checkout or its account tables.** This supersedes the previous cross-project plan and all proposed old-project grants in historical handoff documents.

## Own cloud resources

- Project: `apl-qc-core-app-f5a3e`.
- Cloud SQL instance: `qc-core-db`, PostgreSQL 17 Enterprise, `asia-south1`.
- Database: `qc_core` (creation result recorded after provisioning).
- Connection name: `apl-qc-core-app-f5a3e:asia-south1:qc-core-db`.
- Starter configuration: db-f1-micro shared-core, zonal, 10 GiB SSD, automatic disk growth capped at 20 GiB, seven daily backups, seven-day point-in-time recovery, deletion protection.
- Connector enforcement REQUIRED, encrypted-only connections, no broad authorized networks. Use a Cloud SQL connector/attached-instance connection when runtime access is later configured.

Shared-core is a small initial reviewer/testing configuration with no shared-core SLA and no high availability. It has recurring compute/storage/backup costs even while review login is disabled. Measure the actual workload before enabling shared chat or increasing traffic; resizing/HA is a separate decision. Deletion protection is intentional; do not remove the instance as routine test cleanup.

## Own identity schema

All backend identity/session queries use QC Core's own schema:

| Table | Purpose |
|---|---|
| `review_auth.accounts` | Employee ID, name, ghost/director role, allowed/blocked status |
| `review_auth.sessions` | Hashed review-only sessions and recovery credentials |
| `review_auth.audit` | Review login/logout audit history |

No email join, employee-project eligibility flag, `public.accounts`, `employee_access` or cross-project call is required. An Employee ID is only a claimed identifier in this approved login model. The existing approved 22-ghost/20-director ID policy remains in policy.mjs until the owner explicitly changes it; roster rows must also exist locally, be allowed, and match that role policy. Merely guessing an allowlisted ID does not create a roster account.

New roster rows default to blocked. No real roster is imported from another project. No fake reviewer names or test accounts are inserted into the live database. The owner must supply an approved Employee ID/name/role list before sign-in is enabled. Revocations and name/role updates are managed independently in QC Core; they do not synchronize with another application.

## Restricted runtime and migrations

The future runtime SQL role needs SELECT on `review_auth.accounts`, SELECT/INSERT/UPDATE on sessions, INSERT on audit and USAGE on its ID sequence. It cannot edit the roster, create schema objects or delete audit history. Migrations/roster administration use a separate approved administrative identity. Production runtime applies no DDL.

The schema targets a fresh standalone database. It explicitly refuses legacy foreign keys pointing outside the standalone roster/session tables. Do not rewrite or migrate the old employee database to support this app.

## What is ready vs pending

- Local runtime/schema/tests now use standalone tables only. Real browser E2E uses a restricted role in an independent disposable PostgreSQL fixture.
- New Cloud SQL instance/database provisioning status, security settings and any admin-secret setup are recorded in deployment/qc-core/STANDALONE_STATUS.md as verified.
- Live backend stays in explicit login-disabled mode until own schema, approved roster, own runtime identity grants/secret and connector configuration are ready and tested. No other project's credentials will be reused.
- Frontend UI and games are unchanged. Chat/votes/screenshots remain browser-local simulations, not shared data. Existing external report/video links are not database dependencies and were not changed by this task.

## Local tests

- `npm run test:sql:isolated`: disposable local SQL, schema idempotency, blocked defaults, role mismatch/revocation, sessions and disconnected/proxy regressions.
- `npm run test:actual-ui`: actual same-origin frontend/API in Edge and WebKit with restricted SQL role and no employee tables.
- `npm run dev:fixture`: synthetic standalone local roster for manual preview, never live data.

No production roster, database password, session token or private key is stored in frontend files, documentation or Git.
