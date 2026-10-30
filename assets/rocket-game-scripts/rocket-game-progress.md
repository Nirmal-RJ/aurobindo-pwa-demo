## Mandatory preservation rule for all future AI agents and contributors

This is an explicit, continuing user instruction. It applies across future sessions, context resets, refactors, fixes, and migrations.

- Do not remove existing features, content, assets, or effects, or disable, shorten, tone down, replace, or reduce an approved animation without explicit user permission for that specific change.
- A general request to improve smoothness, clean up code, optimize performance, improve accessibility, or fix another feature is NOT permission to remove or suppress existing effects. Explain any necessary collateral change and obtain permission before applying it. Continue independent authorized work meanwhile.
- Preserve approved timing, sequencing, intensity, movement, and continuity. In particular, preserve the question entrance/sweep/pulses, launch camera shake, launch smoke, docking, transitions, liquid flow, and directional percentage trails.
- Do not reintroduce global near-zero animation/transition durations (such as 0.01ms), hidden effects, stationary substitutions, or reduced-motion/browser/device branches that suppress approved motion. Any such behavioral change requires explicit permission first.
- Before editing Rocket'ier, read this rule and the current game details/progress. Older historical notes proposing reduced-motion suppression are superseded by this rule. A later explicit user request may authorize a specific exception; record it clearly.
- Review the diff for collateral animation changes and verify affected sequences before declaring completion. Use the existing browser checks, including ROCKET_REDUCED_MOTION=1 when motion handling changes. Report anything not visually verified; passing logic tests alone does not prove animation quality.
- Update rocket-game-progress.md after every feature/fix, recording exactly what changed and how it was checked. Never silently remove this rule or weaken it.

# Rocket'ier context and progress

## 30 October 2026 - Guard conveyor animation re-entry and recovery

- Authorization: after analysis of reported iPhone rocket/belt freezes, user approved the narrowly scoped restart/recovery proposal without removing or changing existing effects.
- Recreate only the two conveyor CSS animations together when the selection stage is revealed. Handle immediate and animated screen entry; preserve stylesheet 14-second duration, linear easing, direction and existing boarding pause/fades.
- On pageshow, focus or return to visibility, sample both transforms once over 180ms. Leave moving layers alone; recreate both together if either remains unchanged. Screen version, selection phase, visibility and boarding guards prevent recovery during other stages. New screens/boarding invalidate pending checks. No continuous polling or global animation reset.
- Docking source measurement, travel/settle/formula/nose/tank sequencing, launch, spotlight, other effects, video and audio unchanged. Presentation JS v84 and scoped shell v48 synchronized; no media changes.
- Validation: runtime syntax checks, all 50 Rocketier tests (including paired recovery, boarding cancellation and moving-layer preservation) and git diff --check pass. Existing UI tests retain docking/reduced-motion/audio sequence coverage. Live browser and actual iPhone compositor/visual verification remain pending; reported device freeze is not yet confirmed resolved.


## 30 October 2026 - Video lesson pro tip

- Authorization: user requested only a boxed pro tip above the lesson video and a slightly smaller video to accommodate it.
- Added ?PRO TIP: Always look at the label, not the colour of the solvent.? in a gold bordered dark gold box at the top of video popups. Existing title, video and Continue button stay in their order; the flexible video row yields the required vertical space. Tip remains absent from all other popup types.
- Preserved lesson playback/controls, retry behavior and all existing gameplay/audio/animation timings. CSS v101 and scoped shell v47 synchronized; no JS or media changes.
- Validation: Rocketier syntax checks, unit tests and whitespace checks pass. Browser/device visual verification remains pending.


## Current release snapshot - 26 October 2026

This snapshot supersedes conflicting historical entries below; mandatory preservation instructions remain in force.

- Runtime: assets/rocket-game-scripts/rocket-game.html; root rocket-game.html redirects here. Dedicated scoped worker; sibling rocket-game-assets holds media. Five recipes, including D Column Wash (Water 10%, ACN 45%, MeOH 45%), with matching WebM lessons.
- Fuel controls: enlarged tank displays, centered solvent labels, one Fill per tank and a shared last-fill Undo attached beside the chamber. Animated digit counting/highlights; five green rising Fill echoes and red falling Undo echoes. Preserve all approved attention, docking, shake, smoke and transition effects.
- Failure: randomly choose any of three sad astronauts for incorrect-answer, timeout or mission-failed popups, animated above/behind the banner.
- Journey results: supplied page-6/journey-success-1.webp above the stats card after EVERY successful launch once route travel finishes. It replaces the separate win astronaut and speech bubble. Preserve route motion, destination ring and stat counting.
- Completion: new page-8 artwork with current average response time and best average across all completed missions. Include resolved correct/wrong/timeout attempts; exclude animation/video time and incomplete attempts. Store run.pace and player bestMissionPaceSeconds, deriving legacy results from history.
- Current pace finishes counting, holds for 1.5 seconds, then best pace appears/counts. Bottom distance/time removed from this screen by explicit request; history preserved.
- Runtime versions: CSS 82, presentation JS 74, core 5, loader 4, cache helper 1, scoped shell 24. Asset manifest rebuilt for 95 runtime assets (~25 MB).
- Release validation: 44 Rocketier tests plus 2 root worker tests and syntax/whitespace checks pass. Browser checks and deployment evidence are recorded in progress notes; Windows WebKit is not a physical iPhone test.


## 26 October 2026: game files grouped into two sibling folders

Current runtime location: `assets/rocket-game-scripts/`. This progress file and `rocket-game-details.md` moved here as well. Earlier entries use historical root paths.

- `assets/rocket-game-assets/` holds images, GIFs, sounds and videos. `assets/rocket-game-scripts/` holds the HTML, CSS, game/core/loader/cache JS, generated manifest, build utilities, documentation and dedicated `sw.js`.
- Entry point: `assets/rocket-game-scripts/rocket-game.html`. Games card points here; old root `rocket-game.html` is a compatibility redirect.
- All runtime media paths now use `../rocket-game-assets/`. Builders work relative to their own folder; root npm scripts and repository tests point to the new source location. Back to Games points to `../../index.html#/games`.
- Dedicated worker installs seven runtime files under its own scope. It handles media cache/range requests and removes only older `rocketier-shell-*` caches. Shared root worker no longer imports Rocketier scripts or requires its manifest. Existing `rocketier-media-v1` URLs and saved player data are retained, avoiding forced re-download/data loss.
- Both folders can be hosted together independently (HTTPS/localhost). README explains entry point, configuration and asset builds. Test infrastructure and shared app remain at repository root.
- Validation: game checks and 40 targeted tests plus two shared-worker tests passed. Chromium passed offline simulation. WebKit passed after actually stopping the temporary test server, including redirect, dedicated control, offline reload, art, moving conveyor and cached WebM byte ranges. WebKit's simulated-offline flag itself caused a harness failure; actual server-disconnection verification succeeded.
- Versions: game CSS v63, presentation JS v59, core v3, loader v4, cache helper v1. Dedicated shell v1; shared shell v456. Asset manifest rebuilt for sibling-relative URLs.


## Latest refinement: clearer question lettering on phones

- Removed the engraved text-shadow layers and cyan drop-shadow from the formula entrance. Kept the entrance scale/sweep/panel emphasis.
- Increased recipe text approximately 5% (3cqw to 3.15cqw, clamp 10–18px) and widened each variant's label by two percentage points while retaining its centre. This prevents Column Cleaning from overflowing at 320px.
- Validation: browser-measured all four recipes on all five rocket variants at 320/390/560px; all 60 combinations fit with computed text-shadow none. Service-worker syntax and both service-worker tests passed.
- Cache: CSS v62, JS v58, core v2, loader v3, helper v1, service worker v452. User authorized publication to origin/main after readability verification.

## Latest fix: first-visit missing mission brief artwork

- User reported mission brief art missing after the first download, returning after closing/reopening. Download completion did not validate or refresh the page's earlier image requests, which could have failed before service-worker control.
- After downloads and worker activation, loader now rebinds existing artwork to its exact content-revisioned cache URL and awaits image decoding/natural dimensions before unlocking Start. Hidden-screen images are eager-loaded. Failed decoding retries once; persistent failure keeps the gate locked with Retry instead of entering with missing art.
- Added prepareImages regression tests and tests/rocket-first-load.browser.cjs (test:rocket:first-load). Browser test intentionally aborts the initial unversioned mission-brief request, holds decoding to verify the gate stays locked, then confirms the brief appears without reopening.
- Validation: syntax and all 38 targeted tests passed; cold-first-load regression passed in Chromium and WebKit with touch-enabled 390x844 viewports. No physical phone verification yet.
- Cache: CSS v61, JS v58, core v2, loader v3, helper v1, service worker v451. User authorized publication to origin/main after first-load verification.

## Git publication preparation

- User requested publishing the completed Rocket'ier changes. Rechecked game/loader/service-worker syntax and all 36 targeted tests; passed. Whitespace validation cleaned up before staging.
- Publication includes game refinements, generated sound effects, supplied recipe videos/audio, asset preload/cache, mobile compatibility changes, tests and browser QA evidence. BGM remains removed.

## Latest work: mobile animation compatibility and real-engine verification

- Added a CSS-keyframe fallback for essential docking/camera/route motion if native Element.animate is missing or throws. The same timings and endpoint geometry apply.
- Loader adds a measured equivalent stylesheet on browsers without cqw units, replacing container and modern viewport units before unlocking Start. Resizes update the measurement. Added Safari-prefixed masking/blur, touch-selection suppression and legacy viewport height fallback.
- Hardened Fill input: pointer-capture failure is caught; global release/cancel stops holds; legacy touch/mouse input and gesture sound priming are available without Pointer Events. Lesson modal follows visualViewport resizing; explicit inline video attributes and hidden-page playback cleanup added.
- Installed Playwright and WebKit in the system temp QA directory, not project dependencies. Added optional tests/rocket-mobile.browser.cjs and test:rocket:browser command. Screenshots/report in artifacts/rocket-mobile-qa.
- Browser verification: Chromium touch 393x851, WebKit touch 390x844, WebKit 320x568 with native animation/container-unit capabilities disabled all passed full animated touch/success/failure/retry flows without page errors. Separate Chromium/WebKit checks passed reduced-motion preparation and portrait/landscape resizing. Native and fallback docking/route tests verify changing coordinates, not just animation existence.
- Chromium lesson reached readyState 4. Windows WebKit did not decode the MP4 even in a separate uncached probe; do not claim physical iPhone video/audio verification. Full report records the limitation. Actual phone/GIF frame pacing/audio/low-power behavior still requires device testing.
- Validation: syntax and all 36 targeted tests passed, including pointer-capture failure and legacy touch cancellation. Share via HTTPS so the mandatory service-worker preload can operate.
- Cache: CSS v61, JS v58, core v2, loader v2, helper v1, service worker v450.

## Latest change: remove background music completely

- Removed BGM playback, volume/lifecycle/recovery code, soundtrack WAV and music generator/npm command. Rebuilt the manifest without BGM: 88 assets / 18.5MB.
- All gameplay sound effects remain; blur/background/page-exit cleanup still silences effects. Removed obsolete BGM tests.
- Validation: syntax checks and all 34 remaining targeted tests passed. Search confirmed no music references in runtime JS, asset manifest or package scripts.
- Cache: CSS v60, JS v57, core v2, loader/helper v1, regenerated manifest, service worker v449.

## Latest adjustment: very mild music in gameplay, videos and route results

- Reduced BGM to 2.5% during hangar gameplay and dotted-path journey results, and 0.8% beneath lesson videos. Other screens retain their existing level. Lesson music now stays barely audible instead of pausing; background/blur still pauses playback.
- Volume transitions resolve from the incoming screen state and fade smoothly without a loud startup burst when resuming in these screens.
- Validation: syntax and all 38 targeted tests passed, including gameplay/video/result volume levels and background lifecycle. Live audio mix verification pending.
- Cache: CSS v60, JS v56, core v2, loader/helper v1, service worker v448.

## Latest refinement: playful music and no toggle

- Removed the music-toggle button, styling and preference logic. Music starts automatically on Start; obsolete saved mute choices no longer suppress it without a visible control. Normal UI gestures retry blocked playback. Lesson/background pause and position-preserving resume remain.
- Replaced the slow ambient soundtrack with an original 16-second / 120 BPM major-key arcade loop: bouncy alternating bass, offbeat chord stabs, toy-like pitch-bent melody and light percussion. Stereo PCM is now 1.46MB (smaller than the former 2.20MB). Updated generator and preload revision; total preload approximately 20.0MB.
- Validation: syntax and all 38 targeted tests passed, including no-toggle automatic music, gesture recovery, waveform seam/headroom and updated duration. Live listening/mobile playback verification pending.
- Cache: CSS v60, JS v55, core v2, loader/helper v1, regenerated manifest, service worker v447.

## Latest fix: audible music startup and blocked-playback recovery

- Confirmed soundtrack serves correctly (HTTP 200, audio/wav, 2,304,044 bytes). Raised music volume from 13% to 30%; start with audible gain inside the user gesture rather than zero-volume playback.
- Start/music-control gestures restore focused playback state. If playback is blocked, the control now shows TAP with an accessible retry label; tapping retries without switching the preference off. Other UI gestures retry paused music when appropriate, while lesson playback remains protected.
- Validation: syntax and all 38 targeted tests passed, including simulated autoplay rejection, visible TAP state and successful gesture recovery. Live browser listening remains unverified; a specific browser-side root cause could not be confirmed without live access.
- Cache: CSS v59, JS v54, core v2, loader/helper v1, service worker v446.

## Latest feature: looping background music playback

