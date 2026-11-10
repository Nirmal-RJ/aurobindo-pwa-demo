# Game review frontend handoff â€” 2026-11-08

## Delivered locally

- Isolated vanilla-module review page; only existing-app change is a footer link to `review/index.html`. Existing game sources, gallery links, homepage actions and service workers were not modified.
- Mock accounts for ghost testers, directors and core team. Global available to all sample accounts; RC and Discuss in RC appear only for ghosts. This is a frontend simulation, not authentication or secure privacy.
- Build-specific Global/RC conversations, authors/illustrated demo profile images, timestamps/date separators, text, screenshots/lightboxes, replies, reactions and unread counts.
- Recent history first; older-message pagination preserves visual position. Incoming messages keep a scrolled-up viewer in place and expose a jump indicator. Near-bottom viewers stay at the bottom. No polling, API calls or game-package downloads.
- Discuss in RC posts a reference snapshot (author, timestamp, original text, build, attachment previews) with a required comment. View original navigates/highlights Global. RC replies are never automatically copied back.
- Independent per-build individual votes, voter details/totals, feedback statuses and final approval record. Final approvers default to none; local development settings explicitly configure accounts. New demo builds start empty and unapproved.
- Simulated sending/failure/retry, preserved message IDs on retry, localStorage message/review persistence and IndexedDB screenshot byte records. Interrupted sends become retryable after reload.
- Localhost-only reset/failure/incoming/build/approver tools. Reset targets only this feature's storage.
- Responsive layouts with VisualViewport height/offset handling for a mobile keyboard, native image previews and lightweight state transitions. Screenshot lightboxes do not replace an in-progress RC comment dialog.

## Verification

- `node tests/review.browser.cjs`: Edge and WebKit passed account/room previews, recent/older history and scroll retention, new-message indicator, screenshots, replies, reactions, all main reference flows, voting/configured final approval, retries, saved state, empty builds, long unbroken messages, 320px width and a 360px-tall keyboard-sized viewport. Nested screenshot preview preserves the RC comment draft.
- `node tests/review-api.cjs`: 25 adapter invariants passed, including room-access simulation, stable history, attachment byte persistence, nonduplicating retry, all four statuses, vote/final separation, and independent new-build state.
- WebKit-specific fixes verified: store screenshot bytes rather than native File objects in IndexedDB; clip the file-input hit area; use explicit native select appearance for readable account/build controls.
- Development reset was exercised in Edge: seeded review state restored; an unrelated game-storage sentinel remained intact.
- Network assertions: review uses only its own static resources and app favicon, with no external/backend/game-package requests.
- Existing app: mobile homepage/footer entry and return, public game gallery links and width passed. `tests/match-it-blast-it.exit.cjs` passed gallery entry/return in Edge and WebKit. `npm run check` passed; AB Express's 7 tests and Rocketier's 50 tests passed. This is targeted regression coverage, not a complete physical-device playthrough of every game.
- Desktop, mobile, footer and WebKit screenshots reviewed under `artifacts/review-*.png` (local verification artifacts).

## Awaiting backend / limits

Real sign-in, server-enforced memberships and RC privacy, cross-device chat/unread state, authorized file uploads, durable history, moderation/audit, notifications and release permissions require the backend adapter. No backend integration, credentials, deployment, commit or Git push was performed. Physical iPhone/Android keyboard and device testing remains pending.

## Changed files

- `index.html`: existing footer gains Game review link.
- `review/index.html`, `review/review.css`: independent shell/styles.
- `review/app.js`, `review/components.js`: UI and reusable components.
- `review/contracts.d.ts`, `review/api.js`: typed contracts and replaceable provider.
- `review/config.js`, `review/mock-api.js`, `review/mock-data.js`: demo-only configuration, adapter and fixtures.
- `review/README.md`, `review/BACKEND-CONTRACT.md`, `review/PROGRESS.md`: local testing, integration contract and verification record.
- `tests/review.browser.cjs`, `tests/review-api.cjs`: targeted checks.

## Follow-up - Public Games-only picker

