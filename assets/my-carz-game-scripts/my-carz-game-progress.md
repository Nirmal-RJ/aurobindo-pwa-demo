## Mandatory user approval and preservation rule

This continuing user instruction applies across future sessions and contributors.

- Before modifying My Carz, read `my-carz-game-details.md` and `my-carz-game-progress.md`.
- Bring any proposed change or deletion of existing behavior, content, code, assets, timings, animations, or documentation to the user's notice and obtain explicit approval before applying it. A specific change directly requested by the user supplies approval for that scope; it does not authorize collateral changes.
- A general request for smoothness, cleanup, performance, accessibility, or compatibility is not approval to remove, replace, shorten, suppress, or weaken existing features or effects. Explain the concrete proposed changes and obtain approval first.
- Preserve approved animation timing, sequence, intensity, continuity, and sound synchronization. Do not silently suppress motion or add global near-zero durations. Browser/device or reduced-motion handling changes require the same notice and approval.
- Keep animations smooth and well sequenced: complete the relevant entrance, reading, countdown, feedback, reward, and exit stages in their intended order. Avoid overlapping screens, abrupt jumps, duplicate triggers, and premature timers or enabled controls.
- Record every authorized feature/fix in the progress document, including approval scope, affected files, sequencing/timing changes, cache versions, validation, and remaining issues.
- Review changes for collateral effects and visually verify affected animation sequences. Logic tests alone do not establish smoothness; state explicitly when browser/device verification is pending.
- Never silently delete or weaken this rule. Later specific user instructions may authorize an exception; record the scope clearly.

# My Carz context and progress

## Current status - 27 October 2026

Approved two-lane flow is implemented with modular rules/config/storage, nine temporary cars, checkpoint saves, daily resets and dedicated offline loading. Production car frames, names and How to Play GIFs remain pending. See current details for authoritative behavior; earlier duplication entries are historical.

## 27 October 2026 - Git handoff for home PC

- Authorization: user requested updating all documents and pushing the work to Git to continue from home.
- Updated details/progress, game README, scoped contributor instructions and root README/AGENTS handoff pointers. Included the original agreed `docs/Carz Game Flow.docx` so it is available on another PC; later clarified rules remain in the tracking documents.
- Handoff includes My Carz code/config, all supplied/temporary media and references, tests, manifest/builder, scoped worker, games-gallery integration, compatibility redirect and browser QA screenshots/reports. No dependency on the Downloads folder remains.
- Local player progress and downloaded media caches do not transfer through Git; runtime source needs no dependency installation. Optional Playwright browser QA uses the CARZ_PLAYWRIGHT environment variable rather than a fixed machine path.
- No gameplay/animation behavior changed in this documentation handoff. Runtime/cache versions remain as recorded below.
- Release validation: regenerated 85-file manifest; npm run check and npm run check:my-carz passed; 48 targeted tests (21 My Carz, 25 Good Bad Ugly, two root worker) passed; git diff --check passed. Previous browser evidence remains included with the physical-device/audio limits listed below.
- Full repository check: 210/212 tests pass. Existing Snake tests fail because beginTutorial and slitheringBody are undefined. Reproduced the same two failures in tests/snake.test.cjs alone and verified both snake.js and tests/snake.test.cjs exactly match HEAD object hashes; neither is changed by this handoff.
- Publication target: origin/main on Nirmal-RJ/aurobindo-pwa-demo. Remote was fetched and main had no divergence before the handoff commit. This entry travels with the publication commit; verify its final hash in git log on the receiving PC.

## 27 October 2026 - Approved game flow implementation