- Wired the preloaded space-background-loop.wav to start on the player's Start gesture and loop quietly at 13% volume beneath effects. Smooth 350ms fades for music changes; pause/resume preserves playback position.
- Added a compact 44px music toggle after Start, with accessible label/pressed state and remembered on/off preference in aurobindo.rocketier.music, separate from game history.
- Music pauses immediately during lesson videos, blur/hidden/page exit; resumes after leaving the lesson or returning to the game if enabled. Autoplay rejections are caught; sound effects retain their existing lifecycle.
- Validation: syntax and all 37 targeted tests passed, including start-only playback, loop/volume, lesson/background pause, position-preserving resume, stored mute preference and history separation. Live browser audio mix/device verification pending.
- Cache: CSS v59, JS v53, core v2, loader/helper v1, service worker v445.

## Latest asset: original looping background soundtrack

- Created generated/space-background-loop.wav: an original 24-second / 80 BPM atmospheric space loop, stereo 24kHz/16-bit PCM, 2.20 MB. Soft four-chord synth pads, bass pulse, sparse arpeggio and delayed melody; tails wrap across the loop boundary. No abrupt fade-to-silence between repetitions.
- Source: build-rocket-music.cjs; regenerate with npm run music:rocket, then npm run assets:rocket. Track is included in preload (89 files / 20.7MB). Playback integration/music controls are not yet implemented; this request created the soundtrack asset.
- Validation: generator/service-worker syntax and all 35 targeted tests passed, including stereo format/duration, peak headroom and continuous waveform slope at the seam. Live listening verification remains pending.
- Cache: CSS v58, JS v52, core v2, loader/helper v1, regenerated manifest, service worker v444.

## Latest adjustment: show engine penalty only after new damage

- Presentation-only tracking now reveals the red engine/speed badge on the first successful flight after a newly lower engine count. Further flights with the same damage hide it; another lost engine reveals the updated badge once. Tracking resets for a new run and updates only when the badge actually appears.
- Speed factors, engine logic, distance calculations and parallax speeds are unchanged. Bonus entry uses the earlier timing when no penalty badge is shown.
- Validation: syntax and all 34 targeted tests passed, including new-loss/repeated-flight/new-loss sequence with unchanged speed values.
- Cache: CSS v58, JS v52, core v2, loader/helper v1, service worker v443.

## Latest refinement: docking whoosh and lighter route audio

- Created rocket-zoom.wav: a 1900ms rising whoosh with a soft docking tone, synchronized to conveyor-to-pad movement. Stops at docking and on navigation/backgrounding.
- Replaced the previous low route hum with a lighter, clean space arpeggio and small arrival chime, preserving 2600ms route synchronization and lowering its mix volume.
- Regenerated sounds and content-revisioned preload manifest: 88 files / 18.5MB. New zoom adds approximately 89KB; supplied audio is unchanged.
- Validation: syntax and all 33 targeted tests passed, including zoom start/stop and waveform format/headroom/endpoints. Live listening/mobile playback verification pending.
- Cache: CSS v58, JS v51, core v2, loader/helper v1, regenerated manifest, service worker v442.

## Latest adjustment: retry button artwork and video Continue label

- Try Again/retry popup now uses page-7-3/retry-mission-button.webp instead of the generic gold button, centred at native 588:147 proportions. Existing same-question retry behavior remains.
- Video popup action now reads “Continue”.
- Validation: syntax checks and all 33 targeted tests passed. Source button artwork inspected; live visual verification pending.
- Cache: CSS v58, JS v50, core v2, loader/helper v1, service worker v441.

## Latest feature: original short animation sound cues

- Created five deterministic synthesized WAV cues in rocketier-audio/generated: formula-reveal (0.72s ascending chime), nose-open (0.65s servo/swish), nose-close (0.6s descending servo/latch), number-count (1.52s soft digital ticks), route-glide (2.6s airy low glide). Original supplied MP3s remain unchanged. Source generator: build-rocket-sounds.cjs; regenerate with npm run sounds:rocket then npm run assets:rocket.
- Wired question cue to the formula entrance; nose cues to initial/retry opening and successful/failed closing; count cue to cinematic bonus, journey statistics and completion totals; route cue to dotted-path movement. Counting/travel audio stops at completion, all new cues stop on screen changes/backgrounding. Conservative per-cue volumes and existing mobile gesture priming apply.
- Mono 24kHz / 16-bit PCM with fades and 35% peak headroom, approximately 286KB total. Preload manifest now includes 87 assets / 18.4MB, reusing unchanged cache entries.
- Validation: syntax and all 33 targeted tests passed. New tests cover cue timing, count/travel cleanup, WAV format/duration/headroom/endpoints. HTTP verified all five clips. Live listening/mobile playback verification pending.
- Cache: CSS v57, JS v49, core v2, loader/helper v1, regenerated manifest, service worker v440.

## Latest refinement: stronger dark smoke and deferred retry equipment

- Enlarged black/charcoal engine puffs, increased density and extended their fade, with smoke cleanup at 1800ms after blowout. Still only two transform/opacity puffs at the damaged nozzle, with reduced-motion fallback.
- Failed liftoff now ends with nose closed and fuel station fully retracted. A persistent failure-resting state keeps both parked through the failure popup, lesson and retry popup. Removed automatic equipment return from abort keyframes.
- Only Retry reopens the nose (650ms), then lowers the station (900ms). The new attempt/full countdown begins after this 1550ms preparation, retaining engine damage. Suppressed a second automatic tank descent after retry preparation ends.
- Validation: syntax and all 31 targeted tests passed. Integration checks parked state throughout lesson/retry, delayed new attempt with full timer, and existing failure/audio sequencing. Live visual verification pending.
- Cache: CSS v57, JS v48, core v2, loader/helper v1, service worker v439.

## Latest feature: dark smoke at failed engine

- Added two small black/charcoal gradient puffs at the newly failed nozzle, synchronized with the existing engine blowout (wrong answers and timeout). Smoke trails upward briefly and fades completely before the failure popup; other engines remain clear.
- Smoke anchors share existing variant-specific exhaust coordinates and scale with the rocket at mobile/tablet widths. Uses only transform/opacity animations on two local elements, no new downloads, canvas particles, per-frame JavaScript or blur filters. Promotion is limited to the active smoke state and clears after 1450ms. Reduced motion uses one stationary fading puff.
- Validation: syntax and all 31 targeted tests passed; UI coverage checks only the newly failed engine smokes, surviving engines stay clear and smoke cleans up before the popup. Existing geometry tests cover 320/390/560px stages. Real-device frame rate/visual verification remains pending; performance on every mobile cannot be guaranteed without device testing.
- Cache: CSS v56, JS v47, core v2, loader/helper v1, service worker v438.

## Latest adjustment: keep launch smoke low

- Removed the post-exit smoke-cover cue and the expanding smoke viewport. Light smoke stays confined to the bottom 35% throughout; its faint haze appears during launch, without a new rise after the rocket leaves. Existing blackout/cinematic timing retained.
- Validation: syntax and all 31 targeted tests passed, including no smoke-cover cue at rocket exit. Live visual verification pending.
- Cache: CSS v55, JS v46, core v2, loader/helper v1, service worker v437.

## Latest adjustment: drastically lighter launch smoke

- Reduced visible clouds from six to three, shrank their starting dimensions, reduced expansion from 4.5x to 2x and lowered peak opacity from 94% to 30%. Final haze is now a faint transparent veil rather than dense coverage.
- Existing ascent/shake/transition timing stays unchanged.
- Validation: inspected smoke CSS overrides; service-worker syntax and both service-worker tests passed. Live visual verification pending.
- Cache: CSS v54, JS v45, core v2, loader/helper v1, service worker v436.

## Latest refinement: preserve liftoff visibility before smoke takeover

- Confined exhaust to the bottom 35% of the hangar during ascent, with a soft upper edge. Rocket remains visible above the low rolling smoke.
- After the rocket finishes its 3500ms ascent, expand smoke over the full scene for 1000ms. Start blackout at 4500ms, then enter the flight scene at 5300ms. Shake still settles before the smoke takeover. Reduced motion keeps the same sequence without shake/rolling clouds.
- Validation: syntax checks and all 31 targeted tests passed; launch integration checks the smoke-cover cue before blackout and updated cinematic timing. Live visual verification pending.
- Cache: CSS v53, JS v45, core v2, loader/helper v1, service worker v435.

## Latest feature: successful-launch smoke and camera shake

- Added six staggered, soft exhaust clouds anchored at the pad. They roll outward, expand and climb across the hangar, followed by a warm-lit smoke haze that fills the scene before the existing blackout. Plume sits above gameplay art and below the blackout; it ignores input.
- Successful launch shakes the hangar gently at ignition, builds to 3px vibration through liftoff, then settles by 3600ms before the 3700ms blackout. Failure sequences and cinematic timing stay unchanged. Resetting the hangar for the next question clears the effect automatically.
- Reduced motion removes camera shake/rolling clouds and uses a simple haze fade. Effects are CSS gradients/transforms; no additional download assets.
- Validation: syntax checks and all 31 targeted tests passed. Live browser rendering/performance verification remains pending.
- Cache: CSS v52, JS v44, core v2, loader/helper v1, service worker v434.

## Latest adjustment: quieter gameplay controls

- Excluded Fill, Undo and conveyor rocket selection from Button Click 2 playback for both pointer and keyboard activation. Liquid transfer and other gameplay effects remain unchanged.
- Validation: syntax checks and all 31 targeted tests passed, including excluded-control click coverage.
- Cache: CSS v51, JS v44, core v2, loader/helper v1, service worker v433.

## Latest feature: gameplay sound effects and audio preloading

- Wired Correct Question.mp3 on correct submission; Liquid Flowing.mp3 for Fill/Undo transfers (single continuous loop while held, stopped at settlement/reset); Engine Blast 1.mp3 at the 1150ms visible engine blowout; Wrong Question.mp3 when the failure/timeout/mission-failed popup appears at 3100ms; Button Click 2.mp3 on enabled UI presses, with pointer/keyboard deduplication.
- Added mobile user-gesture priming for delayed effects, playback rejection handling, quieter liquid/click levels and silence on blur/background/page exit. No sound loads from retry-loading button while the preload gate is locked. Other supplied audio files remain unassigned.
- Rebuilt preload manifest: all nine supplied MP3s are included, for 82 total assets / 18.2 MB. Existing cached media is reused through per-file content revisions.
- Validation: syntax checks, all 29 Rocket tests and 2 service-worker tests passed (31 total); new audio tests verify transfer loop reuse/stop, blast and failure timing, correct-answer cue, background cleanup, pointer/keyboard click deduplication. HTTP verified all nine audio files. Live browser audio playback/mix verification pending.
- Cache: CSS v51, JS v43, core v2, loader/helper v1, regenerated manifest, service worker v432.

## Latest feature: home loading gate and reusable offline media cache

- Rocket home now shows a byte-weighted progress bar, percentage, file count and downloaded MB; Start remains hidden/disabled until every listed asset is completely cached and a controlling service worker is ready. Game event handling also enforces the lock.
- Generated manifest covers 73 production assets (17.7 MB), including all four videos, images/GIFs and future audio/font formats under assets/rocket-game-assets. Reference/old artwork is excluded. npm run assets:rocket rebuilds it; predev/prestart run it automatically. Run that command after adding/replacing assets before static deployment. Manifest URL and per-file keys use content revisions, so updates fetch changed files while reusing unchanged files.
- Four parallel downloads, reduced to two on save-data/2G connections. Streaming byte progress, three attempts per failed file, 30-second inactivity watchdog, explicit retry and saved-file reuse. Completed files survive reload; partially downloaded individual files restart. Never unlock on missing assets or cache failures.
- Added separate rocketier-media-v1 cache and service-worker lookup, including proper 206/416 byte ranges for offline video seeking. Shell upgrades preserve this cache. Rocket runtime media is no longer redundantly precached by shell installation; the home loader handles it. Other-game video handling stays unchanged.
- New files: build-rocket-assets.cjs, rocket-game-assets.js (generated), rocket-asset-cache.js, rocket-game-loader.js and tests/rocket-game-loader.test.cjs. Updated npm scripts and service-worker tests.
- Validation: all 27 Rocket core/UI/loader tests passed; syntax checks passed; HTTP verified complete responses for all 73 manifest assets. Loader tests cover concurrency, weighted progress, exact cache revisions, incomplete retries, readiness lock, manifest coverage and video ranges. Browser/offline device verification remains pending (no browser tool or Playwright available).
- Cache: CSS v51, JS v42, core v2, loader/helper v1, content-revisioned manifest, service worker v431.
- Service-worker installation/cache-preservation tests also passed (29 targeted tests total).

## Latest refinement: reel-sized lesson player

- Video popup fills the visible game area, replacing the padded blue card. A compact recipe-topic row sits above a flexible full-size player; Continue to retry has its own reserved bottom row. Removed the redundant lesson description.
- Video uses contain fitting to preserve the full frame and native playback controls. Popup tracks hangar bounds on resize/scroll and clamps its height to the visible viewport. Video-specific styling resets for retry/other dialogs; playback errors reveal the fallback message.
- Validation: syntax checks and all 21 core/UI tests passed; coverage verifies recipe title, expanded-video mode, hidden description and mode reset on retry. Browser playback/layout verification remains pending.
- Cache: CSS v50, JS v41, core v2, service worker v430.

## Latest feature: recipe lesson videos connected

- Mapped all four recipes to their corresponding supplied MP4 files in cleaning-solution-videos: column-cleaning, strong-wash, needle-wash and column-storage.
- Watch Video now opens the matching lesson in the existing popup with playback controls and starts it from the beginning. Continue to retry, damage persistence and unavailable-video error handling remain intact.
- Validation: all mapped files exist, syntax checks and all 21 core/UI tests passed; UI coverage confirms matching video source, visible player and reset playback time. Browser playback remains unverified.
- MP4 requests retain the existing service worker network passthrough for browser range/seek support; these videos are not offline-precached.
- Cache: CSS v49, JS v40, core v2, service worker v429.

