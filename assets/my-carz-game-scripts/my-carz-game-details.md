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

# My Carz game details

## Approved implementation snapshot - 27 October 2026

The agreed Carz Game Flow.docx and the user's two numbered clarification replies supersede the inherited Good Bad Ugly gameplay. The user approved temporary cars/arrows, modular local persistence and implementation with clean, scalable code. Original Good Bad Ugly and Rocketier files/media remain separate.

## Folder and module map

| Responsibility | File or folder |
| --- | --- |
| Entry and screens | assets/my-carz-game-scripts/my-carz.html |
| Shared primitives and preserved impact keyframes | my-carz.css |
| Responsive screen layouts and sequenced effects | my-carz-flow.css |
| Question bank, nine car records, paint, timing, audio and future GIF/frame slots | my-carz-config.js |
| Pure progression, question scheduling and IST reset rules | my-carz-core.js |
| Async repository and replaceable local adapter | my-carz-store.js |
| Screen transitions, inputs, race rendering and flow | my-carz.js |
| Existing light-body pixel recoloring algorithm | my-carz-paint.js |
| Reusable byte downloader, retry and image readiness | my-carz-preload.js |
| Content revision keys and cached media/ranges | my-carz-asset-cache.js |
| Generated media sizes/revisions | my-carz-assets.js |
| Manifest generation | build-my-carz-assets.cjs |
| Dedicated offline shell | sw.js in the scripts folder |
| Supplied and temporary media | sibling assets/my-carz-game-assets/ |
| Root compatibility link | my-carz.html redirects to the scripts entry |

Paths in the table without a folder prefix are relative to assets/my-carz-game-scripts/. Root index.html retains the games card; Back to games points to ../../index.html#/games.

## Flow and progression

1. Opening downloads all production media with byte progress, retries and reusable content-revisioned cache entries. Next is locked until media downloads, worker control and initial image decoding finish.
2. First device visit shows four demo slides with Previous/Next/counter and explicit Finish. Closing before Finish replays the demo from slide one. Completion survives daily resets. How to Play and My Cars buttons appear only on a subsequent document opening, not immediately after the first completed demo.
3. Home shows the selected car, all nine car slots in a horizontal collection, paint controls and Start Driving. Players may select any unlocked car. The collection screen also supports car/paint selection and shows both earned upgrades today and total available cars.
4. Start with Car-1, level 1. There are eight upgrade levels, unlocking Car-2 through Car-9. New cars automatically become selected; choosing an older car does not change progression or difficulty.
5. Ready, 3, 2, 1 precede driving. Each question has two seconds of reading time while the road continues moving, then tunnels approach. The player's current lane is automatically the answer at the tunnel crossing; no swipe is required to submit.
6. Only Good and Bad lanes exist. Their left/right order is randomly assigned once per level and retained after failures, retries, exit and reopen. Travel starts at 3.8 seconds and scales by 1 + 0.06 * (level - 1), independent of the selected car.
7. A correct answer passes the tunnel and awards one diamond with flight/count/celebration feedback. Five consecutive answers complete the level. A wrong answer explodes the car, displays the correct answer, resets diamonds to zero and waits for Keep Driving. The same level/car/lane order resumes with fresh questions. There is no life limit.
8. A completed upgrade saves its checkpoint before scratch/reveal. Scratch coverage of 60% opens the showcase; Reveal car provides a keyboard alternative. Automatic car rotation accepts configurable frame sequences. Keep Driving introduces the new car with a visible entry animation, then the countdown and next question. Diamonds begin at zero.
9. After Car-9, show the all-cars celebration and continue free play. Five-answer cycles still award/reset diamonds without more cars or additional speed increases.
10. Exit/Pause offers Keep Playing and Save & Exit. Save & Exit drops the partial attempt and returns to My Carz home, retaining the last completed-level checkpoint and chosen car/paint.

## Question scheduling

One separate config bank supplies all levels. Initial content reuses the ten inherited scenarios; former Ugly actions are classified as Bad in the two-category adaptation. Production question wording/answers can be replaced in config.

The scheduler chooses least-exposed eligible questions, randomizes ties, avoids the last four questions where possible, and excludes questions already used in the current successful streak. Exposure/recent history persists at completed checkpoints. This guarantees bank coverage instead of repeatedly sampling a small random subset. Failed attempts keep exposure history in memory, so retrying draws fresh questions; interrupted unsaved attempts restore the previous checkpoint's scheduler.

## Local persistence and backend boundary

- Current storage key: my-carz-progress-v2; schema version 2. Existing my-carz-colors-v1 paint preferences migrate on first initialization without deleting the old key.
- The repository exposes async load/save and serializes writes. LocalAdapter is the only progress-storage integration; replace it with a backend adapter without rewriting game rules/presentation.
- Durable daily data includes unlocked cars, selected car, paints, level, lane assignment, scheduler history, statistics and answered-question records. Completed-level checkpoints commit all answers accumulated since the previous checkpoint, including failures that preceded the successful streak.
- Partial answers, diamonds and scheduler changes are never included in preference/metadata saves. Reopening level 3 after two answers restores level 3 at 0/5 and excludes those unsaved answers from durable statistics.
- Plays count Start Driving from home (automatic upgrade continuation does not add a play); played-day dates are tracked locally; previous completed daily snapshots are retained in lifetime archives. No backend or cross-device synchronization exists yet.
- Storage/download failures are surfaced. Failed completed-level saves offer Retry before the reward flow proceeds. Data is not silently cleared on unreadable JSON.