- Review catalog now mirrors the five active public Games cards: My Carz, Rocket'ier, Solvent Master, AB Express and Match It, Blast It. Internal/disabled games are excluded; existing builds remain under their public game.
- Existing local saves receive missing public-game demo builds without clearing conversations, votes or screenshots. Unknown/internal saved builds are hidden rather than deleted. Unsupplied versions are labeled Review build A.
- Edge and WebKit compared the picker directly with the public gallery and passed migration checks retaining all 45 seeded messages and two sample votes. No push.

## Follow-up - Homepage Game Review action

- Moved review entry from the footer into a matching mint activity button directly below Coming Soon. Order is App Report, Games, Coming Soon, Game Review. Uses existing activity-list sizing and responsive styles. No push.

## Follow-up - RC Chat action and bottom spacing

- Added matching RC Chat action below Game Review. Ghost demo accounts enter RC directly via room=rc; directors/core-team accounts have the action hidden and direct RC URLs fall back to Global. Visibility is a frontend preview, not authorization.
- Added lightweight home-entry module with saved-account visibility refresh on page show/storage changes. Reduced homepage footer padding and extended its background to the viewport to remove the bottom color seam. Existing gallery/game routes preserved.
- Edge and WebKit passed homepage order, 320/450/1280 widths, direct RC entry, director/core exclusion and compact footer checks. Reviewed 450px screenshot. No push.

## Follow-up - Game names only in selector

- Renamed Game & build to Game. Picker has exactly one option per public game with no version text or duplicate build entries. Selecting a game resolves its latest available demo build; stored build-specific history and approval records remain intact.
- Edge and WebKit passed exact five-option labels and switching to AB Express and back to Match It, Blast It. No push.

## Follow-up - Discussion directory before chat

- Global and RC now open independent discussion directories. Five public-game cards use existing lazy-loaded poster images with readable names; General Discussion is last with a distinct speech-bubble illustration. No version dropdown remains. Selecting a card opens chat; Back/All discussions and room navigation return to the appropriate grid. Browser history and conversation deep links work.
- Added independent General Discussion scopes for Global and RC. They support messages, attachments, replies, reactions and Discuss in RC/View original, but no game feedback/voting/final-approval panel. Existing build conversations and approvals are retained.
- Directory unread badges do not mark chats read. Directory scroll positions are preserved; each poster keeps native proportions. No game scripts/audio/videos/packages are fetched.
- Added directory component, scope type/contract notes, design references and directory tests. Updated existing full-flow/home tests for the new navigation. Local only; no backend integration or push.

### Directory verification

- Edge and WebKit passed the updated complete chat/review workflow, the six-card directory, browser Back/Forward, separate Global/RC General Discussion, RC reference/original navigation, reload persistence, role restrictions, and responsive card bounds at 320/390/768 widths. Homepage Global/RC entry tests passed in both engines.
- Adapter checks passed with six additional General Discussion invariants: independent storage/delivery, no fabricated game build and rejection of votes/final approval/game feedback. Existing game/build votes and conversations were retained.
- Final desktop and 320px WebKit screenshots reviewed. Poster images preserve aspect ratios. No physical iPhone/Android verification, backend connection, deployment or Git push.

## Follow-up - Distinct Global and RC visual identity

- Applied teal/mint Global and amber/warm RC palettes across directories, navigation and chat views. Added clear text/symbol room badges and membership labels, with a desktop space badge and compact mobile chat label. Color is not the only differentiator.
- Chat header now includes the selected game thumbnail alongside its name; General Discussion uses a conversation icon. Global snapshots inside RC keep their distinct teal source card. Existing navigation, permissions and review state remain.
- Edge and WebKit passed full chat/review and directory workflows including attachments, reference/original, retries, approval state and the shortened keyboard viewport. Additional visual checks passed at 320/390/1440 widths for both spaces. Reviewed desktop Global/RC and 320px WebKit RC screenshots. No physical-device test or push.

## 2026-11-08 - Messenger controls and product polish