## Latest feature: cinematic engine penalty and time bonus rewards

- Flight stars now scroll at the surviving engine factor (100%, 67%, 34%) without extending the 6500ms cinematic.
- When damaged, a red badge enters at 1200ms with active engines and the exact 33%/66% speed penalty. Gold time-saved/bonus-distance badge follows at 2000ms (1600ms without damage), counting up over 650ms. Both use a scale/slide settle and a light sweep, then lift/fade out together at the 3400ms acceleration cue. Bonus boost tints star streaks gold.
- Placement stays below the central rocket. Hidden badges reset for every cinematic; screen-version guards protect updates. Reduced motion uses fades. Distance/speed calculations and attempt timing remain unchanged.
- Validation: syntax and all 21 core/UI tests passed, including undamaged/two-engine/one-engine flight, parallax duration, penalty values, exact bonus count, coordinated exit and results timing. Live browser visual verification pending.
- Cache: CSS v49, JS v39, core v1, service worker v428.

## Latest refinement: prominent tank percentage feedback

- Enlarged/boldened percentage digits and centred them horizontally/vertically in equal digital-window bounds on all three tanks, using tabular digits.
- Fill/Undo briefly brighten digits with the solvent glow and a small 260ms scale/vertical settle. A centred temporary signed amount appears immediately below the display, above solvent names; uses the actual transferred amount, including capped changes. Held Fill retains a continuous glow while each increment pops. Reduced motion omits movement.
- Feedback clears after transfer settlement or on scene/reset cleanup. No new interaction or timer changes.
- Validation: game/service-worker syntax checks and all 20 core/UI tests passed, including signed Fill/Undo delta and feedback cleanup. Live visual alignment verification remains pending.
- Cache: CSS v48, JS v38, core v1, service worker v427.

## Latest adjustment: shorter question reading pause

- Reduced the question-first reading pause from 3000ms to 1500ms. Total preparation is now 5150ms; equipment sequencing and full countdown remain unchanged.
- Validation: syntax checks and all 20 core/UI tests passed with updated timing assertions.
- Cache: CSS v47, JS v37, core v1, service worker v426.

## Latest refinement: question first, equipment afterward

- After the rocket travels and settles (2100ms), dim the scenery and reveal the recipe with the approved attention effect. Give three full seconds to read with the nose closed, fuel station hidden, HUD hidden and flames suppressed.
- Then reveal HUD/flames, open the nose (650ms) and lower the fuel system (900ms). Only after preparation finishes does filling unlock and the full countdown start. Total sequence is now 6650ms; reduced motion retains the reading time.
- Validation: syntax checks and all 20 core/UI tests passed, including question-first timing, hidden equipment during the reading pause, blocked input, and full countdown after equipment preparation. Live visual verification pending.
- Cache: CSS v47, JS v36, core v1, service worker v425.

## Latest feature: attention-grabbing formula entrance

- After the existing 3650ms docking/preparation sequence, dim the scenery and reveal the recipe panel with a cyan light sweep, slight scale/settle and two outline pulses. Keep the full recipe readable in place, with no typing effect or sound.
- Added an 1800ms reveal/reading window before starting the fresh countdown. Fill controls remain disabled; total preparation is now 5450ms. Reduced motion uses a gentle fade with the same reading window. All callbacks retain screen-version guards.
- Validation: syntax and core/UI tests cover no attempt/input during the reveal, then full countdown after it. Live browser visual verification remains pending.
- Cache: CSS v46, JS v35, core v1, service worker v424.

## Latest adjustment: remove journey rocket fire

- Removed the added fire GIF pseudo-element from the journey-results rocket at the user's request. Route movement and results sequence remain unchanged.
- Validation: removed both journey flame CSS rules and checked service-worker syntax. Visual browser verification pending.
- Cache: CSS v45, JS v34, core v1, service worker v423.

## Latest refinement: continuous pouring into the chamber

- Added three persistent coloured inlet jets inside the chamber glass, aligned with the pipe inlets. Their lengths follow the moving total liquid surface, with falling highlights and expanding impact ripples so transfer continues visibly beyond the tubes.
- Chamber levels ease upward after a short 100ms arrival delay and settle within the existing 650ms transfer window. Added translucent depth highlights and softer rolling surface motion. Hold input keeps streams running; Undo reverses their direction. Reset/timeout clears stream state alongside pipe state. Reduced motion suppresses decorative ripple/highlight movement.
- Validation: syntax checks and all 20 core/UI tests passed; transfer coverage includes stream direction, surface target and cleanup. Live browser visual verification remains pending. Recording could not be decoded: no local Python runtime or ffmpeg was available.
- Cache: CSS v44, JS v34, core v1, service worker v422.

## Latest refinement: dim scenery during filling

- Once docking and tank preparation finish, fade the hangar background to 55% brightness over 800ms. Only scenery is filtered; rocket, fuel station, flames, HUD and controls keep their brightness. Reduced motion switches brightness immediately.
- The next question's selection resets the dimming through the existing hangar class reset. Retries retain the dim background.
- Validation: game and service-worker syntax checks passed. CSS targets the separate scenery layer; live browser visual verification remains pending.
- Cache: CSS v43, JS v33, core v1, service worker v421.

## Latest fix: completion value alignment, count-up and direct next mission

- Moved distance/time values inward to the artwork's right-hand value column, vertically centred at 72.5%/78% of the stage. Reduced type size and added tabular digits to fit long distances clear of the frame.
- Both values start at zero, wait for the 700ms screen entrance, then ease up to the exact mission totals over 1500ms. Screen-version guards stop stale counting after navigation.
- Next Mission now starts the newly unlocked run and opens its numbered mission popup directly, bypassing the brief. Start Mission shares the same popup setup. Final mission retains return to Games.
- Validation: syntax checks and all 20 core/UI tests passed; integration coverage verifies completion count-up, final time, direct numbered popup and newly started mission run. Live browser visual verification remains pending.
- Cache: CSS v42, JS v32, core v1, service worker v420.

## Latest fix: corrupted route arrow and text encoding

- Replaced corrupted route arrows and middle-dot separators in browser JavaScript with explicit Unicode escapes. Replaced corrupted em dashes/arrows in HTML with named entities. Mission popup now displays the intended planet-to-planet arrow.
- Validation: game/service-worker syntax checks and all 20 core/UI tests passed. Searched game HTML/JS/core for the corrupted character sequences.
- Cache: CSS v41, JS v31, core v1, service worker v419.

## Latest refinement: page-8 artwork completion screen

- Inspected page-8-reference.webp and page-8-bg.webp. Completion now uses the supplied full-stage background and green next-mission-button.webp, proportionally placed to match the reference.
- Only the reference's destination message, distance travelled and time taken populate the blank artwork areas. Removed the extra star, blue glass card, attempt totals, star totals, history-download button and Back to Games link, per the user's request for no extra content. History persistence remains intact. Final mission keeps its existing return-to-games action with an accessible button label.
- Validation: game/service-worker syntax and all 20 core/UI tests passed. Source artwork inspected; live browser visual verification remains pending.
- Cache: CSS v41, JS v30, core v1, service worker v418.

## Latest refinement: sequenced journey results and destination celebration

- Hide the completion heading on intermediate launches. Only reveal “Yay! Journey complete!” after the route rocket reaches the destination at full mission distance, with a gold scale/slide entrance and expanding planet rings. Reduced motion uses a simple title fade and suppresses rings.
- Keep statistics hidden during the existing 700ms entrance and 2600ms route movement. After arrival, reveal the panel and count all four values from zero to their exact formatted results over 1400ms with eased progression. Continue unlocks after counting completes. Screen-version guards cancel stale updates.
- Added supplied gifs/fire Loop.gif behind the route rocket while flying; flame follows its rotation and fades out at arrival.
- Validation: game/service-worker syntax checks and all 20 core/UI tests passed. Updated tests verify flight precedes statistics, values change during counting, Continue stays locked, intermediate launches hide the heading, and destination arrival reveals it. Live browser visual verification remains pending.
- Cache: CSS v40, JS v29, core v1, service worker v417.

## Latest adjustment: mission-failed artwork popup

- Mission failure now uses the red page-7-3/mission-failed-panel.webp as the entire popup, centred over the current hangar. Removed the blue outer card and duplicate visible title/description; the dialog retains its accessible name.
- Supplied retry-mission-button.webp sits inside the lower area of the red panel. Retry Mission keeps its existing mission restart behavior. Reuses the engine popup's game-bound positioning and animated entrance, with a transparent overlay background.
- Validation: game and service-worker syntax checks passed; all 20 core/UI tests passed. Live browser visual verification remains pending.
- Cache: CSS v39, JS v28, core v1, service worker v416.

Last updated: 24 October 2026, after enlarging docked rockets and rebalancing the filling scene.

This is the continuation/handoff file for the Rocket'ier work. Read this first when conversation context is lost, then read `rocket-game-details.md` and the relevant source files. This document records decisions and observed progress; the working code and newer user instructions take precedence if they differ.

## Current status and authorization

The user originally requested analysis and clarification only. After resolving the gameplay rules, they explicitly instructed: “put all these in a seperate rocket-game-details.md file and start”. Implementation is authorized and underway. Subsequent turns have focused on matching supplied artwork and refining animations, typography, placement and responsiveness.

The user approved the continuous conveyor-to-pad animation. The nose hinge alignment is fixed. All five variant seams and nozzle insertion are implemented. The engraved recipe name is implemented. The latest change enlarges the solvent tanks, preserves the tube artwork aspect ratio, and fits Fill/Undo/Launch controls into their artwork panels. The earlier linear fade for unselected rockets remains. One assembled rocket grows/moves linearly, the same scenery zooms, the nose opens, and tanks descend in sequence. The filling scene retains the previous page-5 reference cleanup. The user explicitly requires this progress file to be updated after EVERY feature/change. Keep that requirement active in future turns.

No commit or deployment has been made during this work. Files remain in the local working tree. Do not reset unrelated changes or remove the user-supplied asset directory.

## Workspace and sources

- Workspace: `D:\laragon\www\aurobindo-pwa`.
- Shell: PowerShell; local project is a plain HTML/CSS/JavaScript PWA.
- User timezone: Asia/Calcutta.
- Original updated flow document: `C:\Users\Admin\Downloads\Rocket'ier Game Flow (2).docx`.
- Artwork: `assets/rocket-game-assets/`, organized as page-1 through page-8, including page-7-1/2/3.
- Recipe source: `liquid-sort.js` (the existing test-tube/liquid-sort game).
- User has an exported history open: `C:\Users\Admin\Downloads\rocketier-history-1792835316537.json`. Its contents have NOT been inspected during this work.
- The DOCX was read as ZIP/XML. It was open in another process, so extraction required a read-only FileStream with FileShare.ReadWrite. Its tables and flow were successfully read. Later user clarifications override conflicting document text.

## Working files

| File | Responsibility |
|---|---|
| `rocket-game.html` | All game screens, dialogs, tank/rocket containers and artwork references |
| `rocket-game.css` | Portrait layout, artwork positioning, screen effects, conveyor and boarding animations |
| `rocket-game.js` | DOM interactions, screens, timing presentation, animation sequencing, persistence, video provision and export |
| `rocket-game-core.js` | Pure game rules and state; UMD export for browser and Node tests |
| `rocket-game-details.md` | Agreed gameplay specification and subsequent visual decisions |
| `rocket-game-progress.md` | This context/progress handoff |
| `tests/rocket-game.test.cjs` | Rules tests |
| `tests/rocket-game-ui.test.cjs` | Mock-DOM integration tests with controlled timers |
| `index.html` | Added Rocket'ier card in Games gallery, using page-1 background as its poster |
| `sw.js` | PWA cache versions and precache entries for game code and runtime artwork |
| `package.json` | Added `check:rocket` and `test:rocket` scripts |

The stylesheet starts with older compressed rules followed by newer overrides. Search all occurrences before changing a selector; the later rules usually govern the current layout. Avoid assuming the first occurrence is the effective value.

## Agreed gameplay rules

The complete flow is opening -> mission brief -> mission popup -> choose rocket -> place rocket and prepare tanks -> fill mixture -> launch -> journey results -> next question, until enough distance is covered. At a destination, show mission results and advance to the next mission. After Neptune, show final completion.

### Recipes and controls

| Recipe | Water % | ACN % | MeOH % | Water / ACN / MeOH step size |
|---|---:|---:|---:|---|
| Column Cleaning | 90 | 5 | 5 | 30 / 5 / 5 |
| Strong Wash Solvent | 20 | 80 | 0 | 10 / 20 / 10 |
| Needle Wash Solvent | 50 | 0 | 50 | 25 / 10 / 25 |
| Column Storage (C18) | 30 | 70 | 0 | 15 / 35 / 10 |

- Recipes and increment algorithm match liquid-sort. They are copied into the core, not imported from liquid-sort's browser IIFE. A test checks that recipe values still match.
- Shuffle all four recipes per bag. Exhaust the bag before a new cycle. Never immediately repeat a recipe across bag boundaries.
- Wrong answers/timeouts intentionally retry the same question.
- Rocket designs are cosmetic choices and do not change stats.
- Hold Fill: one increment on press, then one every 350ms. Release/cancel/focus loss/screen change stops it. Keyboard activation adds one increment.
- Undo removes one increment of that specific solvent, bounded at zero.
- Cap total mixture at 100%. Enable Launch only at 100%.
- Correctness requires exact percentages. All current recipes use two or three solvents.

### Missions and travel