## Daily reset

All players use midnight India time, independent of browser timezone. The game displays a five-minute in-game warning only. If midnight arrives during an active five-answer level, including failed retries, that entire level may finish first. Reward/reveal is allowed to complete before reset. Exiting instead discards the partial level and applies the pending reset.

Reset returns the player to My Carz home with Car-1, level 1, default paint, fresh questions and zero diamonds. Previous committed data is archived locally; device demo/returning status remains. Reopening on a later day resets immediately. There are no browser notifications.

## Animation and input contracts

- Screen transitions: guarded exit 260ms, entrance 380ms; next screen and controls are sequenced after the prior screen exits. There is a Web Animations fallback using visible opacity/transform transitions.
- Car steering uses delta-time interpolation and tilt. Road/scenery remains continuous during reading and freezes through answer feedback/pause; speed follows the level.
- Preserved three-pulse red wrong-impact sequence lasts 900ms, with a localized explosion before the crash modal. Correct feedback uses the existing bottom-aligned confetti GIF and a 750ms diamond flight before the HUD count settles.
- Garage preview entrance 550ms; new-car race entry 1100ms. Arrow chevrons animate in the currently selected lane: green Good, red Bad. Modal entrances use scale/settle.
- Backgrounding pauses race time/sounds; active reading/travel/countdown opens Pause. Touch-landscape guidance freezes the race until portrait returns. Keyboard left/right, on-screen arrows, swipe and lane tapping are supported. Modal controls manage focus and trap Tab.
- No global motion suppression or new reduced-motion branches have been introduced. Preserve approved effects; change them only within explicit user scope.

## Temporary media and outstanding production inputs

- Cars are named Car-1 through Car-9. Six inherited models are reused for nine temporary slots. Replace config records when names/order and car art arrive.
- Supplied demo images temporarily serve both introduction and How to Play; GIFs can replace config helpSlides later.
- Arrow chevrons are original CSS animation pending supplied GIFs.
- Frames arrays are empty pending supplied car images. Current showcase uses a gentle automatic perspective turntable effect, not a true 360-degree model. The frame playback integration is ready for supplied rotations.
- Paint remains functional through the inherited light-body pixel recoloring algorithm.

## Cache and validation

Dedicated shell v1; My Carz CSS v4, flow CSS v1, presentation JS v3, other modules v1. Root shell v460 caches the compatibility redirect; My Carz's own worker handles its runtime/media. The generated manifest currently contains 85 production files, about 16.1 MiB; reference/old artwork is excluded. Unchanged content revisions are reused.

Run npm run assets:my-carz after media changes (also part of predev/prestart), npm run check:my-carz, npm run test:my-carz, node --check sw.js and git diff --check. Optional browser test: CARZ_PLAYWRIGHT points to a Playwright package and CARZ_URL selects the running game; run node tests/my-carz.browser.cjs. Browser QA evidence belongs in artifacts/my-carz-flow/.

Physical phone performance, live audio mixing and production car/GIF frame quality remain unverified. Do not equate rule tests or headless screenshots with those checks.

Verification on 27 October 2026: 21 My Carz rules/cache tests and two root-worker tests pass. Headless Edge passed full cold-load/demo/crash/upgrade/save/exit/offline flows and five viewport bounds; home, race/tunnels and reward screenshots were reviewed. Additional Edge checks passed real scratch gestures, download failure/retry, first-visit button visibility, touch-landscape guidance, Car-9 celebration/free play, deferred midnight reset and archive retention. Reports: artifacts/my-carz-flow/verification.json and extra-verification.json. These are browser checks, not physical-device/audio validation.

The supplied page-8/scratch-card.webp was detected during implementation and is used as the scratch surface, trimmed to its opaque artwork bounds at render time. The manifest now includes 85 production media files (~16.1 MiB).

## Home PC handoff on 27 October 2026

The original agreed flow is checked in at `docs/Carz Game Flow.docx` beside these documents. Later approved decisions are captured in this details file and the progress log. README.md has clone/pull, Node version, startup and validation instructions. Source/media/config/tests and browser evidence are portable; local player saves/cache and external Playwright installations are not Git content.

Next production work: receive final nine-car names/order/art and rotation frames, replace temporary help images with supplied GIFs, replace CSS arrows if supplied GIFs are preferred, then verify the production media on physical phones and check the live sound mix. Backend integration remains deferred behind the repository adapter.

Handoff validation: 48 targeted tests pass and project/My Carz syntax checks pass. The full repository suite is 210/212: two pre-existing Snake test failures reference undefined beginTutorial/slitheringBody; Snake source/test object hashes match the prior commit. These are outside My Carz and were not changed.
