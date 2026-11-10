# QC Core review frontend

**Current status:** the frontend and login-disabled API are live in QC Core. The owner now selected QC Core's own Cloud SQL instance and independent reviewer roster; no employee-project database dependency is permitted. See `review-backend/STANDALONE.md` and `deployment/qc-core/STANDALONE_STATUS.md`. Earlier cross-project plans below are superseded. Live login stays disabled until own schema/roster/runtime access is ready; chats are still local simulations.

The existing Employee-ID-only login is connected locally to the copied `review-backend/` through the development server's same-origin proxy. **Nothing is deployed.** The frontend uses relative `/review-api/login`, `/review-api/me` and `/review-api/logout` endpoints. GitHub Pages has no proxy for them, so live sign-in there still requires authorized hosting/routing.

See [local setup and verification](../review-backend/LOCAL_INTEGRATION.md). `npm run dev:fixture` inside `review-backend/` opens the finished frontend with real authentication against an independent disposable database containing synthetic accounts. A normally configured backend can instead be connected by setting `REVIEW_API_TARGET` on `node server.mjs`. With no configured/available backend, API routes return uncached JSON 503 and the UI offers retry; it never substitutes fake login.

## Authentication and identity

- The form asks only for Employee ID. The server decides the account, name and role; allowed authenticated roles are ghost and director. There are no hardcoded valid employee IDs or extra password/OTP fields.
- Startup restores with `/review-api/me` before opening the review area or deciding to show login. Cookie-only sessions work. The recovery token is stored only under `qsl-review-session-v1` in localStorage; it is never shown in UI or URLs or returned by the session adapter to UI callers.
- Requests use same-origin credentials and no-store caching, with a 12-second timeout. There is no heartbeat or login polling. The server owns 90-day expiry and renewal during use; the browser does not invent a renewal schedule.
- Protected 401/403 responses discard rejected credentials and lead back to login. Network failures, timeouts, rate limits and service errors preserve credentials and allow explicit retry.
- Logout calls the server and clears the saved recovery token only after success (or rejection of that credential). Failed logout keeps the session and offers Retry logout. Profile shows the real server-returned employee ID/name with a local initials avatar; the contract has no profile photo.
- Session request versions and token snapshots prevent older restores, logins or logouts from replacing newer identity. Other-tab token changes invalidate the mounted review context. Browser-history restoration rechecks the session.
- Employee-ID-only sign-in identifies a claimed account. It is the approved model and is not proof of the person's identity. No stronger requirement was silently added.

## Chat remains a separate local demo

**Authentication does not turn the chat preview into shared conversations.** No message, attachment, reaction, vote or discussion endpoint is connected. Only the three authentication endpoints are requested.

The UI retains its Chat demo/local-only label. Demo participants are fictitious and separate from the signed-in Profile identity. The desktop Demo participant picker only previews sample participants matching the server role; it cannot grant RC access to a director. The server role determines available review spaces. Public homepage games stay accessible independently of the review service; RC entry is shown only after a verified ghost restore.

Local chat messages, votes, read cursors and settings use the existing demo storage. Screenshot bytes remain in IndexedDB. Existing data is not sent to the authentication API or promoted into real feedback. Local drafts remain separate by demo participant, room and topic.

## Existing preview behavior

- Global and RC open compact discussion tiles: General Discussion pinned first, then Match It, Blast It, AB Express, Solvent Master, Rocket'ier and My Carz (newest to oldest).
- Directors see Global only; ghosts can open both spaces. General Discussion has separate local conversations in each space and no game-voting panel.
- Text, replies, screenshots, sending/failure/retry, unread counts and older-message loading remain browser-local. Scrolled-up readers get a new-message indicator instead of being moved. Read badges glow/pulse and clear when read.
- Reactions are thumbs up, thumbs down, tick and heart. Tapping a reaction count shows who reacted and supports removing your own reaction. No hover is required.
- Discuss in RC creates a local reference card and comment, with View original back to Global. Nothing posts back to Global automatically.
- Review & votes opens individual votes and voter details grouped into Approved / Changes requested. There is no final release approval or tracked-feedback workflow.
- Full-row swipe reply, keyboard shortcuts, screenshot zoom/gallery, paste/drop and per-topic drafts remain. Mobile chrome is compact; no overflow/admin menu is shown. Desktop-only local development tools never change backend data.

## Files

- `session.js`: copied-backend contract, relative auth requests, private recovery-token persistence and stale-response guards; no external-checkout imports.
- `session-gate.js`, `session-status.css`, `entry.js`: restore-before-entry, error/retry and session invalidation.
- `login.html`, `login.css`, `login.js`: existing single-field UI and login/session-restore behavior.
- `profile.html`, `profile.css`, `profile.js`: real authenticated identity and server logout.
- `api.js`, `mock-api.js`, `mock-data.js`: explicitly local discussion-preview provider; no chat HTTP requests.
- `app.js`, `components.js`, `directory.js`, `interactions.js`, `drafts.js`, `image-viewer.js`, `icons.js`, `reactions.js`: existing local presentation/controls.
- `contracts.d.ts`: separate authenticated-session and local-preview contracts.
- `BACKEND-CONTRACT.md`: implemented authentication contract and pending shared-chat boundary.

## Verification

Set `AB_PLAYWRIGHT` to the installed Playwright module path and `AB_WEBKIT` to the WebKit executable, and run the frontend server on port 4174. These tests intercept synthetic authentication responses; they do not use a deployed backend or production accounts:

- `node tests/review-session.browser.cjs`: session request contract, token handling, errors, timeout and identity races in Edge/WebKit.
- `node tests/review-auth.browser.cjs`: single-field UI, restore, real Profile identity, logout retry, director restrictions and startup retry.
- `node tests/review.browser.cjs`: existing local chat/review interactions behind explicit test auth.
- `node tests/review-directory.browser.cjs`: directory/history/role navigation.
- `node tests/review-profile.browser.cjs`: authenticated Profile layout and preserved local drafts.
- `node tests/review-stale-response.browser.cjs`: isolated local-demo view-race regression with a test-only participant override. Actual server-role restrictions are verified separately in review-auth.
- `node tests/review-swipe.browser.cjs`: full-row gestures, native Chromium touch and WebKit pointer intent.

The real finished-UI/SQL/API suite is `npm run test:actual-ui` in `review-backend/`; it does not fabricate authentication results. The older intercepted tests above remain focused contract/UI regressions. Physical iPhone/Android and production Firebase/cookie routing remain pending. No employee app, production data, infrastructure, deployment or Git push was changed. Authentication can recover with cookies when localStorage is blocked; the separate local chat demo still requires browser storage.