| Mission | Route | Distance | Base speed/progress | Baseline rockets | Stars | Attempt limit |
|---|---|---:|---:|---:|---:|---:|
| 1 | Earth -> Venus | 25,800,000 | 7,000,000 | 4 | 1 | 40s |
| 2 | Venus -> Mars | 74,400,000 | 16,000,000 | 5 | 1 | 36s |
| 3 | Mars -> Mercury | 105,600,000 | 20,000,000 | 5 | 1 | 32s |
| 4 | Mercury -> Jupiter | 447,800,000 | 70,000,000 | 6 | 1 | 28s |
| 5 | Jupiter -> Saturn | 407,000,000 | 70,000,000 | 6 | 2 | 24s |
| 6 | Saturn -> Uranus | 893,200,000 | 120,000,000 | 7 | 2 | 20s |
| 7 | Uranus -> Neptune | 1,009,000,000 | 140,000,000 | 7 | 2 | 16s |

Preserve the document's values without physical unit conversion. The user explicitly defined “MILLION KMS” as mission distance and “IN MILLION MILES” as rocket speed/base progress. The implementation displays distance in km and speed in miles; these are game values, not a physical travel simulation.

```text
timeSaved = max(0, attemptLimitSeconds - inputSecondsUntilLaunch)
engineFactor = 1 with 3 engines, 0.67 with 2, 0.34 with 1
speed = baseSpeed * engineFactor
calculatedDistance = speed * (1 + timeSaved / 100)
appliedDistance = min(calculatedDistance, remainingMissionDistance)
```

One second saved means one percentage point of extra distance, NOT a percentage of the time limit. Example: 40s limit, 29s used -> 11% extra; 7,000,000 becomes 7,770,000 with all engines. Fractional seconds are retained internally.

Baseline rocket counts are not hard limits. Fast answers can finish a mission in fewer questions; damage may require more. Mission completion is based on distance. Record calculated and capped/applied distance separately.

### Countdown, damage and retry

- Start the countdown only when the selected rocket is placed and tanks are ready for input.
- Preparation, page transitions, launch/journey animations and lesson videos consume no answer time.
- Timeout is a wrong answer and destroys one engine. A Launch at/after the deadline is a timeout even with a correct full mixture.
- Wrong mixtures NEVER launch or advance distance. The user's clarification overrides the document's ambiguous second-failure wording.
- First and second failure: red edge glow/smoke, lose engine, failure popup -> Watch video -> lesson or “Video coming soon” -> retry popup -> empty chamber and same question with full countdown.
- Damage persists across questions for the entire mission. Correct launches use the surviving engines and exact 33%/66% penalties above.
- Third failure: mission failed -> Retry Mission -> mission brief, reset distance and restore three engines.
- Next mission also starts with three engines.
- Stars are fixed completion awards, awarded once per mission, 10 total.
- Journey “time taken” currently means accumulated actual attempt input time; no separate simulated flight-time unit is defined.

## Visual decisions and completed revisions

The user wants a responsive portrait game on mobile, tablets and PC, smooth motion on every page, and close fidelity to supplied reference artwork. Avoid substituting generic cards when a matching supplied panel exists.

1. Opening screen: use page-1 artwork and start button. Removed the top Games/title/History bar and bottom “Resume Mission / stars” caption at the user's request. Progress still resumes automatically. Moved History download to mission completion.
2. Mission brief: use `page-2/mission=brief.webp` and start-mission button only. Removed the extra route/distance/timer/stars/instructions glass card. Artwork sits at top 25%, left 5%, width 90%; button at top 73%, left 20%, width 60%.
3. Mission popup: replaced the custom star and glass card with `page-3/mission-1.webp`. Use `page-3/page-3-reference.webp` as reference. Overlay dynamic mission number, route, distance and destination in its blank areas; Play sits inside the bottom of the panel. Background is softly blurred.
4. Mission popup typography: title 7cqw / weight 700; route 3.15cqw / weight 600; description 3.15cqw / weight 600, line-height 1.2, top 22%, left 3%, width 94%; highlighted values use weight 700. These replaced overly bold, narrow, lower text.
5. Page transitions: outgoing scene fades/scales/blurs for 220ms; cyan sweep and incoming fade/slide. Input is inert for the 700ms transition. Reduced-motion mode skips this decorative transition.
6. Conveyor prompt: follow `page-4/page-4-reference.webp`. One cyan inset-glow panel near the top says “Choose your rocket for this journey!”. Hide question name/number and HUD while selecting; reveal them during preparation. Removed duplicate “CHOOSE YOUR ROCKET” text above the belt.
7. Conveyor animation: use `page-4/conveyer-belt.webp`. Two identical runs of five rockets make a seamless 200%-width track. Belt and rockets move left to right by one stage width per 14 seconds against stationary scenery. Both use `assembly-right`, from translateX(-50%) to 0.
8. Conveyor movement fix: the user reported no movement. Removed rules that disabled motion for reduced-motion settings or paused it on hover/focus. Both now continue; reduced-motion slows this gameplay motion to 24 seconds per cycle. Only selecting a rocket deliberately pauses the belt.
9. Exact user-requested CSS values: `.rocket-track { bottom: 10%; }` and `.conveyor { bottom: 7.6%; height: 11%; overflow: hidden; }`. Preserve these unless the user changes them.
10. Latest: added the visible conveyor-to-pad boarding sequence described below.
11. Filling scene cleanup: use page-5-reference.webp as layout authority. Replace the CSS timer/engine boxes with timer.webp and engine-panel.webp. Remove the large glass question-card styling, route/question-number text, “Hold Fill / Undo / Launch” instructions, per-step captions and visible “% filled” caption. Retain a small recipe title, solvent names and digital percentages for playability. Chamber total remains as a screen-reader-only output. Raise the tanks/pipelines/chamber into the upper half and enlarge the rocket to the reference's lower half. Selection prompt/conveyor retain their previously approved positioning.

## Latest implementation: continuous rocket boarding

User feedback: the previous transition was raw/ugly and looked like images replacing one another. The requested behavior is for the small rocket to grow, move linearly to the pad and then open, as one continuous animation sequence.

Recording reviewed: `C:\Users\Admin\Videos\Screen Recordings\Screen Recording 2026-10-24 155937.mp4` (3.13 seconds, 30fps). OpenCV was available for read-only frame extraction. A temporary contact sheet showed the rocket appearing abruptly on the pad, followed by a larger split rocket/filling screen. The previous code skipped its movement and compressed all preparation to 500ms when reduced motion was enabled, consistent with the recording. The intermediate full-image to split-image handoff also changed geometry.

Current implementation in `prepare(button)`:

- Conveyor buttons now render `.rocket-model` from the same page-5 top/bottom assets used by `#pad-rocket`. Their shared geometry is fixed: nose top 1%, left 22%, width 56%, height 34%; body top 32%, width 100%, height 68%. This eliminates the shape change between page-4 whole-rocket art and page-5 parts.
- Freeze both conveyor layers on selection. Measure the clicked `.rocket-model`, reveal `#pad-rocket`, measure its final bounds, hide the source copy and animate the pad rocket from the source bounds to its destination.
- Use two transform endpoints with linear timing, 1900ms, transform-origin top left. No bounce, curved path, intermediate pad placement or second resizing step.
- The same scenery stays visible: `#hangar-closeup` now holds the page-4 planet background from the start. Animate its scale from 1 to 1.22, anchored top centre, concurrently with the rocket. Do not swap to a different page-5 background image.
- Unselected conveyor rockets fade out linearly over 450ms. The belt then fades over 1000ms with a 450ms delay. The selection prompt also fades during movement. Only the selected pad rocket grows/moves; its original conveyor copy is hidden immediately to avoid duplication. After arrival, preserve the final camera scale and reveal the HUD/compact recipe label.
- Settle for 200ms, open the same nose piece over 650ms, then reveal/descend the fuel system over 900ms.
- Start `game.beginAttempt()` only after the complete 3650ms sequence. Tank buttons stay disabled until then.
- Remove the former `#boarding-rocket` element and `.zooming` image-swap rules. There is one pad rocket throughout movement, opening, filling and launch.
- Keep this essential sequence visible even with reduced-motion preferences: no 500ms shortcut. Decorative screen effects remain subject to reduced motion. CSS explicitly preserves nose-opening/tank/HUD animation durations.
- Each new question resets scenery scale to 1 and the hangar classes; normal selection then repeats.
- `later()` still guards callbacks using `screenVersion`.

Validation after this revision: syntax checks and all 16 Rocket'ier tests (10 core, 6 UI) passed. A new test exercises the measured geometry/animation branch under reduced-motion settings, checks linear 1900ms travel, unchanged rocket-part sources, and the full countdown after preparation. The supplied recording was reviewed; the newly changed visuals have NOT yet been verified in a live browser.

## Previous feature: page-5 filling scene cleanup

Reference inspected: `assets/rocket-game-assets/page-5/page-5-reference.webp`. Also inspected timer.webp, engine-panel.webp, rocket-1-top.webp, rocket-1-bottom.webp and tank-tubes.webp.

- HUD: left 14%, width 68%, top 1.7%, height 6%, using supplied panel images. Three engine indicators remain because engine health is a gameplay requirement.
- Recipe title: compact, unboxed, at top 8%; keep it to identify the mixture being asked for. Hide route/question number and input instructions once selection ends.
- Fuel system: top 10%, left 14%, right 18%, height 42%; three tanks use a 1% grid gap.
- Pipelines: top 47% of fuel system, height 21%; chamber top 64%, left 5%, width 90% of fuel system.
- Removed generated step captions; input ARIA labels still explain each solvent's increment.
- Chamber-total output is visually hidden but still updated and available to assistive technology.
- Rocket and boarding zoom endpoint: left 28%, top 54%, width 44%, height 34%.
- Added vertical touch hit-area expansion around the smaller artwork-aligned Fill/Undo buttons.
- Changed files for this feature: HTML, CSS, browser JS, service worker, specification and this progress file.
- Validation: `npm run check:rocket` passed; all 5 UI mock tests passed, including the full-countdown-after-docking assertion. No actual browser visual verification was available.

## Responsive layout

The game uses a portrait container with `container-type: inline-size`, cqw typography and proportional positioning. Desktop/tablet width is constrained using viewport height, capped at 560px, with a 340px minimum where available. Stage minimum height is 640px; taller portrait geometry uses 177.778cqw. Short screens can scroll rather than clip controls. Journey results use natural flow; popups use dynamic viewport height and scroll.

These layouts were implemented and manually reviewed in source; actual browser/device rendering has not been verified by the assistant. User screenshots have guided iteration. Preserve the user's exact recent positioning overrides.

## Persistence and future database integration

- LocalStorage key: `aurobindo.rocketier.v1`.
- IndexedDB database: `aurobindo-rocketier`, version 1, object store `history`, key `state`.
- LocalStorage supports immediate resume; IndexedDB mirrors full snapshots and can recover them when no LocalStorage save was loaded.
- Schema version 1 includes player ID, latest unlocked mission, completed mission IDs, runs and update timestamp.
- Runs retain IDs, mission/configuration, timestamps, status, engine count, distance, total input time, question order, selections/events, awarded stars and unlocked mission ID on completion.
- Questions retain IDs, recipe ID/name/target and all attempts.
- Attempts retain IDs, rocket choice, timestamps, limit, events for every Fill/Undo with amounts and elapsed time, mixture, outcome, engine states, elapsed/remaining/saved time, bonus, calculated/applied/cumulative distance and speed.
- Reload marks unfinished runs/attempts interrupted. Resume starts the latest unlocked mission fresh, not an unfinished mixture. Historical data is retained rather than pruned.
- Export produces a `rocketier-history-<timestamp>.json` download. Its button is on mission completion.
- This is browser-local storage, not a connected DB. No server API or authentication linkage for this history has been implemented.
- Recipe video URLs are empty `video` fields in `rocket-game-core.js`. User will supply videos later. Keep the “Video coming soon” and retry path functional.

## Cache and launch commands

Current asset versions at this handoff:

```text
rocket-game.css?v=38
rocket-game.js?v=27
rocket-game-core.js?v=1
service worker cache: aurobindo-shell-v415
```

When changing CSS/JS, update references in BOTH `rocket-game.html` and `sw.js`, and increment the service worker cache. Verify the current versions first because subsequent turns may change them. Runtime artwork is already precached; reference images are generally not included.

```powershell
npm run dev
# Default server URL: http://localhost:4173/rocket-game.html
npm run check:rocket
npm run test:rocket
```

The Node test runner initially hit a sandbox `spawn EPERM` with isolated test child processes. Escalated runs worked. A later supported in-process command also worked without spawning children:

```powershell
node --test --test-isolation=none tests/rocket-game.test.cjs tests/rocket-game-ui.test.cjs
```

Follow the current session's permission instructions if a command is blocked; do not assume prior tool availability or approval rules remain unchanged.

## Verification record and limitations

- Initial syntax checks for the repo passed; Rocket'ier syntax has passed after all JS edits.
- Core rules tests passed, covering recipe cycling, exact recipe parity, increments, capacity, deadlines, failures/retries, speed penalties, bonuses, distance caps, unlocks, interruption and all seven missions through ten stars.
- UI mock tests cover correct launch/next question, timeout/video/retry, press-and-hold release, outgoing/incoming transition timing and latest docking sequence with a full countdown afterward.
- Latest commands: `npm run check:rocket` and `node --test --test-isolation=none tests/rocket-game.test.cjs tests/rocket-game-ui.test.cjs`; syntax passed and all 16 tests passed.
- Current files contain 10 core tests and 7 UI tests. The last full run was 16 tests before the variant/nozzle revision; the latest run passed syntax and all 7 UI tests, including all five nozzle geometries at two stage sizes.
- Earlier full repository run: 153 tests, 151 passed, 2 failed in untouched `tests/snake.test.cjs`: missing `beginTutorial` and missing `slitheringBody`. Do not fix unrelated Snake behavior without scope justification.
- Precache and HTML asset-existence checks previously found no missing files.
- Browser control was attempted via `cua.getBrowser({url: 'http://localhost:4173/rocket-game.html'})`; it returned “No browser is available”. No visual browser checks were completed. Playwright was not installed in the repo at that time.
- Mock-DOM tests verify behavior and timing, not CSS geometry, frame rate, rendering or actual Web Animations trajectories.

