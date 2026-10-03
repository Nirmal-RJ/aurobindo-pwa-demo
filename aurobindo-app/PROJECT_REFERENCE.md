# Aurobindo Employee Community PWA — Shared Project Reference

Last updated: 2026-10-02

## 1. Read this first

This document brings human collaborators and AI agents onto the same page about the existing demo and the proposed production application. It combines repository inspection with the project owner's decisions from the planning conversation.

**Current phase: requirements and architecture planning. Production implementation has not been authorised.** The owner repeatedly requested that development not start yet. Creating this reference document is authorised; it is not permission to scaffold, rewrite, provision services, deploy, or implement the proposed application.

Status labels used throughout:

- **CONFIRMED:** explicitly stated or accepted by the owner.
- **OBSERVED:** present in the inspected demo source; not a claim of production readiness or successful runtime testing.
- **PROPOSED:** a recommendation discussed so far; not an approved implementation decision.
- **OPEN:** requires a business or technical decision.
- **DEFERRED:** deliberately left for a later discussion.

When a later explicit owner instruction changes a decision, update this reference. Do not silently turn proposals into confirmed requirements. This document is shared context, not a replacement for the owner's latest instructions or applicable repository instructions.

## 2. Project essence

The project is an employee community and engagement experience for Aurobindo. The demo calls it **Aurobindo Pharmacy / The Celebration Hub** and includes **HPLC Celebrity League** branding in the hero experience.

Its character is celebratory, colourful, playful, and connected to employees' working environment: people play short games, participate in friendly competition, see achievements, and share a sense of community. Existing games use laboratory/HPLC themes.

The production direction adds real employee accounts, persistent shared data, global chat, notifications, and onboarding email. The intended experience should feel fast and easy on a phone while also working on desktop.

Product principles:

- Preserve the demo's personality and recognisable branding.
- Make common actions quick and understandable.
- Support an employee-only community with real access control.
- Treat game results and shared scores as server-controlled records in production.
- Keep visual and content decisions distinct from backend architecture decisions.
- Do not assume every demo tile must ship in the first production release; launch scope is deferred.

The exact final product name and production content still need confirmation.

## 3. Confirmed production requirements

| Area | Confirmed direction | Qualification |
| --- | --- | --- |
| Distribution | PWA only | No Android/iOS store apps or native wrappers are requested. |
| Audience | Employees only | The employee eligibility source is unknown. |
| Login identity | Email | Account provisioning and credential delivery are unresolved. |
| Credentials | Owner initially requested a password sent by email | Owner will ask their boss about using an activation link instead. No final choice yet. |
| Initial capacity | At least 600 simultaneous users | Concurrent users, not total registered accounts. |
| Growth capacity | 5,000 simultaneous users | Owner accepted this as the expected peak target. Must be validated through load testing. |
| Notifications | Push on Android and iOS | Subject to PWA/browser support, installation, and user permission. |
| Chat | One global room | No department/plant rooms requested for now. |
| Chat message types | Text, stickers, and GIFs | Stickers/GIFs come from a collection supplied by the project team. |
| Moderation | Defer moderation discussion/features | Owner said not to worry about moderation for now. |
| Performance | Very fast, snappy, responsive | Numeric acceptance criteria remain proposed. |
| Email | Onboarding email | Trigger, content, sender, and provider remain open. |
| Employee data | Store onboarding data and preferred language | Exact onboarding fields remain to be defined. |
| Game release cadence | Release four games every week | Whether these are new games, new versions, or new content remains open. |
| Game history | Record each player's attempts, when played, score, remaining time, and status | Additional attempt details and retention period remain to be defined. |
| Leaderboard | Global leaderboard required | Scoring, ranking periods, and tie-break rules remain open. |
| Hosting preference | Whichever is safe | No provider, budget, or data-residency rule has been approved. |
| Launch scope/timeline | Discuss later | No committed launch date or first-release feature list. |