- Added consistent local SVG action icons, comfortable control hit areas, clear disabled/busy states, contextual message/reaction sheets, right-click/long-press actions and swipe-right reply with vertical-scroll/selection/edge guards.
- Added keyboard message navigation, reply/reaction/action shortcuts, controls help, IME-aware sending and touch Return behavior. Native mobile review modal traps focus; focus survives message/vote updates and returns after dismissal.
- Drafts persist per demo account, space and topic, including attachment/reply references. Paste/drop screenshot preparation and submit operations guard against navigation races. Reset removes drafts without pagehide recreating them.
- Screenshot viewer supports gallery navigation, zoom/Fit, panning, local download and fitted-image swipes. Keyboard-height layouts preserve composer visibility. Global/RC identity and approved game/catalog/home navigation remain.
- Edge and WebKit passed the complete review workflow and dedicated controls checks: roles, references, replies/reactions, screenshots, retry, voting, history scroll, drafts, paste/drop, keyboard, modal focus, touch-intent simulation and shortened keyboard viewport. Mobile screenshots reviewed. Physical iPhone/Android gestures and keyboards remain unverified. Backend remains simulated; no deployment or Git push.

- Final Edge/WebKit directory tests passed after interaction changes. Reviewed the finished 1440px desktop chat and 390px message-action sheet. Confirmed reset clears drafts without restoring them on pagehide. Syntax checks and Git whitespace checks passed.

## 2026-11-08 - Discard stale chat responses before mutation

- Confirmed incoming refresh appended to `loaded`, and reaction/delivery refresh replaced `loaded`, before the navigation-token check. A delayed RC response could therefore contaminate a director's Global message state and appear on a later render.
- Added a shared account/room/build/request-version snapshot and validator. Refreshes fetch into temporary results and validate identity, scope and version before changing `loaded`; mismatched response scopes are also rejected. Stale errors are ignored. Initial/older history requests use the same context guard, and changing chats clears the previous list while loading.
- Added `tests/review-stale-response.browser.cjs` with a test-only delayed adapter. Reproduced the pre-fix failure; Edge and WebKit now pass delayed RC incoming, reaction and delivery responses released after switching to a director's Global chat. A subsequent Global update confirms its history remains intact and no RC data renders. Production code has no test hooks.
- Backend RC authorization remains an independent requirement. Local frontend change only; no deployment or Git push.
- Full existing review workflow also passed in Edge and WebKit after the fix: roles/rooms, history and scroll, unread, attachments, replies/references, voting/approval, retry, persistence, empty builds and mobile viewport checks. Syntax and whitespace checks passed.

## 2026-11-08 - Employee-ID-only review login

- Added a standalone branded login page with Employee ID as the only input. No password/name/email/role field. Review entry redirects unsigned demo tabs to login before mounting the chat UI; safe return navigation restores the intended topic and preserves RC role restrictions.
- Added a replaceable `loginEmployee` adapter operation with four clearly fictitious employee-ID mappings, per-tab demo session and sign-out preserving review/game data. Existing demo role switcher remains available for role previews. This is not secure authentication or a backend integration.
- Edge and WebKit passed login validation, normalized IDs, reload/session behavior, sign-out, ghost/director/core entry, safe return paths and narrow mobile bounds. Reviewed the 320px WebKit login screenshot. Delayed RC incoming/reaction/delivery regressions also passed in both engines after entry changes. No push or deployment.

## 2026-11-08 - Employee profile and logout

- Added a Profile entry in the review header and a standalone profile page showing the current employee's ID and name from the account adapter. No editable profile fields or invented employee data. Existing fictitious account data remains explicitly labeled as demo data.
- Moved logout into Profile, preserving the compact mobile header. Back to review restores the originating conversation; profile navigation flushes drafts before leaving. Demo account changes synchronize the session marker. Logout removes only the demo session, retaining review data and game progress.
- Profile and review entry recheck the session on browser history restoration. Direct unsigned profile access goes to Employee ID login; safe return paths now allow the local profile page as well as review.
- Edge and WebKit passed profile identity/account-switch, login/logout, preserved drafts/data, direct unsigned access and responsive bounds at 320/390/1280 widths. Profile mobile screenshot reviewed; syntax and whitespace checks passed. Frontend simulation only; no backend integration or push.


## 2026-11-09 - Compact mobile Global and RC headers

- Reduced the mobile top bar to 54px with a single aligned brand/account/Profile row. The Demo account label remains accessible without taking a separate visual row. Retained a compact 24px simulation/local-data notice.
- Moved Controls into the mobile room toolbar while retaining its original desktop location; Global/RC, Profile, account selection and Controls retain usable touch areas. Removed the redundant mobile All discussions action because the chat header already provides Back.
- Reduced directory heading/padding and hid repeated mobile kicker, introductory description and footer instruction. Chat headings also omit repeated audience descriptions. Both room palettes remain distinct; desktop layout is unchanged.
- Edge and WebKit passed Global/RC directory and conversation checks at 320/390/430px: first game card starts above 190px, no horizontal overflow, Controls opens, back navigation works and the 844px viewport leaves over 400px for messages. Reviewed 320px Global and 390px RC screenshots. Physical-device testing remains pending. Local only; no push.