## Where to continue

There is no pending unanswered gameplay clarification. Follow the user's next requested refinement. If asked to verify or polish the newest sequence, prioritize a real browser check of the clicked rocket's initial coordinates, landing alignment, assembled rocket seams, zoom continuity, input lock and timer start. Check phone/tablet/desktop widths, reduced-motion behavior and whether the conveyor restarts properly for the next question.

Keep progress history intact while debugging. Avoid restoring the removed top bar, resume caption, extra brief card or custom mission popup. Update this file after meaningful changes so it remains useful for the next context window.

## Latest adjustment: attached rocket nose hinge

The user approved the movement sequence but reported that rocket-top was completely detached from rocket-bottom while open. Removed the nose's translate(32%, -16%) offset (and the earlier translated opening rule). Opening now rotates 28 degrees only, around a 92% / 94% origin near the right edge of the body's rim. Set the closed nose top to 1% for a small overlap at the joint. Both conveyor and pad use this same part alignment. Keep the opening animation and all movement timings unchanged.

This was a CSS-only geometry fix plus cache/spec updates; reviewed both opening rules and checked service-worker syntax. No additional gameplay tests were required; live visual confirmation of the hinge is still pending.

## Latest adjustment: fade unselected rockets on selection

On click, `.boarding .rocket-choice` fades opacity to zero over 450ms with linear timing. The selected conveyor copy is already hidden immediately when the continuous pad rocket takes over at its exact bounds. The belt fades separately over 1000ms after a 450ms delay. Removed the previous whole-conveyor 1400ms fade, which left the other rockets visible too long. No unselected rocket zooms or travels; only the chosen rocket performs the existing docking sequence. Explicit transition durations preserve this behavior under reduced-motion settings.

CSS-only change, plus cache/specification updates. Service-worker syntax checked; no new gameplay tests needed for opacity timing. Live visual verification remains pending.

## Latest feature: all variant seams, wider opening and nozzle insertion

The user requested correct top/bottom placement for every rocket, a much wider nose opening, and the mixing chamber tube entering the rocket rather than hanging above it.

- Inspected all ten source top/bottom images, including their actual rim/edge coordinates. The yellow and purple top images contain unequal transparent side space, so a shared percentage layout was incorrect.
- Each conveyor `.rocket-model` and the selected `#pad-rocket` now has `data-variant=1..5`. CSS assigns variant-specific model ratio, nose position/size and hinge coordinates. Body remains top 32%, height 68%; use the source CSS for exact per-variant percentages. These replace the previous common 1% / 22% / 56% / 34% nose geometry.
- Nose opens to 100 degrees, around the measured right-rim joint. This replaces the prior 28-degree rotation while preserving the 650ms opening duration.
- Fuel assembly stays 68% wide, starts at stage top 10%, and is centred on the actual mouth X coordinate (not a universal 50% assumption). The yellow rocket's mouth is slightly left of centre.
- `alignFuelSystem()` sizes the assembly height so the chamber outlet ends at the measured mouth Y plus 0.6% of stage height, visibly entering behind the rim. The chamber is anchored to the bottom of the assembly.
- Pipelines stretch from the tank outlets to the chamber inlet using untransformed layout offsets. Alignment runs when the tanks are revealed and on window resize; hidden scenes are ignored.
- Fuel-system descent uses backwards fill rather than forwards/both so its completed animation does not override the existing launch retraction transform.
- Existing source assets remain unchanged. Diagnostic closed/open composites of all five variants were rendered to a temporary file and visually inspected: seams align and noses pivot at the right rim. This was an asset-geometry preview, not a live browser screenshot.
- Validation: syntax passed; all 7 UI tests passed. The new geometry test checks all five variants at 320px and 560px stage widths, including nozzle centring, insertion depth and pipeline length. Live browser verification remains pending.
- Current cache: CSS v16, JS v10, core v1, service worker v392.

## Latest feature: engraved recipe/model name on the rocket

The user requested moving Column Cleaning / Strong Wash Solvent / etc. from the top of the screen into the rocket body panel between its four screws, with an embedded model-name effect.

- Moved the existing `#question-title` h1 into `#pad-rocket`; the hangar's accessible label still references it. The former top question container is hidden after selection.
- `.rocket-model-name` is centred on the body's existing metal panel, with per-variant adjustments for the blue, green and yellow body plates. No added card/background; dark slate uppercase lettering and fine light/dark bevel shadows suggest engraved metal. Font scales with the portrait container and long recipe names wrap.
- Hide the label whenever a new question is prepared. Reveal it only after the 1900ms travel and 200ms settle, fading in over 450ms as the nose starts opening. It is absent on the conveyor and during transit.
- Validation: syntax passed and all 7 UI tests passed. Docking test now also checks that the title remains hidden through travel and appears after settling. Actual browser typography/placement remains unverified.
- Cache: CSS v17, JS v11, core v1, service worker v393.

## Latest feature: larger tanks, natural tube proportions and fitted controls

The user reported excessively stretched tank-tubes and requested larger solvent tanks plus properly fitted Fill, Undo and Launch buttons.

- Fuel assembly width is now 84% of stage width (was 68%), still centred on the variant-specific rocket mouth and ending at the same insertion depth.
- Tube image dimensions are 636x186. `alignFuelSystem()` now derives tube height from its rendered width using that native aspect ratio. It positions the short tube set above the chamber, then increases the tank row height to fill the remaining upper space. Tank cylinders grow in both width and height instead of leaving long stretched pipes.
- Tank layout uses the calculated row height. Fill/Undo controls sit at top 74.5%, left/right 9%, height 13.7% of each tank, with equal-width buttons and a 2% gap. The image buttons fill their slots; transparent hit-area expansion remains.
- Launch button is centred inside the mixing chamber at left 25%, top 28%, width 50%, height 40%, with contain fitting to preserve its artwork proportions.
- Validation: syntax and all 7 UI tests passed. The geometry test now checks native tube aspect ratio, tank-row height and nozzle alignment for all five variants at 320px/560px stage widths. Live browser verification remains pending.
- Cache: CSS v18, JS v12, core v1, service worker v394.


## Latest feature: connected animated fuel station (supersedes earlier tank geometry)

- Source tanks now use their native 989:1591 aspect ratio, with a 94%-wide fuel assembly and 1.2% gaps. Width and height scale together. Assembly position is calculated upward from the measured rocket mouth; the chamber outlet still inserts 0.6% of stage height into that opening.
- Replaced the fixed tube bitmap with inline SVG curved metallic pipes. Each pipe starts at its tank outlet (97.2% of tank height) and ends at its corresponding chamber inlet. Geometry recalculates on resize for all five rocket variants; no stretched tube image or disconnected inlet gaps.
- Water, ACN and MeOH use the active liquid-sort colours #00cfff, #b627ed and #ffbf25. Source reservoirs begin at 100%; the digital display shows remaining percentage and a separate caption shows percentage added to the chamber.
- Persistent source/chamber liquid elements animate height over 600ms instead of being rebuilt. Glass overlays stay above the liquids; subtle surfaces/bubbles give the liquids motion. Fill runs coloured downward pipe flow; Undo reverses the same pipe and restores the source quantity while reducing the chamber layer.
- Transfers settle after 650ms from the last input. Launch remains disabled during transfer and activates with a pulsing glow/ring only at 100%. Existing hold cadence, recipe increments, capacity, answer validation and timing rules are retained. Timeout/retry/new question clear pending flow animations.
- Tank names now have larger high-contrast labels; source remaining and dispensed quantities are separate. Fill/Undo artwork uses contain fitting, and Launch remains centred within the chamber.
- Rocket question lettering is larger, darker and embossed with layered highlights/shadows, with per-variant placement. It still appears only after docking. Nose rotation increased from 100 to 168 degrees around the measured hinge to clear Launch.
- Validation: syntax check and all 18 tests passed (10 core, 8 UI). Coverage includes five variants at 320/560px widths, natural tank proportions, outlet/inlet path endpoints, source/chamber quantities, matching colours, reverse Undo flow and delayed Launch readiness. Source image transparency was checked. Live browser rendering could not be verified: the available computer tool returned no browser surfaces.
- Cache: CSS v19, JS v13, core v1, service worker v395.


## Latest refinement: dispensed displays and clearer fuel flow

- User correction: digital displays start at 0% and show the amount dispensed (including Undo reductions), while physical source liquid levels still begin full and drain. Removed the separate ?0% added? captions entirely.
- Water / ACN / MeOH labels are larger, bold white lettering with a fine dark shadow for contrast over all three colours. Removed the dark rectangular background.
- Fill/Undo slots expanded from 82% to 92% combined tank width and from 13.7% to 18% tank height, positioned at top 72%. Image proportions and expanded touch targets are retained.
- Active pipes now show a continuous coloured liquid core with bright moving highlights. Undo reverses the highlights; idle pipes return to dark interiors. Chamber layers have animated surface highlights and stronger mixing bubbles during transfer. Source/chamber height transitions remain continuous.
- Validation: syntax check plus all 18 core/UI tests passed; transfer test verifies dispensed counter changes and pipe core activation/reset. Live browser visual verification remains pending.
- Cache: CSS v20, JS v14, core v1, service worker v396.


## Latest refinement: unobstructed chamber, question reveal, fitted controls

- Launch uses the hidden attribute until the mixture is full and transfer has settled. It disappears immediately when unavailable, leaving the chamber visible during filling. Initial HTML also hides it.
- Inspected all five rocket body images together. Reduced the question box to the actual screw-panel interior (roughly 33% left, 48% top, 34% width, 16% height of the assembled rocket, with variant overrides). Previously its 25%-high box centred text too low, near the fin. Text retains embossed styling and uses a smaller responsive font to fit within the screws.
- After docking, the question rises/scales gently into place with two cyan outline pulses. The accessible announcement explicitly calls out the fuel formula at that point. Countdown/docking sequence unchanged.
- Fill/Undo visible artwork now occupies matched slots at tank top 73%, height 15%, left/right 8%, gap 4%. Compensated for different transparent asset margins: Fill bounds (17,38)-(387,245) in 400x280; Undo bounds (14,17)-(397,242) in 400x255. This aligns visible edges without letting Undo spill outside its metal panel. Added pressed feedback.
- Validation: syntax and all 18 tests pass, including hidden Launch before readiness, shown at readiness, and hidden after Undo. Asset geometry inspected; live browser rendering remains unverified.
- Cache: CSS v21, JS v15, core v1, service worker v397.


## Latest fix: Launch tap interception

- The pad rocket has z-index 6 above fuel-system z-index 3. Its transparent rectangular bounds overlap the chamber, intercepting pointer input before it reaches Launch.
- Added pointer-events:none to the decorative .pad-rocket layer (inherited by its artwork, title, flames and smoke). Conveyor selection remains interactive. Launch readiness and submit logic unchanged.
- Validation: syntax and all 18 tests pass, including correct submission and journey transition. Tests do not exercise browser hit-testing; live pointer verification remains pending.
- Cache: CSS v22, JS v15, core v1, service worker v398.


## Latest feature: docked fire and individual engine blowout

- Three independent exhausts use the supplied gifs/Fire Loop.gif. They fade in after docking and stay attached to the rocket during launch. Positions follow the left, centre and right nozzle mouths, including blue/yellow offsets. Flames render behind the rocket body and ignore pointer input.
- Inspected source GIF metadata: Fire Loop has 4 frames / 400ms, infinite loop. Engine Blown has 7 frames / 360ms, infinite loop, with the first six frames lasting only 10ms each.
- Decoded the original Engine Blown GIF frames without altering artwork into gifs/engine-blown-frames.webp (seven horizontal frames). CSS plays this sheet once over 700ms, avoiding uncontrolled GIF looping/restart behaviour. The blowout fades in as the failed flame shrinks, then smoke fades away by 880ms. Failure popup now waits 1000ms.
- engines(blownIndex) marks only the newly failed engine as blowing. Other working engines continue burning, and previously failed engines stay off across retries/questions. Existing engine indicators remain synchronized with the same index. Wrong answers and timeouts share this sequence; correct launch keeps surviving flames. Removed the old whole-rocket smoke effect.
- Validation: game/service-worker syntax passed; all 19 tests passed (10 core, 9 UI), including three successive engine losses, one-shot state cleanup, surviving fires and damage persistence on retry. Browser rendering/visual timing remains unverified in this session.
- Cache: CSS v23, JS v16, core v1, service worker v399. Fire GIF and derived blowout frames are precached for offline use. Original GIFs remain unchanged.


## Latest fix: exhaust coordinate space

- User screenshot exposed flames beside the rocket body. Root cause: the original .flames height:40% survived the newer inset:0 override. Thus exhaust top percentages were calculated against 40% of the rocket height.
- Explicitly set .pad-rocket .flames width and height to 100%. Nozzle offsets now use the full assembled rocket coordinate space.
- Centre each flame on its nozzle with translateX(-50%) and variant-specific left/centre/right and vertical anchors, including the yellow rocket's off-centre middle engine. The body remains above the flames to conceal their roots inside the outlets.
- Cache: CSS v24, JS v16, core v1, service worker v400. Live browser visual verification remains pending; this fix is based on the screenshot and source/CSS geometry.


## Latest adjustment: foreground fire layer

- Per user request, moved .pad-rocket .flames from z-index -1 to 3, above the body and nose artwork. Flame/nozzle coordinates and animation timing are unchanged; pointer input still passes through.
- Supersedes the earlier instruction to render flame roots behind the body.
- Cache: CSS v25, JS v16, core v1, service worker v401.


## Latest adjustment: variant-specific silver exhaust mouths