## 4. Existing demo: technical baseline

**OBSERVED:** the root app is a lightweight, dependency-free HTML/CSS/JavaScript prototype. Its package manifest has no application framework dependencies. It is not already a React, NestJS, or database-backed application.

The local Node server serves static files. It does not provide authentication, business APIs, chat, email, push delivery, or database access.

### Main source map

| File or directory | Current responsibility |
| --- | --- |
| `index.html` | Main app shell, welcome/login/register screens, profile, home, activity tiles, leaderboard, game gallery, tile-match view |
| `styles.css` | Main visual system, layouts, themes, responsive styling |
| `app.js` | English/Telugu/Hindi UI dictionaries, hash navigation, preferences, section rendering, PWA-related UI |
| `account.js`, `account.css` | Demo account gate and profile presentation |
| `hero-carousel.js` | Mobile hero carousel and controls |
| `leaderboard.css` | Sample leaderboard presentation |
| `tile-match.js` | In-shell tile-match game |
| `cleaning-solution.html/.css/.js` | Cleaning Solution Pairing game |
| `symptom-match.html/.css/.js` | Symptom Cause Pairing game |
| `chromatogram.html/.css/.js` | Swipe the Right Action game |
| `manifest.webmanifest` | PWA identity, icons, scope, standalone display settings |
| `sw.js` | Demo app-shell caching and service-worker lifecycle |
| `server.mjs` | Static development server; default port 4173 |
| `assets/`, `icons/`, `logo.png`, `icon.svg` | Images, game posters, branding, install icons |
| `tests/` | Existing Node-based demo tests |
| `README.md` | Earlier demo overview and local run instructions; some feature descriptions lag current source |
| `triple-match-aurobindo/` | Additional game directory with its own assets and nested `.git`; relationship to production scope has not been established |

Do not assume the additional game directory is part of the main four-game flow or change its nested repository without investigating its purpose.

### Existing local commands

```sh
npm start       # Node static server, default http://localhost:4173
npm run dev    # Same server
npm run check  # Syntax checks for the main JavaScript files
npm test       # Node tests in tests/*.test.cjs
```

Laragon/static hosting can also serve the demo. HTTPS or localhost is needed for service-worker/PWA capabilities. The Node server listens on all interfaces; it is a demo server, not an approved production deployment configuration.

## 5. Existing demo: screens and user flow

### Account entry and profile

1. A fresh app opening presents the account gate.
2. The user can switch between Log in and Register.
3. Both forms accept a name; neither verifies identity or credentials.
4. Mobile number, department, plant, and city inputs are disabled demo fields.
5. The name is stored in browser local storage under `aurobindo-profile`.
6. The home screen becomes available with a profile avatar initial.
7. Profile displays name and the other fields, using a fallback for missing values.
8. Logout removes the local profile and returns to the login view.

Important nuance: `account.js` intentionally shows the gate again for fresh openings/refreshes and preserves the profile for recognised returns from standalone games. This is a demo flow, not production session persistence. Direct game files are static resources, not access-protected employee pages.

### Home and navigation

The home has branding, a profile link, language selection, a celebratory hero, and six activity destinations:

| Destination | Demo route | Current state |
| --- | --- | --- |
| Games | `#/games` | Gallery linking to four playable games |
| Score Board | `#/score-board` | Styled sample leaderboard with podium and sample people/scores |
| Premier League | `#/premier-league` | Themed placeholder section |
| Fun Corner | `#/fun-corner` | Themed placeholder section |
| About | `#/about` | Themed placeholder section |
| Photos | `#/photos` | Themed placeholder section |

Additional routes include `#/`, `#/welcome`, `#/login`, `#/register`, `#/profile`, and `#/games/tile-match`.

The hero includes copy, celebration artwork, and a leaderboard promotion. On mobile, it becomes a three-slide carousel with navigation, pause controls, and swipe handling. Reduced-motion preferences affect autoplay. The source includes keyboard/focus handling and other accessibility provisions; a full accessibility audit has not been performed for this reference.