## 2026-11-09 - Simplified mobile header hierarchy

- Replaced the mobile account-heavy header and cream preview band with one calm brand/Profile row and a small visible Demo/local-only subtitle. Global/RC navigation uses the existing room palette with a single More menu.
- Moved the demo account switcher and Controls into the mobile More menu; localhost-only development tools remain grouped within it. The menu itself stays available outside localhost so account/help controls are not lost when development tools are hidden. Desktop controls return to their original containers at the breakpoint.
- Edge and WebKit checked both spaces at 320/390/430px, menu account switching/help, no overflow, card top below 180px and desktop restoration. Reviewed the revised 390px Global screenshot. WebKit breakpoint restoration was confirmed after waiting for its asynchronous media-query event. Physical-device testing pending; no push.


## 2026-11-09 - Review action, desktop space and compact voting summary

- Renamed the unclear Build review control to Review & votes, replaced the external-link arrow with a local checklist icon and kept its label on one line with a 44px target. Global/RC checks passed at 320/390/430px in Edge and WebKit.
- Desktop now uses a 56px header, 180px navigation rail, compact conversation heading and no separate preview band. The visible brand subtitle retains the demo/local-only disclosure. Review details open on demand on all screen sizes instead of permanently consuming the right column. At 1280x720 both engines measured a 1100x472 message viewport; at 1600x900 it was 1420x652.
- Replaced the long review sidebar with a compact centered summary: game/build identity, two individual-vote choices, totals, expandable voter details, independently configured final release approval and four feedback counts in a two-column grid. Short explanatory copy keeps individual votes distinct from release approval. Default unconfigured approval remains disabled. Close is a labeled X button.
- Edge/WebKit verified the default review summary fits without internal scrolling at 320x568, 390x667, 430x844 and 1280x720. Voting state, voter details and closing worked. Reviewed the 320px WebKit summary and 1280px desktop chat screenshots. Optional expanded voter content and unusually short keyboard viewports retain overflow recovery instead of clipping. Physical devices unverified. No push/deployment.


## 2026-11-09 - No final release approval

- User clarified there is no final release approval step. This supersedes the initial feature brief and earlier progress entries. Removed the release card/action, approval modal, approver configuration control/handler, mock API operations, typed contracts, seeded approval state and unused release/permission styles. Removed the final-approval disclaimer; the panel now covers only individual votes, voter details and feedback counts.
- Existing saves discard obsolete approval/configuration fields while retaining messages, votes, build history, read state and account selection. Updated current integration/design/testing docs to remove the obsolete workflow. No backend release-approval integration is expected.
- Adapter checks passed for votes, build isolation, retries, screenshots, RC access and general discussions, including absence of release-approval operations. No push/deployment.


## 2026-11-09 - Remove tracked feedback completely

- User removed Track feedback as unnecessary complexity. Removed the composer checkbox, draft/send tracking state, per-message status selectors, review status-count section, status configuration, API setter, typed status contract and unused styles. Chat, replies, screenshot attachments, reactions and individual votes remain.
- Existing messages and drafts ignore/remove obsolete tracked-status fields while retaining their text, attachments, replies and delivery state. Removed the status workflow from current documentation/backend contract. Previous progress entries describe superseded behavior. Adapter checks passed. Local only; no push/deployment.


## 2026-11-09 - Obvious room switching and vote selection

- Mobile Global/RC choices now share a bordered segmented rail, equal segments and distinct selected surfaces. Both choices remain visibly interactive, with hover/press/focus states, text/icons and existing unread badges.
- Individual votes use green/amber semantic outlines when unselected. Only the current account's actual vote receives a filled surface and explicit Selected/check indicator; no vote is automatically selected for an account without one. Existing saved votes remain intact.
- Edge and WebKit passed room switching, 320px overflow checks, neither-vote-selected initially, choosing Changes requested then Approve with mutually exclusive selected state. Reviewed updated room switch and vote screenshots. Local only; no push.