- Inspected the five body images side by side and anchored flames to the silver outlet centres, not the coloured fins/boosters. Converted body coordinates into assembled rocket coordinates (body top 32%, height 68%).
- Yellow side flames move substantially inward to 27% and 67.5% X; centre is 46% X. Side Y 89.51%, centre Y 95.92%.
- Green side flames move inward to 20.5% and 79.5% X and down to 91.26% Y; centre Y 96.31%.
- Red side mouths: 15%/84.5% X, 88.15% Y; centre Y 96.5%. Blue: 17.5%/82.5% X, 87.57% Y; centre Y 92.23%.
- Purple unchanged. Foreground layering, blowout sequence and interaction logic unchanged. Alignment based on source artwork and supplied screenshots; live rendering remains unverified.
- Cache: CSS v26, JS v16, core v1, service worker v402.


## Latest adjustment: centre Launch in chamber glass

- Inspected container.webp: the glass interior is centred near 41% of the full image height because the outlet extends below the vessel. Moved Launch from top 28% to 21% with its existing 40% height, centring it vertically at 41%. Horizontal centre remains 50%.
- Readiness visibility and pulse animation unchanged. Cache: CSS v27, JS v16, core v1, service worker v403.


## Latest feature: prominent aborted launch

- Wrong answers/timeouts now play a 3-second aborted launch: fuel system clears upward and nose closes, rocket lifts slightly, damaged engine blows at 1150ms with a larger plume and red failure effect, rocket wobbles and settles back onto the pad, then nose/fuel station return.
- Engine icon/fire loss is visually synchronized with the blowout; actual game outcome and engine count remain recorded immediately. Surviving flames keep burning. Failed launches still award no travel and consume no extra question time.
- Failure popup waits until 3100ms, after landing, rather than obscuring the animation. Screen-version guarded callbacks prevent stale scene actions.
- Validation: syntax and all 19 tests passed. Success launch unchanged; failure test checks pre-blowout lift state, delayed blowout, extinguished engines and completed landing across all three losses. Live visual verification remains pending.
- Cache: CSS v28, JS v17, core v1, service worker v404.


## Latest adjustment: artwork-only engine failure popup

- Engine failure panel now displays only popup-art and popup-action. Hidden title/text are reset for other dialogs, including video and retry. The dialog retains an accessible name.
- Cache: CSS v28, JS v18, core v1, service worker v405.


## Latest adjustment: purple rocket exhaust alignment and scale

- Inspected rocket-5-bottom.webp (507x468). Silver outlet centres are approximately (107,405), (253,440), (400,405). Converted these into assembled-rocket coordinates instead of using the old generic 13%/87% side positions.
- Purple side flames now centre at 21.1%/78.9% X, 90.85% Y; middle at 49.9% X, 95.93% Y. Side flames are 20% wide/30% tall; the larger central exhaust uses 25%/34%.
- Only purple geometry changed. Foreground layering and engine-loss sequencing retained. Source geometry inspected; live browser verification remains pending.
- Cache: CSS v29, JS v18, core v1, service worker v406.


## Latest feature: centred engine-failure overlay matching reference

- Inspected page-7-1-reference.webp, engine-failed-panel.webp and watch-video-button.webp. Engine failure now uses the red panel alone, with the supplied Watch Video artwork positioned inside its lower area. Removed outer blue dialog chrome for this popup only.
- Native modal dialog remains for focus/input handling; its fixed bounds track the live hangar rectangle on open, resize and scroll. The game remains visible behind a soft blur confined to the game screen; no separate scene is loaded.
- Panel uses a 650ms scale/slide settle entrance, backdrop fades in, and action fades in with a short delay. Title/text remain hidden. Other dialogs retain their existing presentation.
- Validation: syntax and all 19 tests pass. Live browser rendering remains unverified.
- Cache: CSS v30, JS v19, core v1, service worker v407.


## Latest feature: larger docked rockets and adjusted fuel station

- Reviewed page-5-reference.webp. Increased assembled docked rocket width/height by 20%: left 23.6%, top 47.2%, width 52.8%, height 40.8%. Bottom remains at 88% of stage height so it stays on the pad. Conveyor models retain their existing size; docking measures the larger destination automatically.
- Fuel assembly width reduced from 94% to 86% to maintain HUD clearance above the higher rocket opening. alignFuelSystem derives the chamber/nozzle insertion, proportional tank dimensions and curved inlet pipes from the larger body's measured mouth, including variant-specific offsets.
- Engine positions remain relative to the enlarged rocket, scaling the fire and blowout effects with it. Purple central flame height adjusted from 34% to 29% of rocket height to prevent clipping below the scene. Other nozzle anchors unchanged.
- Increased embossed question font proportionally to fit the larger body panel. Nose opening, fake-launch sequence and normal launch continue using the same assembled rocket.
- Validation: syntax plus all 19 tests passed. Nozzle/tank/pipe geometry now covered for all five variants at 320, 390 and 560px stage widths with the enlarged body bounds. Live browser rendering remains unverified.
- Cache: CSS v31, JS v20, core v1, service worker v408.


## Latest adjustment: slightly larger rockets

- Increased docked size another ~6% to width 56%, height 43.3%, left 22%, top 44.7%. Pad baseline remains 88%.
- Fuel assembly now 84% wide to preserve clearance above the higher mouth. Pipe/nozzle and exhaust positions continue scaling with the model. Updated geometry fixtures.
- Cache: CSS v32, JS v21, core v1, service worker v409.


## Latest feature: full upward successful launch

- Correct answers close the nose and retract the fuel station, with 900ms clearance before ascent. Surviving engine flames extend for thrust; failed engines remain extinguished.
- Rocket accelerates straight upward over 2.6 seconds to -330% of its own height, taking the entire rocket and exhaust beyond the top edge without shrinking or fading it away.
- Journey screen waits until 3700ms, after the rocket clears the scene. Scoped animation rules preserve the full ascent despite general reduced-motion overrides.
- Validation: syntax and all 9 UI tests pass. Success test verifies the launch class and that the hangar remains visible through ascent before the journey transition. Live visual verification pending.
- Cache: CSS v33, JS v22, core v1, service worker v410.


## Latest feature: blackout and intermediate flight cinematic

- After the successful hangar ascent, fade the scene to black over 800ms. Switch directly to the cinematic under full black, bypassing the usual screen sweep so no flash interrupts the blackout.
- Added a clean black cinematic screen with no HUD/text/controls. The same selected rocket variant enters from below, decelerates into screen centre, holds for about 2.6 seconds with mild 1px/.35-degree turbulence, then strengthens its exhaust and accelerates fully beyond the top edge.
- Preserves working/dead engine appearance. Uses nested movement/hover containers so vibration does not interfere with the continuous flight path. Cinematic duration is 8 seconds including empty lead-in and clear-screen pause; results follow only afterward.
- Existing time/distance/history calculations remain unchanged; animations happen after submission. All callbacks retain screen-version cancellation guards.
- Validation: syntax and all 9 UI tests passed. Success test checks blackout, cinematic visibility, hover, acceleration and delayed results. Live browser rendering remains unverified.
- Cache: CSS v34, JS v23, core v1, service worker v411.


## Latest refinement: vertical flight parallax and shorter hover

- Added two seamless downward-scrolling star layers to the intermediate flight scene: distant small stars move slowly; nearer elongated stars move faster. Layers fade in from black and brighten during the boost, while staying behind the rocket.
- Reduced centre hover from approximately 2.6 seconds to 1 second. Cinematic now lasts 6.5 seconds overall; entry and accelerated exit remain smooth. Updated timing assertions.
- Validation: syntax and all 9 UI tests passed. Live visual verification pending.
- Cache: CSS v35, JS v24, core v1, service worker v412.


## Latest feature: page-6 results reference layout

- Inspected Downloads/rocket-game-assets/page-6/page-6-reference.webp and existing local details-panel.webp. Results now use the reference's lower-left hovering rocket, lower-right heading/four-row panel, and supplied Continue Mission button artwork.
- Existing mission-specific page-6-bg-1.webp through page-6-bg-7.webp selection remains driven by mission.id + 1. Background fills the portrait stage without cover-cropping. Planet trail and planet names already in the background are no longer overlaid with duplicate visible route text.
- Four dynamic values populate the panel below its baked labels: distance this launch, overall distance remaining, time saved and rocket speed. Full elapsed/bonus/mission history remains in the data model. Progress/route elements remain accessible but visually hidden.
- Continue keeps the existing next-question / mission-results routing. Added subtle rocket hover and panel entrance animation. Responsive positions use percentages and container-relative type sizes.
- Validation: syntax and all 9 UI tests pass. Live browser visual verification remains pending.
- Cache: CSS v36, JS v25, core v1, service worker v413.


## Latest feature: readable results and distance-driven planet route