### Four playable games

| Game | Entry | Observed mechanics |
| --- | --- | --- |
| Cleaning Solution Pairing | `cleaning-solution.html` | Four laboratory solution questions; select/arrange solvent tiles, guided and more difficult interactions, timed play, results and answer review |
| Symptom Cause Pairing | `symptom-match.html` | Connect six HPLC symptoms to probable causes; 60-second timer, results out of six, review, stars, sound controls |
| Tile Match | `#/games/tile-match` | Five matching pairs, 45-second round, moves/matches tracking, results and replay/exit |
| Swipe the Right Action | `chromatogram.html` | Five HPLC defect questions, randomised directional answers, shared 45-second deadline, joystick/swipe/button/keyboard input, results and review |

These games calculate their results in browser JavaScript. They do not submit authoritative scores to a production server. The displayed leaderboard is explicitly sample data, not a live aggregation of game results.

### Language, theme, and offline behaviour

- English, Telugu, and Hindi dictionaries exist for the main experience and tile-match content. Do not assume every screen/game is fully translated; account and leaderboard markup include English-only sections.
- Theme and language preferences are saved locally. Theme support exists in the shell and game pages.
- The scoreboard temporarily uses the dark theme and restores the previous theme on departure.
- The manifest declares standalone display and app icons.
- The service worker caches an explicit list of shell/game assets, uses network-first navigation with a cached fallback, and cache-first behaviour for matching assets.
- Asset query versions and cache versions are manually maintained in the demo.
- Offline caching of demo assets does not imply production offline chat, offline login, or trusted offline score submission.

### Existing verification coverage

Test files are present for accounts, the hero carousel, leaderboard, cleaning solution game, and chromatogram game. These are source-level/simulated-environment tests, not proof of mobile browser behaviour, security, or concurrency capacity.

This reference was created from source inspection. No runtime, load, or production readiness certification is implied, and tests were not run for this documentation-only task.

## 6. What the demo does not yet provide

- Verified employee identity or real authentication.
- A production session lifecycle or employee offboarding.
- Backend business APIs or a persistent shared database.
- Server-validated game attempts or a live leaderboard.
- Global chat or shared message history.
- A server-backed sticker/GIF catalogue.
- Web Push subscription management or notification delivery.
- Onboarding/recovery email delivery.
- A production administration workflow.
- Production hosting, backup recovery, monitoring, or proven capacity.

These gaps are the work under discussion, not already implemented features.

## 7. Proposed architecture — not yet approved

| Layer | Proposed technology | Purpose |
| --- | --- | --- |
| Frontend | React + TypeScript + Vite | Reusable components, typed state/data, route-level loading, responsive PWA |
| Backend | Node.js + TypeScript + NestJS | Organised modules for accounts, content, games, chat, notifications |
| Primary database | Managed PostgreSQL | Durable users, memberships, attempts, scores, messages, and delivery records |
| Live transport | Socket.IO | Live global chat and selected realtime updates |
| Shared transient data | Redis | Rate limits, cross-instance coordination, optional caching |
| Background work | Durable queue and worker; library/provider undecided | Onboarding emails, push batches, retries, scheduled work |
| Media | Object storage with controlled delivery and CDN where appropriate | Team-provided sticker/GIF assets and any approved future media |
| Transactional email | Resend initially suggested; final provider undecided | Onboarding, activation or temporary credentials, recovery |
| Hosting | AWS Mumbai provisionally suggested; Render discussed as an alternative | Managed production infrastructure |

Begin, if approved, with one backend organised into modules and a background worker. Microservices are not currently justified by the agreed scale alone.

Native wrappers, Capacitor, React Native, Flutter, and app-store delivery are outside the confirmed PWA-only direction. They were considered before that decision and are not current recommendations.