## 2026-11-09 - Compact discussion tiles

- Replaced large poster/description/action cards with compact image-and-name tiles. Removed repeated descriptions and Open discussion footer rows from the component. The entire tile remains a single accessible link with unread badges and a small navigation chevron. General Discussion remains last.
- Mobile tiles use 88px image areas and ~42px captions; desktop uses 112px image areas with automatic grid columns for a larger catalog. Artwork stays proportional; General Discussion illustration was scaled to fit.
- Edge and WebKit passed both spaces at 320/390/430/1280 widths, six-card names/order, no horizontal overflow and open/back navigation. All six current tiles fit inside the tested 844px-high phone viewport. Reviewed 390px WebKit RC screenshot. No push.


## 2026-11-09 - Remove mobile overflow menu

- Removed the three-dot mobile menu and its dynamic creation/breakpoint relocation code and styles. Mobile room navigation now contains only Global/RC. Mobile demo-switching/help/development controls are no longer exposed; existing desktop demo controls remain in their original containers. Profile and logout remain available.
- Edge and WebKit verified no overflow-menu element is created, mobile room switching works and Profile/logout remain accessible at 320x568. Syntax and whitespace checks passed. No push.


## 2026-11-09 - Prominent unread tile badges

- Unread badges now use bright yellow, high-contrast dark text, a small notification dot and a warm glow in both spaces. A gentle 2.2-second pulse draws attention without flashing or moving the card layout. Reduced-motion mode keeps a strong static glow.
- Edge and WebKit verified animation, 320px tile containment, both spaces and removal of the badge after reading. No unread logic changed. Local only; no push.


## 2026-11-09 - Pin General Discussion and reverse game order

- Both Global and RC directories now pin General Discussion first with a small Pinned badge. Games follow newest to oldest: Match It, Blast It, AB Express, Solvent Master, Rocket'ier, My Carz. The gallery/catalog itself is unchanged; only discussion-grid presentation order is reversed.
- Updated directory ordering assertions and current design/readme notes. Conversation IDs, unread counters, saved messages and compact tile sizing are unchanged. No push.


## 2026-11-09 - Four reactions and visible reactor identities

- Restricted the picker and mock adapter to thumbs up, thumbs down, tick and heart via a shared reactions module. Unsupported legacy reactions are removed on loading a saved demo; remaining messages/votes/reactions are preserved. Updated the typed reaction contract.
- Tapping an emoji count now opens Who reacted with each person's avatar/name and a You marker. The picker offers See who reacted for all groups. The details view allows adding/removing the viewer's own selected reaction; React remains the quick choice control. Desktop names also remain available in the chip tooltip.
- Edge and WebKit passed exact four-choice checks, mobile name visibility, own-reaction removal and multi-person names. Existing full chat workflow checks ran after the change. Local only; no push.


## 2026-11-09 - Compact mobile profile

- Scoped profile-only styles reduce brand spacing, card padding, avatar, title and account-detail gaps. Back to review and Log out retain 44px targets. Employee ID, name and demo disclosure remain visible. Short-height adjustments avoid unnecessary scrolling without changing login styling.
- Edge and WebKit verified no horizontal/vertical page overflow at 320x480, 320x568, 390x667 and 430x844; employee details and logout behavior passed. Reviewed the smallest WebKit screenshot. No push.


## 2026-11-09 - QC Core homepage identity

- Replaced the header's Aurobindo logo/Demo App stack with the gold star and QC Core wordmark matching review branding. Removed the obsolete header PHARMA copy and updated runtime brand accessibility/page titles so language/route initialization cannot restore the old app name. No game media/runtime was changed.
- Homepage CSS v55, app script v32 and root shell v485 refresh the changed header. Original logo asset is retained for other existing references.
- Edge and WebKit passed header/title identity, absence of old header logo/badge, runtime checks and no horizontal overflow at 320/390/1280 widths. Reviewed the 390px WebKit homepage screenshot. No push/deployment.


## 2026-11-09 - Full-row swipe-to-reply