- Replaced tiny baked panel labels with responsive HTML label/value rows inside a taller cyan-framed panel. Reused the four supplied icons by cropping the details-panel artwork in CSS. Corrected heading/panel/button placement and spacing; values no longer sit on dividers or outside the panel.
- Added a curved dotted SVG route from origin planet (20%,83%) to destination (81%,23.5%). A glowing covered segment and rocket move together after screen entrance.
- Each launch starts at (mission distance already travelled minus this launch's applied distance) / total distance, ending at cumulative / total. A sampled arc-length lookup maps distance fractions along the curve. The rocket rotates along its tangent, moves for 2600ms after a 700ms entrance delay, and pulses gently on arrival. At 100%, it reaches the destination planet.
- Continue is disabled until route movement finishes. Screen-version guarded callbacks prevent stale updates. Distances, bonus and damage calculations unchanged.
- Validation: syntax and all 10 UI tests pass, including cumulative progression across questions, route timing and exact destination arrival on mission completion. Live browser visual verification pending.
- Cache: CSS v37, JS v26, core v1, service worker v414.


## Latest adjustment: artwork-only retry popup

- Retry now shows only the yellow retry artwork and Retry button. Removed duplicate title/description and outer blue card chrome. Dialog retains an accessible name; other popup modes reset correctly.
- Cache: CSS v38, JS v27, core v1, service worker v415.


## Git publication checks

- All 20 Rocketier tests and game/service-worker syntax checks passed before publication.
- Corrected fire GIF URL casing to match the actual tracked gifs/fire Loop.gif for case-sensitive hosting.


## 26 October 2026: loader stalled at 99% during worker handover

- Screenshot error maps to the loader's 15-second controllerchange timeout, after media downloads have completed. Existing Retry only waited for worker control again; an already-active worker does not repeat its activate handler.
- Added an explicit ROCKET_CLAIM_CLIENTS message from the loader and a service-worker handler calling clients.claim(). Retained the control gate and timeout, with listener/timer cleanup and clearer failure text. Media cache is preserved.
- Loader v4 and service-worker cache v453. Preserved existing uncommitted artwork, manifest and layout edits.
- Validation: game/loader/cache/service-worker syntax passed; all 38 Rocketier tests passed, including newly covered active-worker handover and timeout cleanup. Live browser reproduction remains unverified.


## 26 October 2026: iPhone/Mac compatibility investigation

- User reports asset loading and stationary conveyor on unspecified iPhone/Mac versions; user does not have OS/browser/in-app-browser details. Exact failure not reproduced and no new runtime patch was made speculatively in this investigation.
- Re-ran existing full browser checks against the current local code: Chromium 393x851, WebKit 390x844, and WebKit 320x568 with container units/native animation disabled all passed. Conveyor transform changes, docking, touch controls, screen resizing, success/failure/retry and route movement passed without page errors. All three test runs reached inline video readyState 4 in this run.
- This is Windows browser-engine automation, not physical Apple hardware/Low Power Mode testing. Existing screenshots were regenerated; report saved as artifacts/rocket-mobile-qa/apple-compatibility-review-2026-10-26.json.
- Verified all 199 shared service-worker shell asset paths exist locally. The mandatory shell installation and mandatory media cache remain possible failure points under network/storage restrictions; that does not establish these as the affected users' cause.
- Conveyor already has explicit reduced-motion infinite-loop rules and older-layout fallback. Existing local v453 worker-claim / loader-v4 fix from the previous task has not been pushed in this investigation.


## 26 October 2026: mission popup text matched to supplied page-3 reference

- Inspected C:/Users/Admin/Downloads/page-3-reference.webp. Mission heading is now uppercase yellow at 4.8cqw, centred in the header; route is larger uppercase yellow at 4.4cqw and top 17.2% of the panel.
- Copy starts at 26.8%, uses 3.5cqw type with 1.12 line height, and follows the reference's paragraph breaks. Distance label is yellow; the number and instruction text are white. Dynamic route uses ?Earth to Venus? rather than the smaller arrow line.
- Verified in WebKit at 320, 390 and 560px viewport widths: no text overflow; inspected the 390px screenshot. Syntax checks passed. Local review screenshots are in .preview/mission-*.png.
- Cache: CSS v63, JS v59, loader v4, core v2, helper v1, service worker v454. Existing artwork and other pending changes preserved.


## 26 October 2026: five question/video configuration

- Renamed original Column Cleaning to C Column Wash, retaining Water/ACN/MeOH 90/5/5 and its recipe index. Appended D Column Wash with 10/45/45, preserving existing recipe indices/history snapshots.
- Mapped all five questions to supplied .webm videos: c-column-wash, strong-wash, needle-wash, column-storage and d-column-wash. Original three other mixtures unchanged.
- Shuffle now naturally includes all five questions per bag; boundary repeat prevention and same-question retry preserved. D uses existing increment algorithm: Water 5%, ACN 15%, MeOH 15% per fill/undo step.
- Regenerated content-versioned asset manifest: 89 runtime assets, 24.6 MB. Core v3; service worker v455. CSS v63, presentation JS v59, loader v4.
- Updated recipe tests for five-question bags and D-specific filling/undo/validation. Video playback codecs were not changed or re-encoded.


## 26 October 2026: enlarged fuel controls and shared Undo
- Replaced page-5 solvent-tank, tank-tubes and undo-button artwork with the supplied Downloads files. Tank proportions now use 229/428; enlarged white digital readouts still show dispensed percentage starting at 0%.
- One full-width Fill control per tank, with large centered text. Removed individual Undo controls; a common round Undo beside the chamber reverses the most recent fill portion, including a capacity-clamped final portion. Each reversal is recorded in attempt history. Retry starts with an empty undo stack.
- New pipe artwork is split into three SVG viewports and individually fitted between reservoir outlets and chamber sockets; animated colored streams follow each bend in both directions. Preserved reservoir/chamber level transitions and launch gating while liquid settles.
- Preserved mouth alignment for all five rocket variants, docking, nose, failure and launch sequences. Runtime remains in assets/rocket-game-scripts; artwork in assets/rocket-game-assets.
- CSS v64, presentation JS v60, core v4, scoped shell v2; regenerated the asset revision manifest.
- Validation: syntax checks and all 41 Rocketier automated tests pass, including shared undo, liquid animation state, five-variant nozzle alignment and existing launch/failure flows. Browser visual check performed at 390px; full Chromium/WebKit checks pending below.
- Browser validation complete: Chromium 393px, WebKit 390px and WebKit 320px with animation/CSS fallbacks passed docking, touch fill, shared Undo, correct launch, failure and retry; landscape fit also passed. No JavaScript errors. WebKit video decoding remains unverified (readyState 0 in Windows harness); no video files were changed. Root worker tests (2) and whitespace checks passed.

## 26 October 2026: smoother liquid surfaces
- Reviewed the supplied 160014 screen recording. Removed the oversized expanding oval splash ring and rounded caps on individual liquid layers; empty layers no longer draw floating surface shapes.
- Added one subtle straight highlight at the combined chamber surface. Reservoir levels, chamber levels and inlet stream length now share a steady 600ms transition with no delayed chamber easing. Narrowed and softened the inlet stream, reduced bubbling during mixing and removed brightness jumps.
- Preserved solvent colors, fill amounts, shared Undo and launch settling. CSS v65; scoped worker shell v3.
- Verified mid-fill and mid-Undo in a local Chromium browser; syntax and whitespace checks passed. No gameplay logic changed.


## 26 October 2026: centered tank labels and cleaner typography
- Vertically centered Water, ACN and MeOH in the glass area (50.5% of tank height, offset by half the label height).
- Changed chemical labels and percentage displays to a system UI font with semibold weight; removed heavy percentage glow and reduced label shadow for cleaner readability.
- CSS v66 and scoped shell v4; no changes to fill amounts, flow or game timing.


## 26 October 2026: launch-style countdown
- Countdown now displays T-40, T-39, etc. during selection and timed filling, using the existing mission duration. Timing and timeout logic unchanged.
- Presentation JS v61; scoped shell v5. JavaScript syntax checked.

## 26 October 2026: floating transfer percentages
- Each successful fill step now creates an independent +amount% particle above the chemical name, drifting downward and fading over 900ms. Shared Undo uses a warm-tinted minus amount particle at the source tank with the same downward movement.
- Amount comes from the actual before/after mixture delta, including truncated fills; holding Fill produces one particle per increment. Particles ignore pointer input, are hidden from accessibility announcements and remove themselves after 950ms. Reduced-motion users receive a stationary fade.
- CSS v67, presentation JS v62, scoped shell v6. All 41 Rocketier tests passed; local Chromium fill and Undo visual check completed.


## 26 October 2026: stronger five-echo power-up effect
- Each fill/Undo now emits five downward percentage echoes staggered 90ms apart with slight horizontal spread, larger bold text, brighter solvent-colored glow and a 1.35s lifetime. Removed the small dark pill background. Echoes repeat the actual transferred amount visually; game amounts remain unchanged.
- Automatic particle cleanup and reduced-motion fades preserved. CSS v68, JS v63, scoped shell v7.


## 26 October 2026: directional shrinking percentage bursts
- Fill echoes now rise from the bottom of the tank glass to the top; Undo echoes descend from top to bottom. Both shrink continuously from 1.25x to 0.4x while fading, retaining five staggered echoes and actual transfer values. Reduced-motion fades preserved for both directions.
- CSS v69; scoped shell v8. Whitespace check passed; gameplay logic unchanged.

## 26 October 2026: coordinated percentage trail
- Reviewed rocket-game-details animation continuity requirements. Replaced layout-animated top positions with full-tank compositor transform layers; Fill rises and Undo falls over the same glass bounds while shrinking steadily.
- One readable leading number now has four progressively softer, smaller echoes at 85ms spacing. Removed sideways scattering and heavy glow; shortened each flight to 950ms to reduce accumulation while holding Fill. Retained actual amounts, five echoes, cleanup and reduced-motion fallback.
- CSS v70, JS v64, scoped shell v9. All 41 tests passed; Chromium fill/Undo visual check completed.

## 26 October 2026: stationary percentage trail fix
- Reviewed the 162410 recording: amounts appeared near their starting positions and faded instead of travelling. The reduced-motion rule intentionally replaced travel with stationary fades, matching the observed behavior.
- Removed that trail-specific override so essential Fill-up/Undo-down motion and shrinking remain active, consistent with the explicitly requested sequence and existing docking behavior. Other reduced-motion rules remain unchanged.
- CSS v71; scoped shell v10. Verified in Chromium with reduced motion enabled: Undo transforms changed from y=11.96px/scale=.90 to y=30.55px/scale=.75 during travel.

## 26 October 2026: restore approved attention, shake and smoke
- User explicitly required the original question attention, launch camera shake and launch smoke, smooth animation continuity, and no removal/reduction without permission. Strict instruction placed at the top of both details and progress documents.
- Removed reduced-motion suppression blocks, including the global .01ms animation/transition shortcut, hidden question sweep/pulses, disabled launch shake/clouds and shortened reward/retry effects. Restored original page transitions and tank-display bounce under the same setting.
- Confirmed formula-arrive, formula-sweep, formula-pulse, launch-cloud-roll, launch-haze and launch-camera-shake keyframes exactly match Git HEAD. Original timing/intensity retained; three restrained lower-screen clouds remain as previously approved. Did not restore the rejected oval liquid splash.
- CSS v72, JS v65, scoped shell v11. All 41 tests and syntax checks passed. Chromium full gameplay passed with reduced motion enabled, explicitly checking question sweep/pulse visibility, camera shake and cloud animation, plus launch/failure/retry. Added these assertions and an optional ROCKET_REDUCED_MOTION=1 mode to the browser regression script; updated its old countdown expectation to T-40.


## 26 October 2026: permanent instructions for future agents
- Strengthened the mandatory preservation rule at the top of details and progress. Added root AGENTS.md so future repository agents discover it before editing, including changes outside the game folder. General optimization/accessibility requests do not authorize effect suppression; specific explicit permission is required. Runtime files unchanged.

## 26 October 2026: highlighted animated digital amounts
- Digital amount values now ease through intermediate percentages over 288ms on Fill and Undo, restarting from the currently visible value on rapid input. Fill highlights use the solvent color; Undo highlights use warm gold. Existing bounce, five-echo trails and all other approved animations remain unchanged.
- Floating transfer amounts now use the actual recorded transfer event, so rapid input cannot accidentally report the difference from a partially animated readout. Count timers are cancelled with transfer cleanup; underlying mixture values and launch readiness are unaffected.
- CSS v73, JS v66, scoped shell v12. All 41 tests passed with readout completion checks. Chromium Fill/Undo visual check completed.

## 26 October 2026: sad astronaut popup entrances
- Copied all four supplied astronaut-hero WebP images into the game assets and regenerated preload manifest (93 files). Timeout with surviving engines shows lose-1; mission failed shows lose-2. Win assets are available/preloaded for later placement, not shown on failure screens.
- Added a noninteractive astronaut above the existing popup artwork: 850ms slide/scale/tilt settle with a slight overshoot, then gentle 3.5s idle motion. Existing popup entrance, art, actions and game sequences preserved. Hero hides on video/retry/other popups.
- CSS v74, JS v67, scoped shell v13. All 42 tests passed, including timeout hero, hiding on lesson and third-timeout mission failure. Chromium real-time timeout visual check passed at 390px; mission-failure selection verified in tests.

## 26 October 2026: astronaut on wrong-answer engine failure
- Corrected the overly narrow visibility condition: lose-1 now appears on every engine-failed popup, including wrong answers as well as timeouts. Mission failed continues to use lose-2. Existing entrance/idle animations and popup actions unchanged.
- JS v68, scoped shell v14. All 43 tests passed, including a new actual wrong-answer launch regression. Layout unchanged from the previously browser-verified timeout popup.

## 26 October 2026: three randomized sad astronauts
- Added supplied astronaut-hero-lose-3.webp. Every engine failure (wrong answer or timeout) and mission-failed popup independently chooses one of the three sad images with equal probability; no image is tied to a particular failure page. Existing entrance/idle animation, layout and actions unchanged.
- JS v69, scoped shell v15; regenerated preload manifest (94 files). All 43 tests passed with failure checks accepting any of the three images. No new visual animation changes.

## 26 October 2026: astronaut tucked behind banner
- Lowered the astronaut to overlap the banner top (bottom:82%) and explicitly stacked the astronaut behind the popup artwork, with the action above both. The banner now conceals the cut-off base. Preserved all entrance/idle animation definitions and random selection.
- CSS v75, scoped shell v16. Chromium wrong-answer popup checked with all three images at 390px; banner and action remain unobstructed.

## 26 October 2026: Undo housing alignment
- Used the user's updated metallic/yellow undo-button.webp artwork. Enlarged shared Undo from 14% to 24% of fuel assembly width, positioned at left:75%, bottom:7% to sit against the chamber right edge and align with its body, matching the reference.
- Preserved shared-Undo behavior, disabled state, interaction animations and all other effects. CSS v76; scoped shell v17; rebuilt asset manifest to include the updated artwork revision. Chromium fill/Undo visual check completed at 390px.

## 26 October 2026: animated mission pace results
- Used the replaced page-8 background and reference. Current mission pace is shown in cyan and all-time best in gold, aligned with the artwork labels. Preserved distance/time as a compact lower summary and existing Next Mission navigation; destination message remains accessible.
- Mission pace = sum of elapsedSeconds / resolved attempt count, including correct, incorrect and timeout attempts within that run. Animation/video time is excluded by the existing timer model. Active/interrupted attempts without a resolved result are excluded.
- User confirmed all-time best compares COMPLETED runs across ALL missions. Lowest valid average wins, including the current completion. No completed data yields null rather than a fabricated best; historical attempts can be used without new fields.
- Each submission stores run.pace {attemptCount,responseSeconds,averageSeconds} and data.bestMissionPaceSeconds in existing persistence/history. Completion recomputes from attempt history and persists it, preserving compatibility with previous saves.
- Retained existing result counting sound and distance/time count-up; added staggered scale/slide/blur settles, animated pace counting and cyan/gold light sweeps. Existing gameplay effects unchanged.
- CSS v77, JS v70, core v5, scoped shell v18; refreshed asset manifest. All 44 tests and syntax checks passed. Chromium near-completion fixture verified entry/count-up, persistence and final layout at 390px and 320px. Core test covers retries/timeouts, cross-mission minimum, failed-run exclusion and serialized legacy history.

## 26 October 2026: reading pause between pace results
- Current pace finishes its 1500ms count-up, then holds for a full 1500ms before the best-pace row appears and starts its own count-up. Best-row entrance and sheen remain animated; counting audio stops during the reading pause.
- Removed the completion-screen bottom distance/time elements at the user's explicit request. Underlying history and journey statistics remain intact.
- CSS v78, JS v71, scoped shell v19. All 44 tests passed, including assertions immediately before/after the 1500ms pause. Browser appearance was not rechecked for this timing-only/layout-removal update.

## 26 October 2026: winning astronaut on journey results
- Added a randomly selected win-1/win-2 astronaut above and behind the journey stats card when the destination is reached, matching the existing completion-announcement timing. Lower body overlaps behind the card; the announcement is now a speech bubble saying This journey completed! above the character.
- Added animated slide/scale/tilt entrance and gentle idle movement, retaining the existing title celebration, destination ring, rocket route animation and stat counting. Reset character visibility for each journey.
- CSS v79, JS v72, scoped shell v20. All 44 tests passed with win-image and reveal-state assertions. Chromium near-completion fixture checked the layered card/astronaut; bubble moved closer to the head after inspection.

## 26 October 2026: green/red transfer trails
- Per user request, rising Fill percentage echoes are now bright green with green glow; falling Undo echoes are red with red glow, like market gain/loss feedback. Preserved signed amounts, five echoes, direction, duration, scale/fade animations, actual liquid colors and digital display effects.
- CSS v80, scoped shell v21. Reviewed selector changes and whitespace; color-only update, no gameplay changes or new browser verification.

## 26 October 2026: speech bubble clears winning astronaut
- Anchored the journey speech bubble bottom above the astronaut's full image height plus 16px clearance (bottom:calc(36% + 28cqw + 16px)), replacing the fixed top:47% placement. This reserves room for either pose's raised hand and existing entrance/idle movement without changing those animations or card layering.
- CSS v81, scoped shell v22. Whitespace check passed; browser verification pending.

## 26 October 2026: restore journey celebration wording
- Restored 'Yay! Journey complete!' per user request. Speech bubble placement, astronaut and animations unchanged. JS v73; scoped shell v23.

## 26 October 2026: combined success artwork after every launch
- Copied supplied journey-success-1.webp into page-6 and added it to preload manifest (95 assets). Replaced separate winning-astronaut image and speech-bubble markup with this combined image, as explicitly requested.
- Show image when route arrival reveals stats on every successful launch, including partial mission progress. Existing entrance/idle animations, route travel, destination ring and stat counting preserved. Image spans the card width above its top edge.
- CSS v82, JS v74, scoped shell v24. All 44 tests passed, including success image visibility during intermediate and destination journeys.
- Chromium near-completion fixture visually verified the combined artwork above the stats card at 390px.

## 26 October 2026: release preparation
- Updated current-state snapshots in details/progress and documented the established GitHub Pages production URL, validation and publishing steps in README.
- Release checks: 44 Rocketier tests, 2 root service-worker tests, JavaScript syntax and whitespace checks passed. WebKit migration/offline smoke passed: root redirect, dedicated worker control, offline reload, artwork, moving conveyor and video byte ranges. Git fetch confirmed main matched origin/main before release.
- Release scope includes the complete accumulated Rocketier folder migration, five-recipe/video configuration, artwork/UI/animation updates, pace tracking and strict agent instructions.

## 26 October 2026: engine chances reset per selected rocket
- User explicitly changed engine damage from mission-wide to per rocket. selectRocket resets engines to 3 and records previous/new counts on rocket-selected. Same-question retries still retain damage; all-three-loss mission failure remains unchanged.
- Immediately refresh flames/HUD on selection. Penalty badge tracking now keys by question so a newly damaged rocket can display its penalty even if the prior rocket lost the same number of engines. No animations removed or reduced.
- Core v6, JS v75, scoped shell v25. All 45 tests passed, including two/one-engine launches followed by a fresh rocket, preserved mission distance/history, restored full speed and recurring penalty badges. No physical-device visual verification this turn.

## 26 October 2026: Start Mission stays inside the brief frame
- Wrapped mission-brief artwork and Start Mission in one proportional frame. Button anchors at 82% of artwork height instead of 73% of screen height, with centered 66.666% artwork-relative width.
- Preserved the original 5-second float animation on the shared frame so artwork and button move together; retained button hover/press behavior and all page transitions.
- CSS v83, scoped shell v26. Chromium geometry checks passed at 320x568, 390x844, 768x1024, 1440x900 and 844x390. Button consistently occupies 82%-92.44% of artwork height and remains inside the frame.

## 26 October 2026: centered animated rocket-selection prompt
- Centered Choose your rocket vertically in the hangar (top:50% with translateY(-50%)), retaining horizontal centering. Added repeating 2-second gentle scale/glow pulse and readable text blink while selecting.
- Both attention loops stop immediately when boarding begins, allowing the existing 350ms selection fade to work unchanged. Prompt ignores pointer input; conveyor/docking and all other effects preserved.
- CSS v84, scoped shell v27. Scoped selectors and whitespace checked; no browser visual check this turn.

## 26 October 2026: full-tank fill touch target
- Tapping or holding anywhere on a solvent tank now uses the same fill/increment/animation path as its Fill button. Pointer capture, release/cancel and legacy touch/mouse handling apply to the tank surface too; full capacity and input-phase locks still apply.
- Ignore button-origin events bubbling through the tank to prevent double increments. Tank taps retain liquid sound rather than an extra UI click sound. Existing keyboard-accessible Fill button, Undo and all effects preserved.
- CSS v85, JS v76, scoped shell v28. All 46 tests passed, including surface hold/release and bubbled-button deduplication. No physical-device verification this turn.

## 26 October 2026: spotlight rocket selection
- During selection, dim the background to 35% brightness with the existing smooth filter transition. Add a cyan glowing conveyor bed with a 2.4s breathing highlight and individually outlined/glowing rocket models; hover/focus adds a warmer highlight.
- Highlights apply only before boarding. Existing selection prompt pulse, moving belt, rocket choice hit targets, docking and unselected-rocket fade remain intact; scenery restores smoothly when boarding starts.
- CSS v86, scoped shell v29. Chromium selection-screen visual check at 390px completed.

## 26 October 2026: selection spotlight only on first pickup
- Scoped background dimming, conveyor glow and per-rocket spotlight to the first pickup of each mission run, detected from rocket-selected history. Later pickups have normal lighting. Restarting a mission or beginning the next mission gets the initial spotlight again.
- Preserved centered prompt pulse/blink, conveyor motion, hover behavior and docking effects. CSS v87, JS v77, scoped shell v30.
- All 46 tests passed, including first-selection spotlight and normal lighting for subsequent pickups. No additional browser visual check for this gating change.

## 26 October 2026: alternating Pick Your Rocket artwork
- Replaced the visible selection text panel with the two supplied PNG images, centered and enlarged. Alternate the blue-arrow frame over the red-arrow frame every 900ms, with a gentle 1.8s downward-pointing motion.
- Retained accessible instruction text, first-pickup-only spotlight, conveyor motion and boarding fade. Input remains unobstructed. CSS v88, scoped shell v31; images included in generated asset preload manifest.
- Chromium screenshot verified centered placement at 390px. All 46 tests passed. Completed documentation after the interrupted implementation turn.

## 26 October 2026: lower selection sign and faster alternation
- Anchored Pick Your Rocket above the conveyor at bottom:20.5%, maintaining centered 40% width. Downward-pointing motion now moves from -8px to 0 around its bottom edge so it stays above the rockets.
- Increased red/blue alternation from one frame per 900ms to one per 300ms (600ms full cycle); retained the smooth 1.8s pointing motion and boarding fade.
- CSS v89, scoped shell v32. Chromium screenshot verified the lowered placement at 390px.

## 26 October 2026: stronger downward pointing motion
- Increased sign travel to dip from -6px to +10px and return over the existing smooth 1.8s loop, pointing toward the conveyor more clearly. Preserved the user's adjusted 0.4s artwork-alternation cycle and all selection/boarding behavior.
- CSS v90, scoped shell v33. CSS change reviewed; no new browser check for this small movement adjustment.

## 26 October 2026: selection artwork release checks
- Included the current user-renamed pick-your-rocket1-black.png and pick-your-rocket2-black.png files and regenerated the asset manifest to replace stale original PNG paths. Included the supplied blinker.gif in the generated asset set.
- Preserved user-set 0.4s alternation, downward pointing motion and first-pickup-only spotlight. Rocketier syntax checks and all 46 tests pass after manifest refresh. Removed trailing whitespace in the selection markup.

## 26 October 2026: mission brief Demo popup
- Added Demo below Start Mission, with a full-screen animated dialog, close control and overlaid Start Mission action. Starting from the demo enters the same mission popup as the original button; opening/closing a demo never starts a run.
- User requested a fixed pending asset path: assets/rocket-game-assets/page-2/demo.gif. Until supplied and included by npm run assets:rocket, display Demo coming soon. GIF errors also use that fallback. No substitute GIF created or unrelated animation used.
- CSS v91, JS v78, scoped shell v34; rebuilt asset manifest for current on-disk art. All 47 tests passed. Chromium checked Demo placement, full-screen popup and Start Mission navigation; existing Start Mission containment passed phone/tablet/desktop/landscape sizes. Actual GIF playback awaits the supplied media.

## 26 October 2026: taller brief artwork fits screen with both buttons inside
- Adapted to replaced 1076x1888 mission brief artwork. Raised shared floating frame to 22px and constrained width by both game width and available viewport height, keeping the complete art visible. Brief has a viewport-height layout independent of gameplay minimum scene height.
- Start Mission is at 76% of art height; Demo at 86%, height 6.5%, inside the frame with spacing. Preserved frame float, Demo pulse, button interactions and navigation. CSS v92, scoped shell v35; regenerated the manifest for the replaced artwork.
- Chromium geometry checks passed at 320x568, 390x844, 768x1024, 1440x900 and 844x390: complete image stays inside viewport and both buttons stay inside artwork bounds. 390px screenshot inspected.

## 26 October 2026: supplied red Demo button
- Copied supplied Downloads/demo-button.webp into page-2 and replaced the gold text Demo button with the red image. Kept its internal frame position, pulse, hover/press behavior and full-screen demo action. Image uses contain to preserve proportions.
- CSS v93, scoped shell v36; regenerated preload manifest (99 assets). Chromium geometry checks passed at phone/tablet/desktop/landscape sizes with both controls inside the brief artwork.

## 26 October 2026: demo Start Mission artwork
- Replaced the demo/GIF popup text Start Mission control with the supplied existing page-2/start-mission-button.webp image, using its relative production path and existing asset-cache versioning. Preserved bottom-centered placement, hover/press feedback and mission navigation.
- CSS v94, scoped shell v37. Markup and button action reviewed; no gameplay logic changes.

## 26 October 2026: three-slide GIF demo navigation
- Converted the demo into three slides with Previous/Next buttons, live 1 / 3 indicator and keyboard Left/Right navigation. Boundary buttons disable on first/last slides; reopening resets to slide one. Slide media enters with a 300ms directional fade/slide.
- Preserved fixed first path page-2/demo.gif; additional paths are page-2/demo-2.gif and page-2/demo-3.gif. Missing files show slide-specific coming-soon text. Add media and run npm run assets:rocket when supplied.
- Start Mission image and Close remain available throughout. Footer groups navigation and mission action, reserving media space above so controls are visible in landscape too.
- CSS v95, JS v79, scoped shell v38. All 48 tests passed. Chromium checked Previous/Next, visible footer at 390x844, 320x568 and 844x390, and Start Mission navigation. Actual GIF playback pending supplied files.

## 26 October 2026: responsive GIF demo alignment
- Fixed intrinsic GIF overflow by constraining the media to a minmax(0,1fr) grid row, with navigation and Start Mission in a separate automatic-height footer. Full GIF uses contain and cannot extend under controls. Footer centers the counter between equal-width Previous/Next buttons.
- Preserved full-screen entrance, slide transitions, controls and Start Mission image. Reserved top safe space for Close; compact footer button in short landscape views. Added supplied demo.gif to regenerated preload manifest (100 assets).
- CSS v96, scoped shell v39. Chromium actual-GIF geometry checks passed at 320x568, 390x844, 768x1024, 1440x900 and 844x390, with media/footer separation, visible controls, Close clearance and working mission navigation.

## 26 October 2026: larger demo GIF, compact controls
- Reduced demo padding and combined Previous, counter, Next and Start Mission into one compact footer row. Reduced Close size and positioned it in the corner over the viewing area, freeing the previously reserved header space.
- GIF now uses nearly the full screen height above the footer with contain, preserving complete content and proportions. All controls remain visible and functional; entrance/slide animations preserved.
- CSS v97, scoped shell v40. Chromium actual-GIF checks passed at 320x568, 390x844, 768x1024, 1440x900 and 844x390 with no media/footer overlap or clipped controls.

## 26 October 2026: refined demo footer layout
- Replaced the rejected cramped single-line footer with a centered navigation capsule (Previous / counter / Next) and a separate centered Start Mission image beneath. Compact 32px navigation buttons, balanced spacing, subdued cyan styling and a 230px mission action improve hierarchy without returning to oversized controls.
- Retained minimal viewer padding, complete contained GIF, all navigation behavior and animations. Short landscape uses tighter spacing and a smaller mission button.
- CSS v98, scoped shell v41. Chromium actual-GIF geometry checks pass at phone/tablet/desktop/landscape sizes; 390px screenshot reviewed.

## 26 October 2026: consistent mission brief centering
- Replaced the fixed 22px frame anchor with grid centering in the visible brief screen. Kept width/height containment, proportional internal buttons and the approved frame float. Taller screens now distribute spare room above and below instead of leaving it below only.
- CSS v99, scoped shell v42. Chromium checks passed for reported iPhone SE 375x667, iPhone 16 393x852 and Pixel 9 412x924, plus 320x568, tablet, desktop and landscape. Frame center remains within 10px of screen center while floating; artwork/buttons fully contained.

## 26 October 2026: demo Start Mission unlocks after all slides
- Demo Start Mission is disabled until all three slides have been visited in the current demo opening. A visited-slide set handles Previous/Next and keyboard navigation; returning to earlier slides keeps it unlocked after completion. Reopening resets the requirement.
- Added handler guard as well as disabled state; initial focus moves to Next. Original mission-brief Start Mission remains available. GIF completion/dwell time is not measured; this requirement tracks slide visits, including pending-media slides.
- JS v80, scoped shell v43. All 48 tests pass, including prevention of early start, unlock after slide three and reset on reopen. Existing animations preserved.

## 26 October 2026: demo navigation prominence
- Removed Start Mission from the demo popup at the user's explicit request, including its obsolete visited-slide gate. Mission starts from the existing brief-page button after closing the viewer.
- Enlarged Previous/Next to 54px-high blue controls with bold 15-19px labels, cyan borders and clear hover/press feedback. Centered slide count remains between them; full-width footer gives navigation prominence and more viewing height.
- CSS v100, JS v81, scoped shell v44. All 48 tests pass, including slide navigation, no demo mission action and starting from the brief after closing. Existing demo slide/entrance animations retained.

## 26 October 2026: demo release preparation
- Regenerated manifest including all three supplied demo GIFs, red Demo button and updated mission brief artwork. Current demo has prominent Previous/Next navigation and no Start Mission action; original brief button starts the game.
- Release validation: Rocketier syntax checks, all 48 tests and whitespace checks passed. Remote main matched local HEAD before committing.

## 26 October 2026: Finish on last demo slide
- On slide 3/3 the right navigation button is enabled and reads Finish. Clicking closes the demo, returns to the existing mission brief and restores focus to Demo without starting a mission. Earlier slides show Next; Previous still navigates normally.
- JS v82, scoped shell v45. All 48 tests pass, including Finish state, return to brief without new history and reset to slide one when reopened.

## 26 October 2026: demo Next arrow encoding fix
- The dynamic Next label had a literal question mark from shell text encoding. Replaced it with a JavaScript Unicode escape (U+2192) and corrected the regression assertion, so the right arrow renders consistently. Finish behavior unchanged.
- JS v83, scoped shell v46. All 48 tests passed.