- Authorization: user answered both clarification lists, specified the rules below, approved temporary assets/generated arrows and instructed implementation with clean, scalable modules and updated documentation. This expressly replaces inherited three-lane/lives/five-question-result behavior for My Carz only.
- Car-1 starts unlocked. Eight five-correct levels unlock Car-2 through Car-9. Random Good/Bad positions are fixed per level and preserved after mistakes. Mistakes reset the five-diamond streak, show the correct answer and continue the same level with fresh questions; no three-life game over remains.
- Separate config owns questions/cars/timing/paint/audio and future GIF/frame slots. The question scheduler balances full-bank exposure, avoids recent repeats and excludes repeats within a successful five-question streak. Initial inherited Ugly scenarios map to Bad.
- Pure core manages progression, daily reset and checkpoints. Async repository/local adapter is replaceable by a backend adapter. No backend is connected. Completed-level snapshots persist; partial answers/streaks are excluded from all saves, including exit. Reopening retains the saved level at 0/5. Old paint preferences migrate without deleting their original key.
- Flow includes first-device demo replay after interruption, returning-only home buttons, home/collection car and paint selection, Ready/3/2/1, two-second reading, two approaching tunnels, auto-submission from current lane, correct diamond flight/confetti, wrong explosion/answer panel, 60% scratch reveal, automatic showcase, new-car entry, all-cars celebration and continued free play.
- Exit/Pause returns to home through Save & Exit; background/portrait handling freezes active time and silences audio. Completed upgrades auto-select their car; older car selection does not lower level speed.
- Midnight IST reset is deferred through the active five-answer level and reward reveal, then archives completed data and restarts daily progress. Device demo/returning flags persist; a five-minute in-game warning is displayed. No external notifications.
- Added dedicated scoped worker, versioned media manifest/builder and byte-progress loader adapted from Rocketier under an independent namespace. All 85 production media files (~16.1 MiB) must download before Next unlocks. Reuse/retry, image decoding and media range handling are supported. Root worker now caches only the compatibility redirect for My Carz.
- Replaced unused inherited presentation selectors with shared primitives/preserved impact keyframes and a separate flow stylesheet. Preserved interpolation, road/scenery continuity, three-pulse impact, celebration, music/sounds, paint, countdown and portrait guidance while changing the explicitly approved flow.
- Timing: screen exit/entry 260/380ms; garage entrance 550ms; reading 2s; tunnel travel 3.8s / (1 + .06 * (level - 1)); diamond flight 750ms; wrong impact 900ms; new-car entry 1100ms. New CSS arrows represent selected Good/Bad lanes.
- Temporary inputs: Car-1 through Car-9 labels and reused inherited models, four static demo/help images, CSS arrows and a perspective showcase pending supplied rotation frames. No claim of true 360-degree art until frames arrive.
- Added 21 tests covering all eight upgrades/free play, failures/duplicates, scheduler fairness, lane stability, checkpoint rollback, preferences, IST rollover/deferred reset, device onboarding, adapter failures, production manifest and preload/range behavior. All 21 pass; syntax/whitespace checks pass. Browser review caught paint-label overlap and a transition-wait issue in the QA script; both corrected.
- Browser verification: headless Edge passed cold 85-file loading, interrupted-demo replay, home/collection, crash recovery, five correct answers, scratch/reveal, new-car entry, partial-level rollback, Save & Exit, offline reload and layouts at 320x568, 393x852, 768x1024, 1440x900 and 852x393 without page errors or HTTP failures. Home/race/reward screenshots were visually inspected.
- Additional browser checks passed: simulated three-download failure keeps Next disabled; Retry succeeds while retaining downloaded files; first-session returning buttons stay hidden; touch-landscape guidance; actual scratch gestures cross 60% coverage; final Car-9 showcase/all-cars screen; free play; IST pending-reset notification; Save & Exit applies the pending reset and archives the nine-car collection. See artifacts/my-carz-flow/verification.json and extra-verification.json.
- Tests: 21 My Carz tests plus two shared-worker tests pass. Physical-device frame pacing, live audio mix and supplied production GIF/car-frame quality remain pending.
- Versions: root shell v460; dedicated My Carz shell v1; base CSS v4; flow CSS v1; presentation JS v3; config/core/store/cache/preload/paint v1; generated manifest content-revisioned.

## 27 October 2026 - Scripts, documents and media grouped into sibling folders