- Extended pan-y/pinch-zoom touch handling to the whole message row so a horizontal swipe starting outside the text/bubble is not cancelled by native browser horizontal panning. Capture the pointer only after horizontal intent; continue tracking swipe progress when the pointer leaves the row.
- Swipe initiation includes padding, author/avatar and screenshots. Direct message-action/reaction buttons and form fields remain excluded. Screenshot taps remain functional; compatibility clicks from completed swipes are suppressed without suppressing a subsequent deliberate tap.
- Matched pointer IDs, retained edge/selection/vertical-scroll guards, reset on cancellation and corrected retracted swipes so falling below the threshold does not reply.
- Added tests/review-swipe.browser.cjs. Edge native touch injection confirmed a blank-row swipe replies. Edge/WebKit pointer checks passed row/body/meta/text/avatar/image targets, retraction/cancellation/vertical intent and normal Reply/screenshot taps. Physical-device testing pending. No push.


## 2026-11-09 - Swipe capture-transfer cancellation fix

- Reproduced the reported automatic cancellation using native Chromium touch starting on message text. The child lostpointercapture event bubbled during the intended transfer to the message row, and the earlier handler incorrectly reset the gesture and released the row capture.
- The handler now resets only when the matching pointer genuinely loses capture from the active row; child transfer events are ignored. Vertical cancellation, pointer cancellation and existing touch/button behavior remain.
- Expanded the swipe regression with native starts on text, metadata and avatar as well as blank space, plus an explicit child-capture-transfer sequence in both engines. Edge native touch and WebKit pointer-intent checks passed alongside retraction, vertical intent, cancellation and screenshot/Reply taps. Physical phones unverified. No push.


## 2026-11-09 - Voter names grouped by decision

- Voter details now has two side-by-side sections: Approved (green) and Changes requested (amber), each with its count and member names. Empty sections show No votes yet. Changing a vote moves the member to the matching section without duplicates.
- Edge and WebKit verified seeded member placement, changing a vote and side-by-side bounds at 320/390/1280 widths. No push.


## 2026-11-09 - Separate review API authentication

- Owner authorized connecting only login, session restore and logout to the locally prepared separate review API. Reused the supplied F:/aurobindo-pwa/apps/review-web/session.js into this checkout and extended it with request-version/token guards for all three operations. No F: files, employee PWA, backend, database or infrastructure were changed. No deployment/push.
- Uses only relative /review-api/login, /me and /logout with same-origin credentials/no-store, the review-only qsl-review-session-v1 recovery-token key, and no token display/logging/URL transport. Startup verifies the server session before opening review/Profile or deciding to show login. Server identity/ghost-director role and expiry are authoritative; no stronger login requirement, polling or heartbeat was added.
- Protected 401/403 clear the rejected session. Network/timeout/429/5xx preserve credentials and show retry. Logout clears only after server success or rejected credentials; transient logout failure retains the token. Profile shows the returned name/employee ID with a local initials avatar.
- Local discussions remain mock-only behind an explicit Chat demo label. Demo participants are separate from the authenticated Profile identity and limited to the server role. No chat endpoint, shared conversations or production data was integrated. Public home remains public, with server-role-based RC entry visibility.
- GitHub Pages has no /review-api proxy; same-origin hosting/routing is pending. Missing routes show an unavailable/retry state, with no invented API origin or fallback fake login. Updated current README/backend contract and auth/profile test fixtures. Earlier frontend-simulated login entries are superseded.
- Edge/WebKit passed 17 session contract/error/race checks each using synthetic responses; login/profile/logout retry and director RC restrictions passed in both engines. Directory navigation and isolated stale local-message response checks also passed. Actual backend cookie/routing integration and physical devices remain unverified.

- Final complete local chat workflow passed in both Edge/WebKit behind intercepted authentication. Updated Profile identity/draft checks, native swipe regression, directory/history tests, isolated stale-response regression and adapter invariants passed. Syntax and whitespace checks passed. No real backend session or production data was used for these checks.

- Owner reiterated preparation-only/no live API boundary. Checked F:/aurobindo-pwa/docs/REVIEW_LOGIN.md read-only and confirmed no employee-PWA endpoint, cross-origin URL, hosting rewrite or deployment was added. The current homepage label Priority/Approval was preserved; its UI test expectation now follows that existing label.

- Public homepage/RC entry validation uses blocked service workers so intercepted authentication cannot be bypassed by the existing root worker. No root service worker or hosting configuration was changed for authentication.