### Database rationale: PostgreSQL versus MySQL

**PROPOSED:** prefer managed PostgreSQL if there is no established corporate database standard or stronger team preference. The owner requested that this rationale be recorded; this does not make the database choice or the rest of the stack approved.

Employee accounts, game releases, attempts, accepted scores, and chat messages have clear relationships. A relational database supports these relationships, constraints, and transactional updates naturally. This explains preferring a relational model; it does not by itself distinguish PostgreSQL from MySQL. Both are suitable for the core application.

Specific reasons for the PostgreSQL preference:

- **Variable game details:** keep common attempt fields (employee, game release/version, start/end time, score, remaining time, status) in structured columns. Where useful, store game-specific details such as matched pairs, wrong answers, moves, or hints in JSONB. PostgreSQL offers JSONB query/indexing options; MySQL also supports JSON. Exact fields and indexes remain subject to schema design.
- **Selective indexing:** PostgreSQL partial indexes can cover only records meeting a condition, such as validated attempts. When actual queries match that condition, a smaller index may improve retrieval and avoid indexing irrelevant rows. This is an optimisation option, not a guaranteed speed improvement.
- **Growing reporting needs:** best attempts per employee/game, participation by weekly release, abandonment rates, and ranking/tie calculations fit SQL reporting. PostgreSQL supports these queries, but modern MySQL also provides window functions and ranking capabilities. A global leaderboard alone is not a reason to reject MySQL.

| Consideration | Assessment |
| --- | --- |
| Accounts, attempts, scores, and chat history | Both PostgreSQL and MySQL are suitable |
| Large historical datasets | Both require appropriate schema design, queries, indexes, and infrastructure sizing |
| Leaderboard responsiveness | Maintained score summaries, appropriate indexes, and selective caching matter more than the database brand |
| Varied game details and selective indexing | PostgreSQL provides useful flexibility |
| Existing MySQL expertise or corporate infrastructure | A strong reason to choose MySQL instead |
| Proven performance for this application | Neither database has been benchmarked for this workload |

There is no evidence that PostgreSQL will automatically be faster than MySQL or that either default configuration will meet the 5,000-user peak target. Final selection should account for team expertise, corporate standards, managed-service options, cost, and representative load testing. PostgreSQL remains a preference, not a requirement for handling the load.

### Conceptual request/data flow

```text
Employee browser / installed PWA
  |-- HTTPS --> Static app assets / CDN
  |-- HTTPS --> Application API --> PostgreSQL
  |-- Live connection --> Chat service --> PostgreSQL message history
  |                                      <--> Redis across app instances
  |-- Controlled media requests --> Team-provided sticker/GIF collection

Application events --> Durable queue --> Worker
                                        |-- Email provider --> Employee mailbox
                                        |-- Web Push service --> Browser/device
```

This is a logical flow, not a final deployment topology. Security, load-balancer configuration, queue semantics, service sizes, and provider selection need a design pass.

## 8. Proposed production user journeys

### A. Employee eligibility and onboarding

1. Establish that the email belongs to an eligible employee using the agreed source.
2. Create or invite the employee account according to the chosen provisioning flow.
3. Send either an activation link or temporary credentials, once the boss/owner decides.
4. Employee completes the credential setup and enters the app.
5. Send the welcome/onboarding email at the agreed lifecycle point.
6. Explain installation and notification options without blocking normal browsing.

**OPEN:** eligibility could come from an approved email list, a corporate directory, or a defined domain policy. None is selected. Email ownership alone is not the same as current employment.

**PROPOSED credential handling:** prefer an expiring, single-use activation link so the employee chooses a password. If emailed passwords remain required, use a short-lived temporary password and require replacement on first login. Do not represent either branch as approved yet.

Account recovery, profile fields, self-service registration versus invitations, and offboarding ownership remain open.

### B. Returning employee

