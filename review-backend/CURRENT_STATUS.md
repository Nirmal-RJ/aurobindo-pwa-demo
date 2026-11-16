# Current review database decision — 10 November 2026

**Selected database: standalone Firestore**, project `apl-qc-core-app-f5a3e` only. This supersedes SQL_RESTORATION.md and previous alternating database decisions. The SQL instance is deleted; the last successful project-wide SQL backup query returned no backups. Do not recreate SQL.

## Current verified state

- Firestore runtime, production container dependencies and build allowlist restored. SQL stays historical development tooling and is excluded from production runtime source upload/container.
- Six local tests pass: store contract, HTTP adapter, disabled production startup, same-origin proxy and auth cache bypass. Store tests use an explicitly synthetic transactional double, not a real Firestore database. Real Firestore/browser end-to-end verification is pending.
- Cloud inspection returned no Firestore databases and no project role bindings for the dedicated runtime identity. Nothing deployed or pushed in this turn; no cloud resources created.
- Approved 42-reviewer roster remains in ignored local private JSON. No employee project, database or F: checkout is used.

## Required administrator setup

In `apl-qc-core-app-f5a3e` only:
1. Create `(default)` Firestore database, Native mode, Standard edition, location `asia-south1` (Mumbai). Keep client access locked; do not use test-mode rules.
2. Grant `roles/datastore.user` (Cloud Datastore User) to `qc-core-review-runtime@apl-qc-core-app-f5a3e.iam.gserviceaccount.com`.
3. Provisioning operator must have approved Firestore document read/write access. A role on a human account does not apply automatically to the runtime service account.

## After setup

Deploy deny-all browser rules from `firebase.firestore.json`; import/verify all 42 approved identities with `npm run provision:firestore`; test real Firestore transactions, login/recovery/renewal/revocation and actual UI in Edge/WebKit; then deploy/enable only the verified backend with exact same-origin API routing. Production must not contain SQL connection credentials or use an emulator. No passwords/OTP added. Chats, votes and attachments remain simulated.

Login stays disabled until verified roster and runtime access are ready. Earlier SQL/browser test results do not establish Firestore readiness. See FIRESTORE_MIGRATION.md for adapter design and provisioning safety details; its historical SQL-preservation prerequisite was superseded by the owner's explicit completed SQL deletion.

## Local verification completed

10 November: real Firestore emulator transactions and finished UI passed in Edge and WebKit, including stale identity responses, recovery, outages and revocation. Client read denied by rules. See LOCAL_FIRESTORE_TESTING.md for results and repeat commands. Earlier statements that real emulator/browser tests are pending are superseded; cloud runtime/Firestore setup is still pending. No cloud access, deployment or push in this local-testing turn.


## Cloud database now verified

Owner reported database creation. Read-only verification confirms projects/apl-qc-core-app-f5a3e/databases/apl-core-chat-app, Standard, FIRESTORE_NATIVE, asia-south1. Production/provisioning code and rules deployment configuration now target this existing named database; no replacement default database is needed. The emulator suite continues to use its isolated demo project's default database. Runtime project-role inspection still returned no bindings. No roster import, rules deployment, live service change or push in this verification turn.


## Live login released

10 November: runtime role verified, all 42 approved reviewers imported/verified, client rules locked, Firestore backend deployed to revision aurobindo-review-api-00003-weq at 100 percent. Actual hosted login/recovery/logout passed Edge and WebKit. Earlier missing-IAM and live-login-disabled statements are superseded. See deployment/qc-core/FIRESTORE_LOGIN_RELEASE.md relative to repository root. Chats remain simulated. No Git push or employee-project change.

