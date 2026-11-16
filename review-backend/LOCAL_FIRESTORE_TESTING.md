# Local Firestore verification — 10 November 2026

## Results

Real Firestore Emulator v1.22.0 / Java 21, with synthetic reviewers, passed against the finished UI in Edge and WebKit. No cloud database, human Google credentials, production identities, employee project or cloud IAM was required. Emulator project is `demo-qc-core-review`; script refuses to run without an IPv4 loopback emulator host. Emulators shut down successfully after the suite.

Verified real transactions: denied IDs/role mismatch; hash-only stored credentials; bearer precedence over cookie; daily renewal; concurrent renewals; concurrent idempotent logout and one audit event; expired and revoked sessions rejected.

Verified actual frontend through same-origin proxy: Employee-ID-only field, denied accounts, server-returned profile/role, reload/reopen, cookie-only restoration, bearer recovery of missing cookie, blocked cookies/storage, outage/retry credential retention, logout/retry and revocation, cross-tab delayed ghost response after director login discarded, blocked account enforcement, RC hidden for director, 320/390/1440 viewport overflow checks and no browser runtime errors.

Direct unauthenticated Firestore REST read returned 403 under deny-all client rules. Existing home and three game entry pages returned 200; this is serving verification, not complete gameplay regression. Chats/votes/attachments remain simulated. Browser engines were tested, not physical phones. Production runtime IAM, actual cloud database and live deployment remain unverified and unchanged.

Screenshots: ignored `review-backend/scratch/actual-ui/edge-login.png`, `edge-profile.png`, `webkit-login.png`, `webkit-profile.png`.

## Repeat locally (PowerShell)

From `review-backend`:

```powershell
npm ci
# Java 21+ required. The local isolated runtime used for this run:
$env:JAVA_HOME=(Resolve-Path scratch/java21/jdk-21.0.13+9-jre).Path
$env:PATH="$env:JAVA_HOME/bin;$env:PATH"
$env:REVIEW_PLAYWRIGHT_MODULE='C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'
$env:REVIEW_WEBKIT_EXECUTABLE='C:/Users/Admin/AppData/Local/ms-playwright/webkit-2359/Playwright.exe'
npm test
npm run test:firestore:ui
```

Use an installed Java 21+ location instead if the ignored scratch runtime is absent. Use your installed Playwright module/engine paths if different. Firebase CLI is installed globally; first emulator launch downloads its runtime. No Firebase login/deployment or real API credential is needed for this demo project.

This new suite replaces the old SQL UI suite for current Firestore verification. `legacy:*` scripts describe historical SQL behavior and are not the current backend.