1. Open the website or installed PWA.
2. Restore a valid production session or present email login.
3. Authorise access on the server.
4. Load home content and profile data.
5. Navigate to enabled launch features.
6. Logout ends the session and clears appropriate private client state.

Session duration, multi-device behaviour, and access revocation rules are not finalised. Browser local storage must not be treated as evidence of authenticated identity.

### C. Games and leaderboard, if included at launch

1. Select a game and read instructions.
2. Start a tracked attempt using server-approved rules.
3. Play with immediate local feedback.
4. Submit attempt evidence/results for server validation.
5. Show a pending state until the server accepts the outcome.
6. Update the authoritative score/leaderboard according to agreed scoring rules.
7. Allow replay when attempt limits permit it.

**OPEN:** scoring formula, aggregate ranking, tie-breaks, replay limits, competition periods, team scoring, and treatment of interrupted/offline attempts. Current demo rules are reference material, not approved competition policy. Client-calculated totals alone must not be trusted for rankings.

### D. Global chat

1. Eligible, authenticated employee opens the global room.
2. Load a bounded page of recent messages and connect to live updates.
3. Employee sends text or selects a sticker/GIF from the supplied collection.
4. Server validates access and message content/reference, then stores the message.
5. Deliver the accepted message to connected room participants.
6. Acknowledge success or show a retryable failure to the sender.
7. After reconnecting, fetch missed history and deduplicate repeated messages.

The proposed media-message payload references a catalogue asset ID; users do not upload arbitrary media or select external GIF-provider results in the agreed flow.

Basic authentication, message size limits, rate limits, and safe text rendering are technical reliability/security needs. A moderation dashboard, reports, bans, and automated moderation are deferred and must not be silently added to launch scope.

**OPEN:** history retention, edit/delete behaviour, ordering guarantees, notification triggers, and whether presence/read receipts are needed. No direct messages or extra rooms are requested.

### E. Notifications

1. Explain why notifications are useful.
2. User explicitly opts in through a permission interaction.
3. Store the device/browser push subscription against the employee account.
4. Approved business events create queued notification work.
5. Worker sends Web Push and cleans up expired subscriptions.
6. Tapping a notification opens the relevant app route, with authentication checked.

For iPhone/iPad PWA push, the platform baseline discussed is iOS/iPadOS 16.4+ with the app added to the Home Screen. Permission is still required. Android browser/device support must be validated against the supported device matrix.

Push is best-effort: device settings, permission, connectivity, and platform behaviour affect delivery. An in-app notification inbox was proposed as a companion, but is not confirmed launch scope. Do not notify everyone for every global chat message by default; notification policy remains open.

### F. Email delivery

1. A committed account lifecycle event schedules an email.
2. A worker sends through the approved transactional provider.
3. Retries handle temporary failures without repeatedly creating welcome emails.
4. Delivery/bounce events update operational records.

Sender domain, authorised sender address, SPF/DKIM setup, templates, languages, support contact, and recovery flow require agreement. Do not assume permission to send from a corporate domain.

### G. Administrative operations

Some operational mechanism will be needed to manage employee access and the provided asset collection. The final mechanism could be an import, an internal interface, or integration with existing systems.

An administration dashboard and content-management features have not been scoped or approved. Define ownership before implementing them.

## 9. Proposed data model boundaries

This is a conceptual inventory, not an approved schema or migration plan.

| Record group | Potential contents |
| --- | --- |
| Employees/accounts | Email, identity, access status, approved profile fields |
| Authentication | Password hashes, sessions, expiring activation/recovery tokens |
| Organisation | Departments/plants if the business confirms their use |
| Games/attempts | Game version, attempt identity, timing, validated answers/results |
| Scores | Accepted score entries and competition/ranking context |
| Chat | Room, sender, text or catalogue reference, server timestamp, message identity |
| Media catalogue | Sticker/GIF asset IDs, storage paths, type, dimensions, enabled state |
| Push | Employee/device subscription and lifecycle state |
| Email/background work | Delivery state, retry information, deduplication identity |