## 2026-11-09 - Copied backend connected and tested locally

- Owner authorized integration entirely inside this checkout. Added optional loopback same-origin proxy to root server; preserved approved UI and game static/range serving. Blocked backend files from static access. Root worker bypasses authentication caches for all methods/navigation, shell version 486.
- Installed independent test PostgreSQL binaries inside ignored backend node_modules; synthetic clusters under ignored scratch only. No external checkout, existing employee-app database, production account/configuration or cloud service was used. Clusters stopped and removed after testing.
- Real copied SQL/HTTP suite passed. Finished review UI passed real authentication E2E in Edge and WebKit: ID-only form, allowed/denied accounts, server Profile/roles, reload/reopen, HttpOnly __session recovery, cookie-only/cookie-blocked restore, backend outage/retry without credential loss, SQL logout revocation, cross-tab delayed identity guard and canonical access revocation.
- Browser-local storage blocked: authentication/Profile recovers through cookie; existing local chat simulation still needs browser storage. Chat/votes/attachments remain local simulations. No chat backend or UI redesign was added.
- Proxy/cache tests (2) and root syntax checks passed. Existing homepage and Rocketier/AB Express/Match It, Blast It entry serving verified. Inspected Edge login and 320px WebKit Profile screenshots; physical devices and full gameplay remain unverified.
- Added reproducible real-UI test and manual synthetic fixture commands; instructions, changed-file list and production prerequisites are in review-backend/LOCAL_INTEGRATION.md. Production credentials/roster/routing, Firebase cookie forwarding and publication remain pending. No push/deploy.

## 2026-11-09 - Restricted review runtime preparation

- Owner authorized the local read-only employee-table permission fix/tests. Removed canonical-table FOR SHARE reads; employee eligibility still comes from server policy and canonical flags, revalidated on restoration. No employee writes, UI/game changes, fields, session lifetime, cookie name or chat integration changed.
- Production startup no longer executes schema DDL; a separate explicit migration command uses REVIEW_MIGRATION_DATABASE_URL. Development auto-provisioning remains unchanged. No production migration or privileges were applied.
- SQL fixture grants a real non-admin runtime role SELECT-only canonical access, review-session writes and audit INSERT/sequence usage. Denial tests cover employee writes/schema creation/history deletion; the former locking query fails as expected. Login/recovery/renewal/logout/audits succeed and employee identity rows stay unchanged. Actual production entrypoint startup/login/logout/Secure cookie checks pass under that restricted role.
- Real same-origin UI verification runs with the restricted runtime pool in Edge/WebKit. Deployment notes, restricted-role requirements and remaining live IAM/network/TLS/migration prerequisites are documented under review-backend. Public staging hashes still pass; no frontend restaging change needed. No live database, employee-app checkout, cloud changes, push or deployment.

## 2026-11-09 - Standalone QC Core database decision

- Owner explicitly requested own database/project independence. Created an own-project Cloud SQL provisioning request; no other-project commands/data access or account copying. Current resource status is deployment/qc-core/STANDALONE_STATUS.md.
- Replaced backend identity joins with QC Core's own review_auth.accounts table; account/session/audit foreign keys are self-contained. New roster entries default blocked and must satisfy the existing approved ID/role policy. No real or fake accounts seeded into live data.
- Migrated local SQL/restricted-role/preview/browser fixtures to own roster schema. Actual SQL/production entrypoint/Edge/WebKit E2E passed, plus five isolated SQL/disconnected/proxy tests covering blocked default, role mismatch and schema idempotency. Game/UI files unchanged; staging hash checks pass.
- Built standalone image and deployed revision aurobindo-review-api-00002-grb while retaining explicit disabled-login mode, no database credential/secret references and no Cloud SQL attachment. Same-origin health still reports loginReady=false/databaseConnected=false. Independent live schema/roster/runtime setup remains pending; no other project's database is used.

## 10 November 2026 — Empty chat start

Removed seeded Global/RC messages and seeded votes from fresh demo state. Existing browser saves remove only known shipped global-0..37 / rc-0..6 sample message IDs once; user-created messages remain intact. Browser verified fresh empty lists, migration preservation and repeat-load persistence. Prepared/verified all 853 Hosting files; deploy uploads only the two changed JS files. No authentication, backend or game changes; chats remain local simulations.