- Approval: user requested organizing My Carz documents, assets and scripts like Rocketier.
- Current runtime/documents: `assets/my-carz-game-scripts/`. Media: sibling `assets/my-carz-game-assets/`, including supplied page-1 artwork and copied inherited art/audio/font/icon. Original game media was copied rather than moved.
- Moved HTML/CSS/JS and both tracking documents; added scoped AGENTS.md and README.md. Root AGENTS.md points to the new document paths.
- Updated relative media paths, games-page link/banner dependencies, Back to games navigation, package syntax checks and root worker precache. Root my-carz.html is a compatibility redirect preserving query/hash through JavaScript. Existing localStorage key is preserved.
- Root PWA worker remains responsible for caching; no independent worker was introduced. Runtime visuals, sequencing, timing and audio behavior remain unchanged.
- Versions: CSS v3, JS v2; shared stylesheet v48; root shell v459. Own media added to precache, reference-only artwork excluded.
- Validation: syntax/whitespace and static HTML/CSS asset paths passed. All 25 inherited tests pass with relocated runtime and asset paths. Headless Edge passed five viewport layouts and Next-to-garage transitions without page errors. Evidence refreshed in artifacts/my-carz-opening/.
- Remaining limits: physical devices, live audio and full gameplay frame pacing have not been verified. Earlier entries below use historical root paths.

## 27 October 2026 - Supplied opening artwork and responsive Next button

- Approval: user requested matching page-1-reference.webp using page-1-bg.webp and next-button.webp, with responsive behavior.
- Replaced the temporary title/background and Start appearance with supplied artwork and an accessible image-based Next button. Retained My Garage and Back to games as small bottom links.
- Fitted the complete 9:16 artwork inside the available safe-area viewport without cropping or distortion; button coordinates scale with the artwork.
- Preserved the existing Next-to-garage transition, timing, duplicate-trigger guard, audio and all gameplay behavior. No runtime JS changes.
- Files: my-carz.html, my-carz.css, sw.js and the two tracking documents. CSS v2; JS v1; root shell v458. Precached both supplied runtime images; reference image remains reference-only.
- Validation: headless Edge passed 320x568, 393x852, 768x1024, 1440x900 and 852x393: correct aspect ratio, no horizontal overflow, button inside viewport, successful Next transition and no page errors. Reviewed the 393x852 screenshot. Evidence: artifacts/my-carz-opening/ screenshots and verification.json. Syntax/whitespace checks passed.
- Limits: browser emulation is not physical-device validation; audio and full gameplay frame pacing remain pending. Existing touch-landscape portrait guidance is preserved.

## 27 October 2026 - Tracking and preservation documents

- Authorization: user requested details/progress documents modeled on Rocketier, smooth and well sequenced animations, persistent memory, and notice plus approval before changes or deletions.
- Added `my-carz-game-details.md`, `my-carz-game-progress.md` and a root `AGENTS.md` instruction scoped to My Carz so future contributors discover the rules.
- Recorded the existing runtime, shared dependencies, flow, timing baseline, cache versions and validation limitations.
- Documentation only; no runtime or animation changes in this step.

## 27 October 2026 - Initial duplication baseline

- Authorization: user requested a new My Carz banner on the games page and a separate copy of Good Bad Ugly for later changes.
- Created `my-carz.html`, `my-carz.css`, `my-carz.js`; separate paint preference key `my-carz-colors-v1`.
- Added My Carz title screen and banner; reused garage/car artwork and retained original gameplay. Original Good Bad Ugly runtime files were preserved.
- Updated games-page styling, package syntax-check command and root PWA precache.
- Versions: My Carz CSS/JS v1; shared stylesheet v47; root shell v457.
- Validation: syntax and whitespace checks passed; 25 original tests passed, and 25 tests redirected to My Carz runtime/source paths passed while retaining shared artwork references.
- Pending: browser visual review, sequence smoothness, sound synchronization and real-device performance. No browser/device results are claimed.

## Required entry format for future authorized work

- Date and concrete request.
- User approval and its exact scope; any approved exception to preservation rules.
- Resulting behavior and affected files/dependencies.
- Animation stages, ordering, durations, input gating and audio synchronization affected.
- Cache/version changes, or documentation-only status.
- Checks performed and results; distinguish source tests, browser checks and physical-device checks.
- Remaining issues and proposed work awaiting approval.

The supplied page-8/scratch-card.webp was detected during implementation and is used as the scratch surface, trimmed to its opaque artwork bounds at render time. The manifest now includes 85 production media files (~16.1 MiB).

Final input check: rapid duplicate Start events produced one saved play only; Pause/Keep Playing and Save & Exit returned to home successfully. The supplied scratch surface waits for artwork readiness before accepting strokes.