PostgreSQL is the proposed source of truth. Redis should not be the only store for durable messages or scores. Binary media belongs in object storage, with metadata in the database. Retention periods and deletion policy remain open.

## 10. Scale, responsiveness, and reliability

### Confirmed capacity meaning

The owner means **simultaneously active users**: at least 600, with a 5,000-user peak target. This is not a claim that the current demo or proposed default server can support that load.

Capacity depends on browsing activity, message rates, recipient count, score submission bursts, GIF sizes, and reconnect storms. For example, ten messages per second delivered to 5,000 connected chat recipients produces approximately 50,000 recipient deliveries per second before protocol overhead. A single global room makes this an important test case.

### Proposed performance criteria

- Visible local interaction feedback within 100 ms.
- Typical API latency below 300 ms at the 95th percentile under agreed conditions.
- Live message delivery below one second under agreed conditions.
- Load-test at 600 users, an intermediate level such as 1,000, and the agreed 5,000-user peak.
- Exercise login bursts, simultaneous game finishes, sustained chat/media traffic, reconnects, and an instance restart.

These numeric latency targets are proposals, not signed-off service levels. Define representative devices, network conditions, request mix, duration, and acceptable error rates before testing.

### Proposed implementation practices

- Serve static assets through a CDN and optimise sticker/GIF dimensions and file sizes.
- Lazy-load games and nonessential sections.
- Paginate chat/history and avoid rendering unbounded message lists.
- Keep application instances horizontally scalable and coordinate live delivery across them.
- Use database indexes, bounded queries, and connection pooling.
- Move bulk email/push work into background jobs.
- Provide pending, retry, offline, and reconnect UI states.
- Plan service-worker updates so employees receive compatible new frontend versions.
- Test actual iPhones and ordinary Android devices, not only desktop emulation.

Backups, restore testing, operational monitoring, secret management, and controlled deployments belong in the production plan. Availability goals and recovery objectives have not been agreed.

## 11. Hosting and safety decisions

The owner requested a safe hosting choice without specifying a provider or budget. **AWS Mumbai is a provisional candidate, not an approved purchase or deployment.** Render was discussed for simpler operations.

Before choosing, establish:

- Corporate cloud/vendor approval and billing owner.
- Whether data must remain in India; this is not currently a requirement.
- Employee geography, latency expectations, and network restrictions.
- Monthly operating budget and acceptable operational workload.
- Required availability, backup retention, and recovery objectives.
- Email/domain ownership and any corporate security review process.

A provider name alone does not establish safety. The proposed baseline is HTTPS, private database connectivity, restricted administrative access, secure credential handling, controlled media access, tested backups, and monitoring. Avoid exposing employee-only media through an unintentionally public storage bucket.

Do not quote an infrastructure cost or promise capacity until the architecture and workload are sized. Keep API, database, and cache close geographically unless a specific requirement justifies otherwise.

## 12. Decision register and open questions

| ID | Decision/question | Status | Next input |
| --- | --- | --- | --- |
| D01 | PWA-only distribution | CONFIRMED | None |
| D02 | Employee-only access, email identity | CONFIRMED | Eligibility mechanism still needed |
| D03 | 600 minimum / 5,000 peak simultaneous users | CONFIRMED | Define workload and acceptance conditions |
| D04 | One global room, text + provided stickers/GIFs | CONFIRMED | Collection assets and message behaviour |
| D05 | Activation link versus emailed credentials | OPEN | Owner to discuss activation links with boss |
| D06 | Employee eligibility/provisioning/offboarding | OPEN | Owner/business input |
| D07 | React/NestJS/PostgreSQL/Socket.IO/Redis stack | PROPOSED | Final technical agreement |
| D08 | Hosting provider/region/service sizing | OPEN | Policy, budget, sizing |
| D09 | Email provider/sender/onboarding trigger | OPEN | Domain owner and business workflow |
| D10 | Push provider/implementation and event policy | OPEN | Supported devices and product requirements |
| D11 | Launch features and date | DEFERRED | Games with detailed attempt history and a global leaderboard are confirmed product requirements; first-release scope/date still need agreement |
| D12 | Scoring and competition rules | OPEN | Product/content owner |
| D13 | Full translation coverage and final branding | OPEN | Product/content owner |
| D14 | Moderation feature set | DEFERRED | Do not add by assumption |
| D15 | Retention, account recovery, session policy | OPEN | Product/technical decision |
| D16 | Permission to begin production implementation | NOT GIVEN | Explicit owner instruction |
| D17 | Separate production folder and Git repository; preserve demo | Folder creation authorised and completed on 2026-10-02 at `D:\laragon\www\aurobindo-pwa\aurobindo-app`; repository/layout remain proposed | Open the production folder with write access before further authorised setup |

## 13. Suggested next phases — planning sequence only

1. Resolve credential delivery and employee eligibility with the business.
2. Define first-release scope, scoring rules, supported devices, and content ownership.
3. Finalise architecture, hosting policy, budget, authentication design, and performance criteria.
4. Break approved work into bounded tasks with shared API/data contracts.
5. After explicit permission, create the production foundation and a complete authenticated user journey.
6. Migrate approved demo experiences, preserving intended design and reviewing prototype assumptions.
7. Add persistent scores, global chat/catalogue media, onboarding email, and Web Push as scoped.
8. Verify functionality, device behaviour, access control, load, recovery, and rollout readiness.
9. Pilot with employees, then expand based on measured behaviour and agreed acceptance criteria.

These phases do not commit to dates or approve all listed features for launch.

### Production workspace and startup checklist

**CONFIRMED workspace action:** at the owner's explicit request, the production folder `D:\laragon\www\aurobindo-pwa\aurobindo-app` was created on 2026-10-02. The folder was subsequently moved inside the demo project at the owner's request and contains `PRODUCTION_APP_PROGRESS.md`. The existing demo is preserved. This authorises folder setup and relocation only; repository initialisation, scaffolding, and production implementation remain unauthorised. The structure below remains proposed.

Current production folder location:

```text
D:\laragon\www\aurobindo-pwa\   # Existing demo; preserve for reference
└── aurobindo-app\             # Production folder
    └── PRODUCTION_APP_PROGRESS.md
```

A separate folder is not technically required, but gives the prototype and production application clear boundaries, especially when multiple agents are working. Reuse useful assets, styling, and game logic selectively after review; do not copy demo authentication or client-trusted scoring into production unchanged.

When the owner explicitly authorises development:

1. Back up or commit the current demo, preserving any uncommitted work and checking the nested game repository separately.
2. Confirm the production path, check whether it already exists, and open it as the active workspace with the necessary write access. Do not overwrite an existing project.
3. Use the existing production folder and initialise its own Git repository when authorised. Keep the demo repository intact; do not copy its `.git` directory or the nested game's `.git` directory.
4. Copy `PROJECT_REFERENCE.md` into the production root. From that point, maintain the production copy as the authoritative project reference and mark the demo copy as a historical snapshot pointing to it, so agents do not maintain competing decision records.
5. Read the reference and resolve decisions needed for the authorised task. Starting the workspace does not automatically approve every proposed stack choice or deferred feature.
6. Organise the production repository with separate web, API, and shared-code directories. A suggested layout is shown below; exact tooling and structure remain subject to the architecture decision.
7. Assign bounded tasks and shared contracts before parallel implementation. Preserve the demo as a source of visual and behavioural reference.

```text
aurobindo-app/
├── PROJECT_REFERENCE.md
├── apps/
│   ├── web/                # Responsive PWA frontend
│   └── api/                # Backend APIs and realtime services
├── packages/
│   └── shared/             # Shared types/contracts where useful
└── docs/                   # Approved designs and operational notes
```

This is a proposed structure within one production repository, not a requirement to introduce microservices. Background-worker placement can be decided during implementation planning. Only the production folder has been created; no production repository, framework scaffold, or infrastructure has been created.

## 14. Instructions for collaborating AI agents

- Read this reference and the current owner request before acting.
- Inspect relevant source and applicable repository instructions; do not rely solely on older README descriptions.
- During the current planning phase, do not implement the proposed application without explicit authorisation.
- Do not interpret an architecture suggestion as a settled requirement.
- Do not add native apps, public signup, arbitrary image uploads, external GIF search, extra chat rooms, or direct messages by assumption.
- Preserve existing demo work and assets. Do not rewrite working games merely to change frameworks.
- Keep demo identity/score logic clearly separate from production authentication and trusted score handling.
- When implementation is authorised, agree ownership of shared files and API/data contracts before parallel edits.
- Make bounded changes, report affected files, and distinguish completed work from proposed work.
- Record assumptions, tests actually run, unresolved issues, and any changed decisions in handoffs.
- Never claim load capacity, test success, delivery success, deployment, or security verification without evidence.
- Update this document when the owner settles an open decision; keep one shared decision record.
- Maintain `D:\laragon\www\aurobindo-pwa\aurobindo-app\PRODUCTION_APP_PROGRESS.md` as the authoritative project progress log, created at the owner's request on 2026-10-02. After every completed implementation or setup change, append what changed, affected files/services, verification actually performed, and remaining issues before handing work back. Timestamp entries as `YYYY-MM-DD HH:mm:ss IST` using Asia/Calcutta (UTC+05:30). Preserve previous entries, distinguish completed work from proposals, and never include secrets. Include relevant documentation changes. The progress log does not authorise implementation.

### Reusable agent handoff

```text
Read PROJECT_REFERENCE.md before proceeding.
Current authorised task: [specific task]
Implementation authorised for this task: [yes/no; scope]
Files/modules owned by this task: [list]
Confirmed decisions relevant to the task: [decision IDs]
Open decisions not to assume: [list]
Dependencies/contracts with other work: [list]
Required validation: [checks]
Return: changes or findings, evidence, remaining questions, and reference updates needed.
```

## 15. Sources and evidence

Primary project evidence: the owner's planning conversation and the local source files listed above. The demo inventory is a source-inspection snapshot as of this document's date; it is not a full visual QA report.

External documentation consulted during the architecture discussion:

- [PostgreSQL: JSON types](https://www.postgresql.org/docs/current/datatype-json.html) and [MySQL: JSON data type](https://dev.mysql.com/doc/refman/8.4/en/json.html) — structured records with variable game-specific details.
- [PostgreSQL: Partial indexes](https://www.postgresql.org/docs/current/indexes-partial.html) — indexes limited to records satisfying a condition.
- [PostgreSQL: Window functions](https://www.postgresql.org/docs/current/tutorial-window.html) and [MySQL: Window functions](https://dev.mysql.com/doc/refman/8.4/en/window-functions.html) — reporting and ranking capabilities available in both databases.
- [WebKit: Web Push for Web Apps on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/) — Home Screen installation and permission requirements.
- [Socket.IO: Using multiple nodes](https://socket.io/docs/v4/using-multiple-nodes/) — cross-server delivery and load balancing; sticky sessions are relevant when HTTP long-polling is enabled.
- [Render: WebSockets](https://render.com/docs/websocket) — managed WebSocket hosting option.
- [AWS regions](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html) — Mumbai region availability.
- [Resend: Verified domains](https://resend.com/docs/dashboard/domains/introduction) — sending-domain verification requirements.

Recheck platform requirements, provider limits, pricing, and regional service availability when finalising the implementation. No accounts, paid services, infrastructure, or external communications have been authorised through this reference.
