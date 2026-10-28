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

## 28 October 2026 - Loading panel in lower button area

- Authorization: user requested moving loading progress off the landing car and into the button area, without leaving the screen. Anchored the panel 3% above the bottom, compacted internal padding/spacing and bar height, and limited it to 21% stage height with internal overflow for long error/retry content. Next remains hidden until readiness and replaces the loader as before.
- Presentation only; download checks, retries, loading gate, artwork and game animations preserved. Flow CSS v57, scoped shell v84; HTML/worker URLs synchronized.
- Validation: Edge loading regression passes at phone/tablet sizes; reviewed 320px screenshot with car unobscured and panel inside screen. Loading/Next gate and subsequent reward remain functional. Physical-device review remains pending. Evidence: artifacts/my-carz-loading/themed-*.png.


## 28 October 2026 - GitHub Pages preload byte mismatch

- Authorization: user reported live loading pauses with Incomplete download and supplied the GitHub Pages URL. Audited live assets: icon.svg is served as 288 bytes while deployed manifest expects 289. Git normalizes this SVG's CRLF to LF, creating a one-byte mismatch and correctly blocking readiness.
- Canonicalized My Carz SVG line endings to LF and added a scoped .gitattributes rule to keep their bytes stable across Windows/GitHub deployment. Rebuilt the manifest. Download-size verification and the Next gate remain strict. Added asset filename and received/expected byte counts to mismatch errors; no artwork, animation or gameplay changes.
- Files: .gitattributes, SVG line endings where needed, preload, manifest, HTML/worker, regression test and tracking documents. Preload v2, scoped shell v83; URLs synchronized.
- Validation: syntax checks, all 28 tests and git diff --check pass. All 113 staged asset sizes and SHA256 revisions match manifest after Git normalization. Fix published as 7908372; fresh Edge on live GitHub Pages reaches ready with Next visible and no page errors. Evidence: artifacts/my-carz-live-loading/asset-audit.json, live-verification.json and live-ready.png.


## 28 October 2026 - Git handoff for continued development

- Authorization: user requested pushing the accumulated approved My Carz work to Git. Handoff includes runtime modules, supplied/generated media, current car mappings/fitting, audio, loading/animation flows, config question bank, local paint persistence, scoped cache, tests and verification artifacts. Includes shared AAC MIME support and syntax-check command updates required by this game.
- Current runtime: controller v53, config v26, paint v4, flow CSS v56, scoped shell v82. Current manifest: 113 production files, 16.2 MB. Source assets and tracking history retained. Office temporary document lock file is excluded from the commit and remains on disk.
- Validation before publication: npm run check:my-carz and all 27 unit tests pass; git diff --check passes. Focused browser results are recorded per change above; older browser scripts/artifacts are historical and some assert superseded UI behavior. Known issue: five long prompts shrink below 16px at 320px width, as previously recorded. Physical-device audiovisual review remains pending.
- Continue on another PC: git pull --ff-only origin main, npm start, then open localhost:4173. Saved player data is local to each browser and does not transfer with Git.


## 28 October 2026 - Stop next-car preview at F1

- Authorization: user requested no next Mini after F1. Home preview now lists the selected car followed only by later models in unlock order, with no modulo wrap. Decorative gaps/arrows stop at the final car. F1 shows only its Current car card; F2 still shows F1 next.
- My Cars retains all nine models and existing selection/slide behavior. No gameplay, paint, asset or animation timing changes. Controller v53, scoped shell v82; HTML/worker URLs synchronized.
- Validation: controller syntax and Edge checks pass: F1 has one card and no gap/arrows, navigating back to F2 shows F2/F1 with one gap, My Cars still contains nine cards. Screenshot: artifacts/my-carz-no-wrap/f1.png. Physical-device review remains pending.


## 28 October 2026 - Larger in-game Limousine

- Authorization: user reported only the Limousine is too small in gameplay. Added configurable per-car drivingScale, 1.4 for Limousine and 1 for all other models. Enlarges its game element uniformly by 40%, preserving its long proportions.
- Retains the existing 77% road-center anchor by adjusting bottom offset with element height. Entry endpoints use the same computed resting bottom, avoiding a final-position snap. Existing measured nose/tunnel calibration and exhaust use the new box naturally; timings, lane logic, other cars and garage art remain unchanged.
- Files: config, controller, flow CSS, HTML/worker and tracking documents. Config v26, controller v52, flow CSS v56, scoped shell v81; URLs synchronized.
- Validation: syntax checks and 27 unit tests pass; Edge confirms 1.4 scale, unchanged road center, successful tunnel pass and diamond reward with no page errors. Reviewed gameplay screenshot; git diff --check passes. Evidence: artifacts/my-carz-limo-scale/. Physical-device review remains pending.


## 28 October 2026 - New car artwork across all game pages

- Authorization: user requested every page henceforth use only the new car images. Replaced the remaining inherited preview mapping with the matching car-iso-view model for all nine cars. Scratch reveals, upgraded-car heroes, next-car previews and all-cars tiles now share the same new iso artwork and fitted paint rendering as home/My Cars. Gameplay and the top-view all-cars hero retain cars-top-view. This supersedes the earlier two-page-only preview scope.
- Removed unused legacy filename mapping and excluded the twelve inherited car images from production preload (files remain intact). Inherited scenery/audio remain separate and unchanged. Production preload is now 113 files, 16.2 MB.
- Added a regression guard requiring all car display paths to use new folders and the approved Mini through F2/F1 order. Existing IDs, paint persistence, controls, layout and animation/audio sequences preserved.
- Files: config, manifest builder/generated manifest, HTML/worker, README, unit/finale browser tests and tracking documents. Config v25, scoped shell v80; manifest/cache URLs synchronized.
- Validation: syntax checks, 27 unit tests and git diff --check pass. Full Edge five-answer/scratch-to-upgrade flow passes; upgraded Hatchback and next Sedan sources match the new mapped painted artwork, with single banner entrance and functioning scratch reveal. Reviewed upgrade screenshot. Evidence: artifacts/my-carz-finale/new-upgrade-models.png. Physical-device review remains pending.


## 28 October 2026 - Restore on-road car size for current top-view artwork

- Authorization: user requested comparing old/current top views and correcting all game-car sizes/positions. Current source files now face upward, superseding earlier sideways versions; refreshed all nine visible-body crops and removed stale quarter-turn rotations.
- Found a second cause: controller passes absolute source URLs while paint fitting compared relative paths, bypassing normalization in actual UI. Canonicalized incoming and configured URLs before matching/caching. This also ensures the already-approved garage fitting is actually applied through controller paths.
- Driving render uses a centered 512x768 canvas with 744px visible car height, matching the inherited top-view image's visible length inside the unchanged car element. Aspect ratios are retained, so widths reflect vehicle shape. Existing box position, lane/tunnel calibration, entry/cinematic timings, controls and audio remain unchanged. No source image edits.
- Files: config, paint renderer, regenerated manifest, HTML/worker and tracking documents. Config v24, paint v4, scoped shell v79; cache URLs synchronized.
- Validation: syntax checks, 26 unit tests and git diff --check pass. Actual Edge gameplay now uses normalized data image (previously raw 1800x1200 source). At 393x852, inherited Mini visible length is 125.05px versus 124.97px for each new model, with nose/top placement within 0.6px; all nine absolute-URL paths checked. Reviewed gameplay screenshot. Evidence: artifacts/my-carz-driving-fit/comparison.json and game.png. Physical-device and full cinematic checks across all nine models remain pending.


## 28 October 2026 - Consistent garage-car scale and platform seating

- Authorization: user reported varying car sizes and poor seating on the garage circle. Added per-model garageLayout bounds around the visible car body, excluding transparent/low-alpha margins, and a common 1600x1200 render surface with 1440px visible width and 1100px ground baseline. Source aspect ratios are preserved, so long/low cars retain their shape.
- The existing paint renderer now fits only garagePreview sources to this surface before applying paint. Original and painted cars share placement; home/My Cars heroes and cards use the same result. Driving art, reward previews, source files, saved preferences and slide animation timings remain unchanged.
- Files: config, paint renderer, HTML/worker and tracking documents. Config v23, paint v3, scoped shell v78; cache URLs synchronized.
- Validation: syntax checks and 26 unit tests pass. Edge rendered all nine models through home arrow navigation; reviewed Luxury/F2 platform screenshots and My Cars. Direct normalized-image measurements show all visible widths within 1px (921-922px) and the same 703px ground baseline. Initial bounds included translucent shadows; corrected metadata to visible-body alpha bounds. git diff --check passes. Physical-device review remains pending. Evidence: artifacts/my-carz-garage-fit/.


## 28 October 2026 - Supplied isometric art on home and My Cars

- Authorization: user requested the two garage pages use car-iso-view. Added a garagePreview config path per model, mapped Mini/Hatch/Sedan/SUV/Luxury/Limo/Sports/F2/F1, and routed home/My Cars hero and card rendering through that path.
- Scope stays on the requested pages: driving/top-view art and existing reward/upgrade previews remain unchanged. Saved per-model paint, selection, locked silhouettes and arrow slide animations are preserved. No source media edits.
- Files: config, controller, regenerated manifest, HTML/worker and tracking documents. Config v22, controller v51, scoped shell v77; URLs synchronized.
- Validation: syntax checks and 26 unit tests pass. Edge verifies all nine collection card paths, matching home/My Cars hero art and F2-to-F1 arrow selection transition with no page errors; reviewed collection screenshot. git diff --check passes. Physical-device visual review remains pending. Evidence: artifacts/my-carz-iso-pages/.


## 28 October 2026 - Supplied top-view cars and F2-before-F1 order

- Authorization: user requested driving cars use cars-top-view and F1 unlock after F2. Mapped all nine supplied models in order: Mini, Hatchback, Sedan, SUV, Luxury, Limousine, Sports, F2, F1. Stable car-1 through car-9 IDs and saved paint/unlock slots remain in place. Isometric previews remain unchanged pending supplied matching previews.
- Added per-model drivingLayout crop/rotation metadata and cached canvas normalization in the existing paint renderer. Source files are untouched; render-only transparent-margin cropping and quarter-turn rotation make each car face up the road and fit the existing car element. Original and selected colors both use normalized driving art; original preview rendering remains unchanged. No timing, steering, tunnel, effects or audio changes.
- Files: config, paint renderer, regenerated asset manifest, HTML/worker and tracking documents. Config v21, paint v2, scoped shell v76; manifest/cache URLs synchronized.
- Validation: syntax checks and 26 unit tests pass. Edge renders all nine original/red variants in portrait with F2 then F1; reviewed the full model gallery, no page errors. Evidence: artifacts/my-carz-top-view/. Full moving gameplay and physical-device checks remain pending for these new car shapes.


## 28 October 2026 - Collection header count alignment

- Authorization: user requested fixing the Collection 9/9 header alignment. Vertically centered the live count at the artwork label's 10% header center, reduced its font to clamp(14px,4cqw,24px), and kept it on one line. Label artwork and car grid remain unchanged.
- CSS-only change; flow CSS v55, scoped shell v75; HTML/worker URLs synchronized.
- Validation: Edge layout preview at 320x568, 393x852 and 768x1024 verifies the count center and clearance above the grid; reviewed cropped 393px panel screenshot. This check previews existing modal DOM without replaying the full unlock flow. Physical-device review remains pending. Evidence: artifacts/my-carz-collection-alignment/.


## 28 October 2026 - Unframed final-unlock message

- Authorization: user requested no background behind All 9 cars unlocked and increased text size. Added an all-unlocked state on the upgrade summary, removing only that state's blue next-car-panel background and raising centered text to clamp(20px,5.6cqw,32px). Earlier upgrades retain the next-car panel.
- Preserved page background, car reveal, buttons, audio and animation sequence. Controller v50, flow CSS v54, scoped shell v74; HTML/worker URLs synchronized.
- Files: controller, flow CSS, HTML/worker, final-unlock browser regression and tracking documents.
- Validation: controller syntax and git diff --check pass. Edge final-car unlock flow passes through five answers, diamond finale and scratch reveal; checks at 320x568, 393x852 and 768x1024 confirm no summary background, font at least 20px and no overflow. Reviewed 393px screenshot. Initial test setup incorrectly started at car 1; corrected saved fixture and reran successfully. Physical-device review remains pending. Evidence: artifacts/my-carz-finale/final-unlock-*.png.


## 28 October 2026 - Single upgrade-banner entrance

- Authorization: user reported the 5 Correct in a Row upgrade banner entering twice and requested a logic correction. Found the scratch modal became visible before asynchronous car painting/scratch preparation completed, then its explicit entrance began from zero opacity, creating a visible pre-entrance flash and second arrival.
- Stage the modal card hidden during preparation, start its existing entrance animation, then expose it once the initial animation frame is installed. Preparation errors restore visibility for recovery. Preserved all entrance durations/curves, scratch flyover, finale celebration/exit, sounds, scoring and unlock behavior.
- Files: controller, reward-view, HTML/worker, finale browser regression and tracking documents. Controller v49, reward-view v12, scoped shell v73; URLs synchronized.
- Validation: syntax checks, 26 unit tests and git diff --check pass. Full Edge five-answer flow passes: one banner entrance, no visible preparation frames before entrance, finale/launch and scratch reveal remain functional. Evidence: artifacts/my-carz-finale/banner-single-entry.json and upgrade/scratch screenshots. Physical-device review remains pending.


## 28 October 2026 - Crash guidance alignment and safe padding

- Authorization: user requested fixing crash-panel answer alignment/overflow. Anchored the copy to the artwork's own grid area instead of the combined art/button container. Added a centered safe text box, balanced side/bottom insets and readable system type with tighter line spacing to accommodate supplied Right Action guidance.
- Crash-panel CSS only; artwork, guidance content, retry control, scoring, effects, audio and timings preserved. Flow CSS v53, scoped shell v72; HTML/worker URLs synchronized. Expanded focused crash regression to check every supplied action at phone/tablet sizes.
- Validation: Edge verifies all 31 guidance messages fit inside the artwork safe region at 320x568, 393x852 and 768x1024. Reviewed 320px screenshot; reward origin, loss sounds, HUD reset and retry regression also passes with no page/audio errors. git diff --check passes. Evidence: artifacts/my-carz-diamond-feedback/crash-alignment-*.png. Physical-device review remains pending.


## 28 October 2026 - Racing-theme landing loader

- Authorization: user requested the landing loading panel and progress bar match the game theme. Added a cyan neon double frame, dark blue pit-board surface, checkered flag detail, gold percentage badge and angled gold racing-stripe progress fill. Retry button now uses the matching gold treatment.
- CSS presentation only: real byte progress, asset preparation, errors/retry, readiness gate and Next reveal remain unchanged. No new assets or continuous effect loops. Flow CSS v52, scoped shell v71; HTML/worker URLs synchronized.
- Files: flow CSS, HTML/worker, loading browser regression and tracking documents.
- Validation: Edge loading regression passes; checked 320x568, 393x852 and 768x1024 layouts with no panel overflow, reviewed the 320px screenshot. Next stays hidden until preparation completes, then opens normally; subsequent gameplay/reward check passes with no page errors. git diff --check passes. Physical-device review remains pending. Evidence: artifacts/my-carz-loading/themed-*.png.


## 28 October 2026 - Exit panel alignment and inner padding

- Authorization: user requested alignment/padding correction for the Leave the Track panel. Centered copy within a narrower 76% safe area, slightly reduced responsive type size, and inset both buttons to 78% width with a shorter action area so the lower button clears the frame.
- Scope: exit-panel CSS only; copy, artwork, actions, background, animations and behavior preserved. Flow CSS v51, scoped shell v70; HTML/worker URLs synchronized. Updated exit browser regression URL to the current QA server.
- Validation: Edge regression passes at 320x568, 393x852 and 768x1024, with non-overlapping buttons, Keep playing resuming and Save & Exit returning home, no page errors. Reviewed phone screenshot. Physical-device verification remains pending.


## 28 October 2026 - Production laboratory question bank and crash guidance

- Authorization: user supplied 31 actual questions, Good/Bad classifications and Right Action text, then clarified that crash feedback must display Correct answer: followed by that action content. Replaced the ten temporary inherited scenarios in config with all 31 supplied entries, using stable lab-practice-01 through lab-practice-31 IDs and separate prompt, answer and rightAction fields. Removed table formatting whitespace only; supplied wording/classifications retained.
- Question 10 remains Good as supplied, despite its Right Action saying to complete the specified sonication time; discrepancy was raised with the user, whose reply clarified feedback fields without explicitly changing that classification.
- Wrong-answer page now displays question.rightAction, with Good/Bad fallback for older/custom banks. Existing shuffle/exposure balancing, scoring, persistence, timings, animation and audio remain unchanged. Config v20, controller v48, scoped shell v69; HTML/worker URLs synchronized.
- Files: config, controller, HTML/worker, question-fit and crash-feedback browser regressions, tracking documents. Supplied data snapshot: artifacts/my-carz-question-bank/supplied.json.
- Validation: syntax checks and 26 unit tests pass. Focused Edge crash-guidance regression passes, including exact Right Action text, reward origins, diamond loss/reset and retry with no runtime/audio errors. At 320x568 all supplied prompts fit within safe artwork bounds, but the existing auto-fit reduces some below the 16px readability target (example question 2: 13.64px); responsive regression therefore fails its minimum-size assertion. No layout/timing changes made outside this requested data/feedback scope. Wider-viewport and physical-device review remain pending. All 31 supplied rows compare exactly against config; git diff --check passes.


## 28 October 2026 - Red diamond-loss notification

- Authorization: user requested the loss message match the green +1 Diamond notification, in red. Reused its badge layout, white text, circular icon and entrance animation, with a red border/glow, dark red background and cross icon. Displays Wrong! and the number of diamonds lost.
- Existing falling-diamond sequence, timing, sad cues and reset/retry rules are preserved. Reward-view v11, flow CSS v50, scoped shell v68; HTML/worker cache URLs synchronized.
- Validation: JavaScript syntax checks pass. Focused Edge diamond-feedback regression passes; reviewed the 393x852 screenshot showing the red badge. Diamond origins, staggered loss sounds, HUD reset and retry remain verified. git diff --check passes. Physical-device visual/audio verification remains pending.


## 28 October 2026 - Car-origin rewards and visible diamond loss

- Authorization: user requested successful-answer diamonds fly from the car to the top bar, and wrong answers prominently show every earned diamond being lost with a sad sound per diamond.
- Reward origin now uses the actual car center measured relative to the game stage. Existing reward emphasis, flight, HUD landing, notification and confetti sequencing remain intact.
- After the existing wrong-answer explosion, earned HUD diamonds enlarge and fall away one by one, with a prominent loss message and a descending sad cue for each diamond. Each step is 450ms, followed by a 200ms overlay fade before retry. Zero earned diamonds skips this presentation. Scoring still resets immediately; only its visual presentation waits until after the blast.
- Added configurable diamondLoss settings and diamondLost sound. Generated only the new WAV using build-my-carz-sfx.py --diamond-loss-only, preserving existing audio files. Regenerated asset manifest. Config v19, reward-view v10, flow CSS v49, controller v47, scoped shell v67; HTML/worker URLs synchronized.
- Files: config, reward-view, controller, flow CSS, sound generator/new WAV, manifest, shell/cache files, focused browser regression and prepared-audio count assertions, tracking documents.
- Validation: npm run check:my-carz and all 26 unit tests pass; git diff --check passes. Edge at 393x852 verifies two rewards originate at measured car centers, two staggered loss cues, cleared HUD/core streak, retry, and no page/audio errors. Screenshots reviewed; evidence: artifacts/my-carz-diamond-feedback/. Physical-device smoothness and audible balance remain pending.

## 28 October 2026 - Car Unlock sound on ordinary success confetti

- Authorization: user requested supplied Car Unlock.mp3 play with confetti after successful answers without colliding with the fifth-answer diamond audio.
- Existing unlock cue now starts in the HUD-landing/confetti callback for answers 1-4. The fifth answer deliberately skips this cue; any prior unlock voice is stopped before the level finale, leaving the big-diamond merge's 5 Streak Diamonds audio clear. Existing Car upgraded page reveal cue remains.
- Preserved source files/volumes, diamond and confetti timing, fifth-answer visuals, scoring and controls. Controller v46, scoped shell v66; HTML/worker cache URLs synchronized. Files: controller, shell files, tracking documents and full collection audio regression.
- Validation: syntax checks and 26 unit tests pass. Full Edge unlock run verifies four unlock/confetti cues within a frame of the first four landings, no such cue between fifth landing and big merge, one streak cue, and the later car-reveal cue after the streak duration. No page/audio errors. Evidence: artifacts/my-carz-collection/verification.json. Physical-device audible balance remains pending.

## 28 October 2026 - Streak sound at big-diamond formation

- Authorization: user requested supplied 5 Streak Diamonds.mp3 play when the five diamonds join into the large diamond at level end.
- Moved the existing streak cue from gather start to the merge moment: after all five traveling diamonds converge and immediately as the big-diamond formation begins. The same imported MP3/volume plays once. Gather/merge/celebration/exit timings and all other cues remain unchanged.
- Files: reward-view, HTML, scoped worker and tracking documents. Reward-view v9, scoped shell v65; cache URLs synchronized.
- Validation: reward-view syntax and source sequencing checked; browser/device audiovisual timing verification pending for this focused trigger change.

## 28 October 2026 - Restore original looping Good Bad Ugly gameplay BGM

- Authorization: user requested removing current level BGM1-5 tracks because their loop breaks immersion and using original Good Bad Ugly background music for gameplay.
- Every game level/free play now uses audio/lanerush-bgm.mp3, byte-identical to original Good Bad Ugly source. Kept the single native music element's loop behavior, volume, pause/resume position and menu/game switching. Menu BGM AAC and all SFX remain unchanged; original Good Bad Ugly files are untouched.
- Removed the five imported level-bgm-1.aac through level-bgm-5.aac files from My Carz media and regenerated the preload manifest; supplied Downloads sources remain untouched. Replaced level cycling configuration with musicTracks.game and removed its unused drive-level state. This supersedes the earlier five-track cycling request.
- Files: config, controller, HTML/worker, manifest, five removed level AAC assets, README/tracking documents and music browser regressions. Config v18, controller v45, scoped shell v64; manifest/cache URLs synchronized.
- Validation: syntax checks and 26 unit tests pass. Edge verifies the original MP3 on all nine levels independent of selected car, actual end-to-start loop rollover, pause/resume and menu continuity/return. Offline cached menu/gameplay playback also passes. Source/copy SHA256 match; no runtime/manifest references to removed level tracks remain. Evidence: artifacts/my-carz-bgm/. Physical-device audible loop quality remains pending.

## 28 October 2026 - Remove duplicate lock beside LOCKED text

- Authorization: user requested removing the small lock next to LOCKED, retaining the silhouette overlay.
- Removed only the lower lock element and centered LOCKED/required-level text across the footer. Overlay padlock, silhouettes, names and unlock behavior remain unchanged.
- Controller v44, flow CSS v48, scoped shell v63; HTML/worker cache URLs synchronized. Updated tracking documents.
- Validation: syntax/diff checks; browser/device visual verification pending for this small layout change.

## 28 October 2026 - Resolve local AAC preload 404s on port 4173

- Authorization: user reported Loading paused / Download failed (404) and supplied console errors for menu/level AAC files.
- Confirmed the files exist and current server.mjs includes audio/aac, but the already-running Node preview on localhost:4173 still returned 404 for AAC while serving WebP. A fresh server returned AAC correctly. Verified port 4173's process was node server.mjs and its served config exactly matched this workspace before restarting only that preview process, hidden, with current code.
- All six AAC URLs now return 200 with audio/aac on the user's port. No runtime logic/assets changed and no preload checks bypassed; current cache versions remain unchanged. Retry/refresh can complete the interrupted load.
- Validation: direct HTTP checks for Menu/BGM1-5 pass, followed by browser loading/music/offline-cache verification on localhost:4173 using tests/my-carz-bgm-offline.browser.cjs. Physical-device audio balance remains pending.

## 28 October 2026 - Locked-card footer alignment

- Authorization: user requested fixing the cramped lock/LOCKED/required-level layout in the screenshot.
- Arranged the footer as a two-row grid: padlock and LOCKED on the first row, with CLEAR LEVEL N centered across the full card width underneath. Added consistent spacing and reduced only locked thumbnail height slightly to reserve footer room. Silhouette overlay, names, selected/unlocked cards and functionality remain unchanged.
- Files: flow CSS, HTML, scoped worker and tracking documents. Flow CSS v47, scoped shell v62; cache URLs synchronized.
- Validation: Edge phone checks and screenshot review at 320x568/393x852; evidence artifacts/my-carz-collection/locked-footer-*.png. Physical-device review remains pending.

## 28 October 2026 - Supplied menu and five-level cycling AAC BGM

- Authorization: user supplied Menu BGM.aac for menu pages and BGM1.aac through BGM5.aac for successive game levels, repeating after level 5.
- Imported all six AAC files unchanged into audio/menu-bgm.aac and audio/level-bgm-1.aac through level-bgm-5.aac; all source/copy SHA256 hashes match. Added config.musicTracks and retained the existing 0.35 music volume/loop setting. Original BGM media remain untouched.
- One shared music element switches between menu and gameplay tracks, so music does not overlap. Menu BGM starts after user interaction and continues without restarting between home/My Cars/help pages. Gameplay maps levels 1/6 to BGM1, 2/7 to BGM2, 3/8 to BGM3, 4/9 to BGM4 and 5 to BGM5, independent of selected car. Free play retains level 9's BGM4. Captured drive-level selection keeps reward screens on the completed level's track until moving to menus/starting the next drive.
- Pause/background handling retains playback position; resume continues the same track. Save & Exit restores menu music. Existing SFX engine/cues, animations, answer/scoring and progression remain unchanged.
- Added AAC to generated media preloading and audio/aac MIME support to server.mjs; cached range responses already support audio. Files: six assets, config, controller, manifest builder/generated manifest, HTML/worker, server MIME map, tracking documents and BGM browser checks. Config v17, controller v43, scoped shell v61; media manifest/cache URLs synchronized.
- Validation: syntax checks and 26 unit tests pass. Strict-autoplay Edge verifies actual native AAC playback/time advancement for menus and all nine levels, looping, correct repeat order with Mini selected across all levels, no media/page errors, menu continuity, pause/resume position and Save & Exit music. Additional offline check verifies cached menu and level-6/BGM1 playback. Evidence: tests/my-carz-bgm.browser.cjs, tests/my-carz-bgm-offline.browser.cjs and artifacts/my-carz-bgm/. Test server used refreshed AAC MIME code on localhost:4188; tests accept CARZ_URL. Physical-device speakers/audible mix and Safari remain pending.

## 28 October 2026 - Lock overlays on locked silhouettes

- Authorization: user clarified the requested top lock symbol should appear over each locked car silhouette.
- Added a centered light padlock above each locked model image in My Cars and home previews. Retained the existing lower lock/status/level labels, black silhouettes, saved paint and unlocked/selected visuals; overlays are decorative and do not add interaction.
- Files: controller, flow CSS, HTML, scoped worker and tracking documents. Controller v42, flow CSS v46, scoped shell v60; cache URLs synchronized.
- Validation: syntax checks and Edge phone checks at 320x568/393x852 pass: eight overlays on each page with only Mini unlocked, no overlay on selected/unlocked car, black silhouette treatment retained. Screenshot reviewed: artifacts/my-carz-collection/silhouette-locks-393.png. Physical-device checks remain pending.

## 28 October 2026 - Reference page-11 leave-track dialog

- Authorization: user requested leave-track screen match page-11-referene.webp.
- Added page-11-only exit-modal composition using supplied exit-panel.webp as the actual frame, with no generic panel or duplicate visible heading. Positioned reference message Leaving the track will reset your current streak above supplied Keep Driving and Save And Exit artwork buttons, compensating transparent button margins. Frame retains its source aspect ratio and centered reference placement; backdrop retains stronger blur/dimming.
- Keep Playing retains its accessible label and existing resume action; Save & Exit retains completed-level checkpoint/partial-attempt discard/home behavior. Background-interruption pause dialog remains unchanged. Existing entrance animation/audio remain.
- Files: controller, flow CSS, HTML, scoped worker, tracking documents and tests/my-carz-exit.browser.cjs. Controller v41, flow CSS v45, scoped shell v59; cache URLs synchronized. No media changed.
- Validation: syntax and Edge checks pass for supplied frame/button paths, reference text, transparent outer card, non-overlapping phone/tablet layouts at 320x568, 393x852 and 768x1024, resume and Save & Exit, without page errors. Screenshot reviewed: artifacts/my-carz-exit/page-393.png. Physical-device visual checks remain pending.

## 28 October 2026 - Mystery silhouettes for locked models

- Authorization: user requested fully black silhouette treatment for locked cars in My Cars and the other/home page.
- Applied brightness(0) to locked model images on both pages, preserving alpha outlines while removing visible model detail/color. Home locked previews remain fully opaque so the silhouette is black, with only their labels muted. Unlocked/selected images, saved paint, lock icons/required levels, preview non-interactivity and unlock/reveal animations remain unchanged.
- Files: flow CSS, HTML, scoped worker and tracking documents. Flow CSS v44, scoped shell v58; cache URLs synchronized. No media changed.
- Validation: Edge verifies black filter on every locked collection image and locked home preview, plus phone layouts at 320x568 and 393x852. Screenshot reviewed: artifacts/my-carz-collection/silhouettes-393.png. Physical-device visuals remain pending.

## 28 October 2026 - Strong diamond focus and visible attention-grabbing scratch flight

- Authorization: user requested more blur/dimming during the five-diamond merge and a clearly visible animated scratch-card entrance.
- Finale now uses uniform 82% dark scrim with 10px backdrop blur/55% backdrop brightness, leaving foreground diamond/rays sharp. Existing gather, merge, confetti, launch exit and sounds remain.
- Found the scratch flight ran behind the outgoing finale overlay, with its early movement additionally compressed by shared easing. The real scratch surface now remains hidden/inert during preparation. A sharp visual copy of its ready canvas/art flies in above the overlay at z24, with a tilted swoop, overshoot and settle over the existing configured 1150ms. It hands off at identical final bounds to the original scratch card; source IDs are not duplicated, copy is inert/aria-hidden, and scratching/focus enable only after landing. No source media changes.
- Added optional per-animation easing to the shared helper while retaining its previous defaults for every other call. Scratch uses a more deliberate acceleration curve. Existing modal crossfade and all other animation durations remain unchanged.
- Files: controller, reward-view, flow CSS, HTML, scoped worker, tracking documents and full collection browser regression. Controller v40, reward-view v8, flow CSS v43, scoped shell v57; cache URLs synchronized.
- Validation: syntax checks and 26 unit tests pass. Full unlock browser regression checks computed 10px blur, records foreground-flight position/opacity changes while the real surface is hidden, then scratches/reveals and verifies customization/reload. Focused diamond and moving-card screenshots reviewed: artifacts/my-carz-collection/focused-diamond.png and flying-scratch.png. Existing test wait updated to allow the My Cars arrow slide to finish before paint assertions. Physical-device frame pacing remains pending.

## 28 October 2026 - Cleaner question-text rendering

- Authorization: user reported pixelated question content.
- Question content is native HTML text, not baked into panel artwork. Replaced 800 weight/two stacked dark shadows with native 700 bold, disabled synthetic weight and a single subtle 1px readability shadow. Explicit system font stack and legibility/antialias hints apply only to question text. Preserved white color, size/autofit, center alignment, panel/neon art and all animations/timings.
- Files: flow CSS, HTML, scoped worker and tracking documents. Flow CSS v42, scoped shell v56; cache URLs synchronized.
- Validation: Edge all ten prompts fit and remain centered/white at four viewport sizes (40 checks), with fitted sizes at least 16px. Screenshot reviewed: artifacts/my-carz-text-fit/questions-393.png. The exact rendering on the user's physical device remains unverified.

## 28 October 2026 - My Cars arrow slide transitions

- Authorization: user requested sliding car changes on My Cars arrows like the home page.
- Added directional slide-out/slide-in for the collection hero and model name, sharing config.garageMotion (220ms exit/380ms entrance). Saved paint/images finish preparing before entrance; highlighted model scrolls into view. Guarded overlapping changes and restored arrow eligibility after each transition. Existing model-card selection, paints, Back/Start Driving and home previews remain unchanged.
- Files: controller, HTML, scoped worker, tracking documents and tests/my-carz-collection-slide.browser.cjs. Controller v39, scoped shell v55; cache URLs synchronized.
- Validation: syntax checks and Edge browser regression pass for forward/back slides, visible transform/opacity progression, clean final state, and retained Gold/Teal per-model paint. Evidence: artifacts/my-carz-collection-slide/. Physical-device frame pacing remains pending.

## 28 October 2026 - Remove remaining preview-row interaction

- Authorization: user clarified the between-card arrows must not be clickable either.
- Replaced preview arrow buttons with decorative spans and removed preview-row arrow, wheel, mouse-drag and click-suppression handlers. Disabled row pointer/touch scrolling and hid overflow. The row remains at current/next previews; normal car-name arrows and My Cars selection remain available, with existing selection slide animations.
- Controller v38, flow CSS v41, scoped shell v54; HTML/worker URLs synchronized. Files: controller, CSS, HTML, worker and tracking documents.
- Validation: syntax and diff checks pass; no preview-row navigation handlers or arrow buttons remain. Browser/device verification pending. Historical interactive-carousel browser checks are superseded for this row.

## 28 October 2026 - Diamond/notification immediately on successful tunnel exit

- Authorization: user reported excessive delay after the car exits and requested diamond collection with notification at exit, then confetti.
- Removed the full pass-audio-duration gate. After the existing 900ms suspense entry, pass audio still starts during the 550ms normal-speed exit. The diamond and Correct/+1 notification now start at exit completion; the pass cue finishes naturally without truncation. This supersedes the earlier instruction to wait for its full 2.04-second duration and removes about 1.49 seconds of extra delay.
- Preserved the big-diamond emphasis/flight, HUD landing/pulse, confetti starting at landing, full celebration, next-question dim/slide, and fifth-diamond finale. No change to scoring, controls or source media.
- Files: controller, HTML, scoped worker, tracking documents and existing pass-audio browser regression. Controller v37, scoped shell v53; cache URLs synchronized.
- Validation: syntax checks and 26 unit tests pass. Strict-autoplay Edge verifies diamond/notification starts within one frame of the 550ms exit completion while the supplied pass audio tail remains, followed by confetti and next question without page/audio errors. Evidence: tests/my-carz-pass-audio.browser.cjs and artifacts/my-carz-pass-audio/verification.json. Physical-device timing/audible mix remains pending.

## 28 October 2026 - Display-only home car preview cards

- Authorization: user requested removing interaction from the Current car/Next car cards shown.
- Replaced home preview card buttons with labeled display groups. Cards no longer respond to click/keyboard activation or change the selected model. Preserved current/locked visuals, paint and slide animations. Separate browsing arrows, row wheel/drag/swipe, name-bar selection and My Cars model controls remain functional.
- Files: controller, flow CSS, HTML, scoped worker, tracking documents and existing home browser regression. Controller v36, flow CSS v40, scoped shell v52; cache URLs synchronized.
- Validation: syntax checks and Edge browser check pass: no preview-card buttons, clicking Next car does not select it, separate name arrows still select/save with slide animations, and browsing remains available. Physical-device checks remain pending.

## 28 October 2026 - Approved car names and confetti at HUD landing

- Authorization: user supplied ordered names Mini, Hatchback, Sedan, SUV, Luxury, Limousine, Sports, F1, F2 and requested confetti start immediately when each diamond is collected at the top.
- Assigned these labels in config.cars, keeping stable car-1 through car-9 IDs, order, artwork and per-model saved colors unchanged. Dynamic home/collection/reveal/Next text now uses the approved names; the midnight reset message uses the configured first model name. Existing browser label expectations updated.
- Confetti begins directly inside the diamond onLand callback, together with the HUD update. Removed the separate 300ms post-award wait; retained the award's 200ms fade and HUD pulse, which now overlap the celebration. Each full three-second landing celebration finishes before the next question. Fifth landing also starts confetti immediately; the existing gather/merge proceeds, then awaits that burst before its own full central celebration, preserving the complete big-diamond effect without overlapping confetti canvases.
- Files: config, controller, HTML, scoped worker, tracking documents and browser expectations/timing checks. Config v16, controller v35, scoped shell v51; cache URLs synchronized. No media or storage schema changed.
- Validation: syntax checks and 26 unit tests pass. Full unlock browser run checks approved UI names, model-specific paint persistence and all five confetti starts within one animation frame of HUD collection; source/audio/upgrade/customization flow remains. Evidence: artifacts/my-carz-collection/verification.json, tests/my-carz-collection.browser.cjs. Physical-device frame pacing remains pending.

## 28 October 2026 - Remove Car Upgraded background panel

- Authorization: user requested removing the carz-modal-card behind the Car Upgraded screen shown.
- Removed only its background, visible border and shadow via page-9 reward-modal styling. Kept the border's transparent layout space to avoid moving approved content. Artwork, headings, car, Next panel, button, dimmed/blurred backdrop, audio and animations remain unchanged. Other modal styles are untouched.
- Files: flow CSS, HTML, scoped worker and tracking documents. Flow CSS v39, scoped shell v50; cache URLs synchronized.
- Validation: scoped CSS and diff whitespace checked. Browser/device visual verification pending for this presentation-only change.

## 28 October 2026 - Successful tunnel-pass audio before diamond reward

- Authorization: user supplied Car passes Correctly.mp3 for successful tunnel passage and requested diamond collection/existing diamond audio follow it.
- Copied source unchanged to audio/my-carz-correct-pass.mp3 (SHA256 matches), configured as sounds.pass at 0.6 volume and included in required preload/audio decoding.
- After the correct suspense hold, the supplied pass cue plays as the car begins normal-speed emergence. Diamond presentation and its existing correct cue wait for the full decoded pass-audio duration and camera return, whichever is longer. Existing diamond flight, confetti, next question and five-diamond/unlock sounds remain sequential and unchanged. Answer deadlines/scoring and wrong tunnel outcome are unchanged.
- Audio module exposes decoded cue durations for foreground-clock sequencing; native fallback uses available media duration. Config v15, audio v2, controller v34, scoped shell v49; media manifest regenerated and cache URLs synchronized. Files: MP3, config, audio module, controller, HTML/worker, manifest, tracking documents and focused audio regression.
- Validation: syntax checks and 26 unit tests pass. Strict-autoplay Edge verifies nonzero pass-sound output, no diamond while it plays, existing diamond cue starting after its full duration, then confetti and next question without page/audio errors. Evidence: tests/my-carz-pass-audio.browser.cjs and artifacts/my-carz-pass-audio/verification.json. Physical-device audible balance remains pending.

## 28 October 2026 - Equal-size post-unlock buttons in requested order

- Authorization: user requested Back below Start Driving with both the same size.
- On post-unlock My Cars, placed Start Driving first and Back beneath it. Both share 66% stage width, 6% height and a 44px minimum tap height. Compensated for Start Driving artwork's transparent margins as already done for Back, aligning visible sizes without editing images. Normal collection visits retain their existing single Back button.
- Files: flow CSS, HTML, scoped worker and tracking documents. Flow CSS v38, scoped shell v48; cache URLs synchronized. Navigation/animation behavior unchanged.
- Validation: Edge at 320x568 and 393x852 verifies order, equal dimensions and no overlap; screenshots reviewed in artifacts/my-carz-collection/equal-buttons-*.png. Physical-device checks remain pending.

## 28 October 2026 - Front-origin blast and crashed car stays inside tunnel

- Authorization: user requested explosion originate from the car front rather than its middle, and no car emergence after explosion.
- Added front geometry from the selected car's calibrated visible alpha bounds, including current lean and entered position. Blast/smoke anchor follows this measured nose each frame instead of the car-box center.
- During wrong feedback after entry, car and tunnel advance together with the existing slowed road motion, preserving their relative overlap. At the end of the explosion they hold together through the wrong-answer screen; only choosing retry resets/releases the car. Opacity stays 1. Correct tunnel passage, explosion frame/audio timing, smoke/shake, score and controls remain unchanged.
- Files: race-view, controller, HTML, scoped worker, tracking documents and tests/my-carz-crash-front.browser.cjs. Race-view v13, controller v33, scoped shell v47; cache URLs synchronized.
- Validation: syntax/unit checks pass (26 tests). Edge verifies nose anchor above car center, stable car/tunnel overlap during blast, stationary aftermath through the modal and normal car return only after retry; supplied explosion audio still produces a nonzero signal with no engine/page errors. Screenshot reviewed: artifacts/my-carz-crash-front/front-explosion.png. Physical-device visual/audio checks remain pending.

## 28 October 2026 - Isometric Next panel and reliable delayed SFX playback

- Authorization: user requested supplied page-9 Next panel with an isometric next-car preview and investigation/fix of missing generated sound effects.
- Replaced plain next-car text with next-car-panel.webp, a dynamic Next model label, five empty/muted diamonds and 0/5, plus the next model's configured isometric preview with saved paint. Final unlock retains All 9 cars unlocked without indexing a nonexistent next model. Page-9 artwork sizing accommodates the panel above Keep Driving; existing unlock rotation/celebration and choice-before-driving remain.
- Found an unreliable audio path: independent HTML audio elements started from delayed animation callbacks without shared gesture unlocking, with play failures silently swallowed. That can block delayed mobile effects; the user's physical device cause was not directly inspected. Added my-carz-audio.js: one pointer/keyboard-unlocked AudioContext, predecoded buffers for all nine effects before Next is enabled, configured gain levels, one active voice per cue, and bounded diagnostics. Music remains the existing HTML audio path; browsers without Web Audio retain native fallback with console diagnostics.
- Effects pause by retaining offsets and stopping active voices, then resume from offsets on explicit game resume. UI click audio does not restart paused gameplay cues. GO stops the countdown source before its own cue. Existing timing, supplied audio files, volumes, scoring and animations remain unchanged. No sound assets replaced.
- Files: new audio module, controller, HTML, flow CSS, scoped worker, package syntax check, tracking documents and audio/collection browser regressions. Audio v1, controller v32, flow CSS v37, scoped shell v46; HTML/worker cache URLs synchronized.
- Validation: syntax checks and 26 unit tests pass. Edge full unlock verifies supplied Next artwork structure, five diamonds and isometric preview, then customization/reopen; screenshot artifacts/my-carz-collection/next-car-panel.png reviewed. Strict user-gesture autoplay browser test confirms nine effects decoded, running context, nonzero rendered GO/question/explosion signals and pause/resume, with no page/audio-engine errors. Evidence: tests/my-carz-audio.browser.cjs and artifacts/my-carz-audio/verification.json. Streak/unlock triggers verified through engine diagnostics in full unlock. Physical-device speakers, audible mix and Safari remain unverified.

## 28 October 2026 - Responsive steering, natural tunnel occlusion and larger explosion

- Authorization: user requested steering remain enabled during question entrance/waiting, no artificial car opacity changes during tunnel passage, a larger explosion, and natural use of the supplied tunnel artwork.
- Steering now accepts intro/question/reading/recovery inputs as well as travel, while retaining modal/pause/screen-transition protections and the answer commit guard. Retry return releases the previous answer's steering lock on input; tire trails support the newly steerable visible phases. Reading/travel deadlines and scoring remain unchanged.
- Removed correct/wrong tunnel opacity reduction and the explicit wrong-feedback visibility hide. Car opacity stays 1 beneath the tunnel artwork through both outcomes. Entry depth is now 1.5% of stage height, keeping the car within the opaque tunnel header instead of emerging above it; natural stacking covers most of its body during suspense. Slow motion, zoom, source explosion/audio, smoke/shake and retry remain.
- Enlarged configured explosion width from 84% to 105% of road width (25% larger). Removed unused carHideSeconds; total entry/blast/question-exit timing is unchanged.
- Files: config, controller, race-view, HTML, scoped worker, tracking documents and focused browser regressions. Config v14, controller v31, race-view v12, scoped shell v45; cache URLs synchronized.
- Validation: syntax checks and 26 unit tests pass. Edge verifies steering during question slide/reading/recovery, constant opacity 1 and visible car during correct and wrong tunnel stages, 105% explosion width and intact retry. Pixel-alpha overlap measurement found approximately 76% of the tested car naturally covered by the supplied tunnel art during correct suspense. Evidence/screenshots: tests/my-carz-responsive-steering.browser.cjs and artifacts/my-carz-responsive-steering/. Older crash/audio regression expectations updated for the new opacity/depth; not all rerun. Physical-device frame pacing/input feel and live audio remain pending.

## 28 October 2026 - Supplied streak, car-unlock and explosion MP3s

- Authorization: user supplied 5 Streak Diamonds.mp3 for the five-diamond merge, Car Unlock.mp3 for the new-car unlock page, and Explode.mp3 for the explosion.
- Copied all three MP3 files unchanged into game audio assets as my-carz-five-diamonds.mp3, my-carz-car-unlock.mp3 and my-carz-explode.mp3. Source/copy SHA256 matches for each. Config.sounds contains paths and initial 0.6 volumes.
- Streak audio starts once when all five HUD diamonds begin gathering into the central diamond. Unlock audio starts once on the revealed Car upgraded screen (page 9). Supplied Explode replaces the generated explosion sound at the existing post-entry blast trigger. GO, question whoosh, music, correct/wrong cues, pause/resume handling and animation timing remain unchanged. Previous source media are retained.
- Files: three new MP3 assets, config, reward-view callback, controller, HTML, scoped worker, generated media manifest, tracking documents and existing audio/collection browser regressions. Config v13, reward-view v7, controller v30, scoped shell v44; media preload manifest regenerated and cache URLs synchronized.
- Validation: syntax checks and 26 unit tests pass. Browser audio regression verifies supplied explosion MP3 decoding/trigger after tunnel entry and subsequent retry/correct flow. Full unlock regression verifies one streak trigger and one Car Unlock trigger on Car upgraded, followed by customization/start/reopen. Evidence: artifacts/my-carz-sfx-tunnels/verification.json and artifacts/my-carz-collection/verification.json. Actual live listening/mix and physical-device speakers remain pending.

## 28 October 2026 - Desktop car browsing and between-card navigation

- Authorization: user reported desktop wheel/drag did not browse home cards, could not return using the forward-only arrow, and requested arrows between every pair of car cards.
- Replaced the standalone end arrow with real previous/next controls in every card gap. Controls smoothly scroll in both directions and reflect row bounds; partially clipped gap controls are hidden so visible arrows remain fully clickable. Existing disabled locked-car selection remains.
- Added vertical/horizontal mouse-wheel scrolling and mouse drag, including pointer capture after a 6px threshold, native image-drag prevention and suppression of accidental selection after a drag. Touch retains native horizontal swiping. Kept hero/name/row selection slide animations and saved selection semantics.
- Updated row spacing for in-row controls; selected-card decorative pseudo-arrows are replaced by the actual buttons. Files: controller, HTML, flow CSS, scoped worker, tracking documents and home browsing regressions. Controller v29, flow CSS v36, scoped shell v43; cache URLs synchronized.
- Validation: syntax checks and 26 unit tests pass. Edge desktop verifies forward and backward controls, vertical wheel navigation, mouse drag back without selection, and animated name-arrow selection. Phone layouts at 320x568 and 393x852 retain visible gap arrows. Screenshots/evidence: artifacts/my-carz-home-carousel/desktop-verification.json, desktop-between-arrows.png and between-arrows-*.png. Test: tests/my-carz-home-desktop.browser.cjs. Physical-device touch/frame-pacing remains pending.

## 28 October 2026 - Midnight reset message above Start Driving

- Authorization: user requested the exact screenshot text above the home Start Driving button.
- Added centered white Game will reset at 12 am everyday copy between the paint swatches and Start Driving. Existing IST reset logic, controls, layout positions and animations remain unchanged.
- Files: HTML, flow CSS, scoped worker and tracking documents. Flow CSS v35, scoped shell v42; cache URLs synchronized.
- Validation: source placement and diff whitespace checked. Browser/device visual verification pending for this text-only change.

## 28 October 2026 - Mobile home preview arrow and animated car selection

- Authorization: user reported the home arrow beside the next-car card was clipped on mobile, requested it browse later cars, and requested slide-out/slide-in car/card animations when selection changes.
- Replaced the decorative end-arrow behavior with a real Show next cars button inside the stage, reserving space beside the preview row. It smoothly scrolls later model cards without selecting locked cars; it disables at the end. Retained the double-chevron between current/next cards and existing swipe scrolling. Name arrows still select unlocked models only.
- Added serialized directional slide-out (220ms) and slide-in (380ms) for the hero car, car name and current/next preview row. Both name-arrow and unlocked-card selection use the same sequence. Home interactions are guarded during the swap; painted images are prepared before entrance, with existing save/paint/selection semantics retained. Config.garageMotion holds durations. Locked-car selection, gameplay/level timings and My Cars styling remain unchanged.
- Files: config, controller, HTML, flow CSS, scoped worker, tracking documents and tests/my-carz-home-carousel.browser.cjs. Config v12, controller v28, flow CSS v34, scoped shell v41; cache URLs synchronized.
- Validation: syntax checks and 26 unit tests pass. Edge at 320x568 and 393x852 verifies fully in-bounds clickable advance arrow, later-model scrolling, animated transforms/opacity on both hero and row, name-arrow/card-click selection and saved selected car, with locked/unlocked upper limit intact and no page errors. Screenshot reviewed: artifacts/my-carz-home-carousel/home-320.png; timing/frames evidence verification.json. Physical-device frame pacing/touch checks remain pending.

## 28 October 2026 - Reference locked-car panels

- Authorization: user requested locked My Cars panels match the supplied screenshot.
- Added muted dark cards/thumbnails, gray model names, a drawn padlock beside LOCKED and CLEAR LEVEL N beneath it. Required levels follow the existing unlock order (car-2 clears level 1 through car-9 clears level 8). Retained current configured model names/art, saved paint, selected-card glow and disabled locked selection. Home cards and all gameplay/animations remain unchanged.
- Files: controller, flow CSS, HTML, scoped worker and tracking documents. Controller v27, flow CSS v33, scoped shell v40; cache URLs synchronized.
- Validation: syntax checks pass. Edge at 320x568 and 393x852 verifies eight disabled locked cards/icons, correct level labels and unchanged Back navigation. Screenshot reviewed: artifacts/my-carz-collection/locked-cards-393.png. Physical-device visual checks remain pending.

## 28 October 2026 - Larger My Cars Back button

- Authorization: user reported the My Cars Back button was too small.
- Enlarged the centered button to 66% of stage width with at least a 44px tap height. Compensated in CSS for the supplied artwork's transparent margins, so visible artwork fills the target. Source image remains unchanged. Shifted only the post-unlock Back placement enough to stay clear of Start Driving and swatches; navigation and animations remain unchanged.
- Files: flow CSS, HTML, scoped worker and tracking documents. Flow CSS v32, scoped shell v39; cache URLs synchronized.
- Validation: Edge at 320x568 and 393x852 confirms target size, no overlap with Start Driving and working Back navigation. Screenshot reviewed: artifacts/my-carz-collection/larger-back-393.png. Physical-device tap checks remain pending.

## 28 October 2026 - Persistent model paint and pre-drive My Cars selection

- Authorization: user requested persistent selected color per model, backend-capable storage, My Cars selection before driving after unlock, and page-4-reference.webp layout. User clarified to store locally for now; no backend/network integration is enabled.
- Added profile.preferences.carColors keyed by stable configured car IDs. Daily colors are retained as a compatibility projection; old daily/legacy values migrate automatically and invalid preferences are validated. Paint now survives reopen, midnight gameplay reset and later re-unlocking, including locked models. This explicitly supersedes historical reset-all-paint behavior. Daily unlock/selected eligibility, answered-question/statistics checkpoint rules remain unchanged.
- Existing local Repository serializes the complete profile/preferences; the same async adapter contract can round-trip it through a future backend. No endpoint/auth schema or server calls invented. Contract: docs/paint-persistence.md.
- After a new-car reveal/continuation, My Cars opens instead of automatically starting the next level. Players select an unlocked model and paint, then explicitly Start Driving; Back returns home. The all-cars final-unlock actions also permit this choice before driving. Normal collection visits keep their reference Back behavior.
- Page 4 now uses supplied background/Unlocked Today badge/Back art at reference positions, centered painted hero, previous/next name bar, five visible horizontally scrolling model cards, selected/locked states and paint swatches. All model thumbnails reflect their saved paint. Existing temporary model names/art and all configured paints remain. Added Start Driving only during post-unlock customization, using existing supplied start artwork.
- Files: core, controller, HTML, flow CSS, scoped worker, tracking documents, storage contract and unit/browser regressions. Core v2, controller v26, flow CSS v31, scoped shell v38; cache URLs synchronized. No media changed.
- Validation: syntax checks and 26 unit tests pass, including legacy migration, independent per-model paint, reload/midnight/re-unlock retention and repository round-trip without saving partial answers. Edge completed an unlock/scratch/reveal, verified no auto-start, chose independent paints, explicitly started the chosen model, reopened and verified retained color. Responsive screenshots at 320x568, 393x852 and 768x1024 reviewed. Test/evidence: tests/my-carz-collection.browser.cjs and artifacts/my-carz-collection/. Existing upgrade browser scripts updated for the explicit Start Driving step; not all older scripts rerun. Physical-device touch/frame pacing remains pending.

## 28 October 2026 - Stronger result/reward background focus

- Authorization: user requested increased background blur and darker dimming on wrong-answer, level-completion and all-cars-unlocked style screens.
- Increased backdrop blur to 8px with 65% backdrop brightness for crash, scratch-upgrade, car-upgraded and all-cars modals. Custom artwork screens now use a 72% dark scrim; the existing darker generic upgrade scrim remains 87%. The filter applies behind modal content, keeping artwork, car/collection, text and controls sharp. No foreground animation, timing, audio, gameplay or layout changes; other dialogs/countdown remain unchanged.
- Files: flow CSS, controller (page-9 reward class), HTML, scoped worker, tracking documents and backdrop assertion in the existing SFX/tunnel browser regression. Flow CSS v30, controller v25, scoped shell v37; cache URLs synchronized.
- Validation: syntax checks pass. Edge regression checks 8px/65% backdrop filtering and unfiltered foreground, then completes retry/correct celebration flow; screenshot: artifacts/my-carz-sfx-tunnels/dimmed-wrong-answer.png. Physical-device blur/frame-pacing checks remain pending.

## 28 October 2026 - GO/question/explosion effects and updated tunnel suspense

- Authorization: user requested a special GO cue after countdown, generated question-slide audio, explosion audio and supplied updated Good/Bad tunnel images with the car beneath them during suspense.
- Generated original stereo PCM WAVs: a 720ms rising arcade GO chord/rev, a 380ms right-to-left question whoosh and a 1600ms layered sub-boom/crackle/rumble explosion. Reproducible standard-library generator: build-my-carz-sfx.py. Config.sounds holds paths/volumes. Existing button/music/correct/wrong audio remain.
- GO sound fires once when text becomes GO!, after the three original countdown beats; the original countdown is paused there to avoid its old final cue overlapping. Question whoosh starts at the actual question slide after any pre-dim. Explosion sound starts with the first supplied blast frame after wrong tunnel entry, not at contact. New sounds use existing silence/resume handling and are included in the required asset preload.
- Imported tunnel-good-updated.webp and tunnel-bad-updated.webp unchanged into page-5 (source/copy SHA256 match). Config.tunnels maps Good/Bad to them; original source tunnel files remain. Their dimensions match prior assets, preserving approach/contact timing and above-car stacking. Correct suspense now conceals the car smoothly as it enters and restores visibility with normal-speed emergence; wrong entry conceals it before the blast, preventing the roof peeking above the tunnel. Car/world timing and scoring remain unchanged.
- Files: new audio assets/generator and tunnel assets; config, controller, race-view, HTML, scoped worker, generated media manifest, tracking documents and tests/my-carz-sfx-tunnels.browser.cjs. Config v11, controller v24, race-view v11, scoped shell v36; media manifest/cache URLs synchronized.
- Validation: syntax checks and 23 unit tests pass. Edge checks exactly one GO trigger at GO text, whoosh at question entry, blast sound only after tunnel entry, all three WAVs decoded as stereo, new tunnel paths/z-order, concealed correct entry, wrong retry and correct next-question continuation, with no page/audio-play promise errors. Screenshots/timing evidence: artifacts/my-carz-sfx-tunnels/. Tunnel copy hashes match supplied files. Actual audible balance/quality and physical-device speaker/frame-pacing checks remain pending; no live listening claimed.

## 28 October 2026 - Page-10 all-cars composition

- Authorization: user requested the all-nine-cars screen match page-10-reference.webp using the assets in that folder.
- Added a page-10-only unframed layout: supplied all-cars title banner, central selected driving car with animated gold rays, supplied collection panel with 9/9 count and nine configured preview cars/selected highlight, and supplied Keep Driving/My Cars image buttons at reference positions. Duplicate generic heading/copy remain accessible but visually hidden. Background is the softly dimmed/blurred current race, with no generic modal card surface.
- Both existing entry points use the same showAllCars presentation: continuation after unlocking car-9 and five-correct free-play completion (previously the plain Five in a row dialog shown by the user). Keep Driving retains continuation; My Cars retains collection navigation and unlocked data. Scratch/reveal for new cars and the diamond finale remain.
- Asset limitation: page-10 supplies four UI images but no separate F2 driving car or nine reference vehicle illustrations. Hero/collection therefore use actual configured game cars/paint rather than extracting vehicles from the composite reference or inventing assets. Layout uses supplied page-10 UI artwork; reference-exact F2 vehicle art awaits user assets.
- Files: controller, HTML, flow CSS, scoped worker, tracking documents and tests/my-carz-all-cars.browser.cjs. Controller v23, flow CSS v29, scoped shell v35; cache URLs synchronized. No media changed.
- Validation: syntax checks and 23 unit tests pass. Focused Edge regression plays five correct free-play answers, verifies nine collection tiles/one selection, transparent page-10 card, responsive actions at phone/tablet sizes and My Cars navigation. Evidence: artifacts/my-carz-all-cars/. Physical-device frame pacing/audio remain pending.

## 28 October 2026 - Larger question panel and mobile reading size

- Authorization: user requested larger question text and panel for mobile readability.
- Increased panel height from 14.3% to 20% of stage height and width from 97% to 99%. Increased preferred type from 4.2cqw (13-26px) to 5.2cqw (16-32px). Full-prompt adaptive fitting, centered white text, artwork-safe insets, colors/glow and all animation/answer timings remain unchanged.
- Files: flow CSS, HTML, scoped worker, tracking documents and responsive browser check. Flow CSS v28, scoped shell v34; HTML/worker cache URLs synchronized.
- Validation: Edge verified all ten questions across 320x568, 393x852, 768x1024 and 1280x900 (40 checks): full text fits its safe area, remains centered/white, and every fitted font is at least 16px. Narrow-phone longest-question screenshot reviewed in artifacts/my-carz-text-fit/. Physical-device readability remains pending.

## 28 October 2026 - Correct-answer cinematic tunnel entry and normal-speed exit

- Authorization: user requested slow motion and cinematic zoom while entering the correct tunnel, followed by normal-speed emergence.
- At correct contact, retain the scoring/committed answer and show a 900ms suspense entry. The car moves beneath the tunnel while the shared road/scenery/tunnel motion eases to 18% speed; the race world zooms smoothly to 112% around the car over 350ms. HUD/question/controls remain outside the camera transform.
- Over the next 550ms, car position, camera and world speed smoothly return to normal. Correct sound/diamond reward begin after this cinematic, preserving their mutual synchronization and the existing diamond flight -> HUD -> full golden confetti -> dim -> question sequence. Fifth-answer merge/upgrade also follows that same reward pipeline. Existing wrong-entry/explosion presentation remains unchanged.
- Added config.correctCinematic for slow/return duration, world speed scale, entry depth, zoom and zoom-in duration. No change to reading/travel deadlines, steering or scoring. Race camera resets on retry/new drive and follows existing pause/background timing; only transform is applied for zoom, with no new raster media/filter.
- Files: config, race-view, controller, HTML, scoped worker and tracking documents. Config v10, race-view v10, controller v22, scoped shell v33; HTML/worker cache URLs synchronized.
- Validation: syntax checks and 23 unit tests pass. Edge checked car entry with >110% camera and <25% world speed, then full camera/speed restoration before the diamond appears, followed by intact three-second confetti and next-question flow without page errors. Screenshot reviewed: artifacts/my-carz-celebration-order/cinematic-entry.png. Test: tests/my-carz-celebration-order.browser.cjs. Physical-device smoothness and live audio remain pending.

## 28 October 2026 - Enter tunnel before slow-motion explosion

- Authorization: user requested the car enter the tunnel before exploding, with a slow-motion effect.
- Wrong-answer scoring/lane commitment still happen at original tunnel contact. Presentation now waits 600ms while the car advances beneath the tunnel by 6% of stage height. Road/scenery/tunnel displacement stays synchronized at 18% visual speed during crash feedback. No blast or wrong-answer label appears at contact.
- Wrong sound, seven black smoke puffs, existing camera shake/flash and supplied explosion start only after entry. Explosion center follows the car's entered position. The full supplied frame sequence now runs over 2.2 seconds; car fades/hides during that stage, question exits at its end, then existing wrong-answer/retry modal follows. This explicitly supersedes the previous immediate 1.3-second crash presentation; answer time, scoring, correct rewards and recovery sequence are unchanged.
- Config.crashSequence contains entry duration/depth, slowed world scale and car-hide delay; config.explosion.seconds controls slowed blast duration. Files: config, race-view, controller, HTML, scoped worker and tracking documents. Config v9, race-view v9, controller v21, scoped shell v32; cache URLs synchronized.
- Validation: syntax checks and 23 unit tests pass. Edge checks absence of blast during entry, forward car displacement, explosion only after entry, smoke/shake, retry and subsequent correct-answer celebration without page errors. Entry/crash screenshots reviewed in artifacts/my-carz-smoke-colors/. Final depth refined to keep the blast within the tunnel mouth. Physical-device pacing and live audio remain pending.

## 28 October 2026 - Supplied My Carz Explosion GIF replaces fire-burst particles

- Authorization: user supplied Downloads/My Carz Explosion.gif and requested replacing the current blast.
- Imported the original GIF unchanged into page-7/explosion/ (matching SHA256), and extracted its eight composited RGBA frames losslessly as PNGs without resizing or recoloring. Playback uses those exact frames at source resolution, rather than the nine CSS fire-burst particles. Frame assets are prepared before landing Next becomes available.
- The original eight-frame GIF runs 1600ms. Its full frame sequence is clocked over the existing 1300ms crash window, preserving car hide, question exit, wrong-answer modal and retry timing. It restarts at frame zero on every crash and pauses with the existing foreground clock. Existing seven black-smoke puffs, camera shake, triple flash, wrong audio and retry remain.
- Config.explosion controls frame paths, playback duration and width (84% of road width). Files: config, reward-view, controller, flow CSS, HTML, scoped worker, generated media manifest and tracking documents; assets in page-7/explosion/. Config v8, reward-view v6, controller v20, flow CSS v27, scoped shell v31; media manifest regenerated and cache URLs synchronized.
- Validation: syntax checks and 23 unit tests pass. Edge confirms one supplied explosion replacing the old burst, seven smoke puffs, changing camera shake, wrong-answer/retry, steering and subsequent golden correct-answer celebration without page errors. Crash screenshot reviewed: artifacts/my-carz-smoke-colors/explosion.png. Original/copy GIF hashes match. Physical-device frame pacing and audible mix remain pending.

## 28 October 2026 - Animated lane lean/settle and rear-tire trails

- Authorization: user requested a more animated lane-change sequence and tire effect on the road while the car sways/changes lanes.
- Added a damped presentation spring driven by existing steering tilt, giving the car a continuous directional lean and natural settle, including quick reversals. The actual 180ms lane interpolation, lane positions, input handling, 200ms commit guard, scoring and reading/travel deadlines remain unchanged. Exhaust rotates with the visible car lean.
- Paired subtle dark tire trails originate at measured rear-wheel positions, curve with the moving car, advance with the same road displacement and fade over 1.05 seconds. Trail storage is capped at 160 segments; trails reset per drive and use the existing canvas/foreground clock. No new media or DOM particles; no stationary/countdown tire spawning.
- Config.laneEffects controls lean multiplier, spring/damping, maximum lean, trail lifetime/cap, tire width and wheel spacing. Files: config, race-view, HTML, scoped worker and tracking documents. Config v7, race-view v8, scoped shell v30; cache URLs synchronized.
- Validation: syntax checks and 23 unit tests pass. Edge at 2x density verified both lean directions, paired trail generation/cap, exact lane landing, lean settling and complete trail cleanup, without page errors. Reviewed turn screenshot. Test/evidence: tests/my-carz-lane-effects.browser.cjs and artifacts/my-carz-lane-effects/. Physical-device frame pacing/touch feel and live audio remain pending.

## 28 October 2026 - Crisp custom golden confetti

- Authorization: user requested replacing the low-quality confetti with our own golden confetti effect.
- Replaced My Carz GIF playback with a device-pixel-ratio-aware canvas celebration: 160 bounded gold/champagne foil pieces and ribbons burst from both lower corners, tumble with bright edges, follow gravity and fade smoothly. No raster scaling or per-frame DOM particles. Original media remains untouched for other games.
- Config.confetti controls the five gold tones, particle count, three-second duration and pixel-ratio cap. Reward-view draws from the existing foreground game clock; pause/background/portrait handling and cleanup match the presentation clock. Existing diamond collection -> full celebration -> dim -> next question sequence and finale/modal layering remain.
- Files: config, controller, reward-view, flow CSS, HTML, scoped worker, tracking documents; browser selector references updated for generated celebration. Config v6, controller v19, reward-view v5, flow CSS v26, scoped shell v29; HTML/worker cache URLs synchronized.
- Validation: syntax checks and 23 unit tests pass. Edge at 2x pixel density confirms 786px backing canvas on a 393px stage, diamond collected before confetti, unchanged question during the full three-second effect, then next-question dim/slide/clear without page errors. Screenshot reviewed: artifacts/my-carz-celebration-order/golden-confetti.png; timing evidence in verification.json. Physical-device frame pacing and live audio remain pending.

## 28 October 2026 - Reference-based flying scratch upgrade screen

- Authorization: user requested page-8-reference.webp composition, no background modal panels, corrected scratch placement/visuals, removal of Reveal car button and an exciting flying-card entrance.
- Page-8-only scratch-modal styling removes card background/border and duplicate visible heading/copy; supplied upgrade artwork sits above the centered scratch card over the softly dimmed/blurred race. Other modal designs remain unchanged; accessible title/copy remain.
- Following the big-diamond exit, the artwork crossfade overlaps a 1150ms scratch-card flight with tilt, overshoot and settle. Scratching is enabled only after landing; focus moves to the card. Scratch entrance duration, 640px backing resolution and existing 60% reveal threshold live in config.scratchCard.
- Scratch artwork is cropped to its visible bounds without the opaque fallback rectangle behind it. Higher-resolution drawing preserves supplied detail. Erasing stays inside the gold frame and reveals the car against a dark radial inset; the 60% measurement covers the scratchable interior. Removed requested Reveal car DOM/button handler/styles. Pointer scratching remains; Space/Enter scratch rows for keyboard access without a replacement visible button. Existing reveal fade, unlocked-car rotation, confetti and continuation remain.
- Files: config, controller, reward-view, flow CSS, HTML, scoped worker, tracking documents; browser regressions updated to scratch instead of clicking the removed button. Config v5, controller v18, reward-view v4, flow CSS v25, scoped shell v28; cache URLs synchronized. No source media changed.
- Validation: syntax checks and 23 unit tests pass. Full five-answer browser regression checks transparent unframed page-8 layout, no Reveal button, responsive artwork/card separation, and real pointer scratching through the existing car reveal. Screenshot evidence: artifacts/my-carz-finale/scratch-*.png. Physical-device touch/frame pacing and live audio remain pending.

## 28 October 2026 - Center-aligned question text

- Authorization: user requested center alignment for the question text, with screenshot examples.
- Centered text horizontally within the existing safe artwork inset. White text, vertical centering, adaptive full-prompt fitting, palette, design spacing and all animation/gameplay timings remain unchanged.
- Files: my-carz-flow.css, my-carz.html, sw.js, tracking documents and responsive text-fit regression. Flow CSS v24, scoped shell v27; HTML/worker URLs synchronized.
- Validation: Edge verified center alignment, white text and full-prompt fitting for all ten questions across four viewport sizes (40 checks), without page errors; narrow-phone screenshot reviewed. Evidence: artifacts/my-carz-text-fit/. Physical-device checks remain pending.

## 28 October 2026 - Full-stage countdown dimming and safe white question text

- Authorization: user requested dimming across the whole countdown page instead of only its center, long prompts kept clear of the question artwork, and white text for every question.
- Replaced the center-weighted countdown gradient with uniform 79% black over the full game stage. Countdown digits, pulse/fade, audio and duration remain unchanged.
- Positioned question text inside the clear artwork inset (22% left, 8% right, 20% top, 30% bottom), away from the flask icon and checkered trim. Fit the complete prompt on each question and panel resize by reducing font size only when its measured content overflows; no truncation or question changes. White text with a subtle dark readability shadow applies across all five configured colors, including light-blue. Existing panel art, tint/glow, slides, attention and timers remain.
- Files: attention, config, flow CSS, HTML, scoped worker, tracking documents and tests/my-carz-text-fit.browser.cjs. Config v4, attention v12, flow CSS v23, scoped shell v26; cache URLs synchronized.
- Validation: syntax checks and 23 unit tests pass. Edge checked uniform full-stage scrim bounds/background and all ten full prompts at 320x568, 393x852, 768x1024 and 1280x900 (40 fitting/white-text checks), without page errors. Reviewed countdown and narrow-phone screenshots; evidence in artifacts/my-carz-text-fit/. Physical-device frame pacing/audio remain unverified.

## 28 October 2026 - Diamond launch exit and configured five-color palette

- Authorization: user requested an exciting exit for the merged diamond before changing scenes, supplied five exact question colors, and requested configuration in the config file.
- After the existing merge and full confetti celebration, the large diamond charges/recoils, brightens, spins and accelerates upward beyond the stage over 950ms. The upgrade reveal starts only after exit completes; the existing 650ms scrim/card crossfade follows. Existing collection, gather, merge, confetti, save/unlock and scratch functionality remain.
- Added questionPanels to my-carz-config.js in requested order: pink #d7005d, violet #6800c4, blue #0116ff, orange #df6400, light-blue #00bfe4. Tint/glow both use the requested values; first four use white text and light-blue uses dark text. These explicit colors supersede the earlier light-only palette. Original supplied artwork and cycling/attention timing remain.
- Added diamondFinale configuration for center, hero size, orbit radius, spark count/radius/stagger, dim/gather/merge/transition durations and launch duration/lift/rotation/peak scale. The reward module reads these settings; CSS launch glow duration follows configured exit time.
- Files: config, attention, reward-view, flow CSS, HTML, scoped worker, tracking documents and focused finale browser regression. Config v3, attention v11, reward-view v3, flow CSS v22, scoped shell v25; controller remains v17. Cache URLs synchronized.
- Validation: syntax checks and 23 unit tests pass. Focused browser regression checks all five exact color values and verifies the upgrade remains hidden while the diamond exit is moving, followed by functional scratch/reveal. Evidence: tests/my-carz-finale.browser.cjs and artifacts/my-carz-finale/. Physical-device frame pacing and audible synchronization remain pending.

## 28 October 2026 - Five-diamond merge finale and smoother first car entry

- Authorization: user requested all five collected HUD diamonds converge at center into one large diamond with continuous celebration through the upgrade transition, and correction of the first car's snapping entrance.
- After the fifth collection/pulse and successful completed-level save, five artwork clones lift from measured HUD positions, follow staggered curved paths over 1.10-1.36 seconds, and merge into a large central diamond over 550ms. Original HUD gems are hidden during the transfer and restored during cleanup. A softly dimmed stage, rotating rays, 28 lightweight transform/opacity sparkles and gently floating diamond continue through the unchanged full three-second confetti. A 650ms overlapping finale fade/upgrade-card entrance carries motion into the existing scratch reveal. Free-play five-answer completion uses the same finale and its existing continuation modal. Retry/save handling and unlock rules remain.
- First entrance was 400ms with strongly front-loaded easing. It now slides over 700ms with gentler easing (upgraded entry 800ms), with attention's wait synchronized. The existing 1.5-second car focus hold, HUD/question order, reading/travel deadlines, per-question driving return, audio triggers, individual diamond award and celebration remain unchanged.
- Files: my-carz-reward-view.js, my-carz-attention.js, my-carz.js, my-carz-flow.css, my-carz.html, sw.js and tracking documents. Flow CSS v21, attention v10, reward-view v2, controller v17, scoped shell v24; HTML/worker URLs synchronized. No source media changed.
- Validation: syntax checks and 23 unit tests pass. Edge mobile-viewport regression completed five correct answers, sampled progressive 700ms first-entry motion, confirmed five gathering clones and visible merged hero, completed upgrade scratch/reveal and reported no page errors. Screenshots reviewed in artifacts/my-carz-finale/; evidence verification.json and tests/my-carz-finale.browser.cjs. Animation relies on bounded transform/opacity elements with no per-frame DOM construction. All-device smoothness cannot be established from desktop Edge emulation; physical-phone frame pacing, low-end hardware, rotation mid-finale and live audio remain pending.

## 28 October 2026 - Landing loader, ready-only Next and larger earned diamond

- Authorization: user requested a styled loading panel/bar, Next appearing only after all assets load, removal of Back to games from the landing page, and a slightly larger earned diamond before collection.
- Styled the real byte-progress panel with dark blue framing, cyan/gold progress, readable file/size status and Retry. Next starts hidden and disabled; it appears only after complete media downloading/caching, image preparation and garage rendering. Errors retain the loader/Retry. A final preparation status explains the 99% stage. Removed only the opening Back to games link and its styles.
- Increased the correct-answer diamond width from 24% to 30% (25% larger). Existing pop, halo, badge, dimming, 350ms emphasis, 750ms target-measured flight, HUD landing and subsequent confetti/question sequence remain unchanged.
- Files: my-carz.html, my-carz.js, my-carz-flow.css, sw.js and tracking documents; focused browser check: tests/my-carz-loading.browser.cjs. Flow CSS v20, controller v16, scoped shell v23; HTML/worker versions synchronized. No media changes.
- Validation: syntax checks and 23 unit tests pass. Edge delayed-image-preparation check confirms hidden Next until ready, absent opening Back link, larger diamond and successful collection without page errors. Reviewed loading and reward screenshots in artifacts/my-carz-loading/. Physical-device/slow-network field testing and audible mix remain unverified.

## 28 October 2026 - Matching neon color across question-panel surface

- Authorization: user explicitly confirmed that each light-colored question panel should have matching neon light across its surface as well as its existing outline.
- Added two soft matching-color radial washes to the existing artwork-masked tint layer. The center remains light and text stays dark; existing silhouette glow, color rotation, slides, attention dimming, sequencing, timing and all gameplay/effects remain unchanged. No media replacement.
- Files: my-carz-flow.css, my-carz.html, sw.js and tracking documents. Flow CSS v19, scoped shell v22; HTML/worker cache URLs synchronized.
- Validation: syntax checks and 23 My Carz tests pass. Edge palette/sequence regression and screenshot review verify the light panel surface with matching neon color; physical-device appearance and audio remain unverified.

## 28 October 2026 - Prepared car-page to race transition

- Authorization: user supplied the screen recording and requested a smooth car-page to game handoff without the white/blank road flash.
- Cause: the hidden race canvas could be resized to one pixel, then revealed before its proper sizing/paint and car calibration. CSS background decoding could also finish after reveal.
- Prepare and decode both current scenery images, diamond HUD and question artwork while the car page remains visible. Size and paint the road and calibrate the selected car invisibly before the existing screen transition. Failed preparation keeps the home screen available for retry.
- Race canvas uses stable layout dimensions, ignores hidden zero-size measurements and avoids redundant buffer resets; an opaque asphalt fallback covers resize clearing. World scrolling runs during the incoming race transition. Existing transition durations, full countdown, car/HUD/question sequencing, gameplay timing, effects and audio are preserved.
- Files: my-carz.js, my-carz-race-view.js, my-carz-flow.css, my-carz.html, sw.js and the focused browser regression. Controller v15, race-view v7, flow CSS v18, scoped shell v21; HTML/worker URLs synchronized.
- Validation: check:my-carz and 23 unit tests pass. Edge delayed-decode regression kept home visible until artwork readiness, sampled 479 correctly sized opaque road frames, completed countdown/intro and Save & Exit without page errors. Reviewed countdown screenshot. Evidence: artifacts/my-carz-race-transition/verification.json; tests/my-carz-race-transition.browser.cjs. Physical-device frame pacing and audible synchronization remain unverified. No Git publication requested.


## 28 October 2026 - Light-only question fills and neon outline

- Authorization: user requested light question-panel colors only, with a neon outline following the background image.
- Changed all six named tones to light blue/green/orange/purple/red/yellow fills, with dark readable text for every tone. Added matching neon drop-shadow outlines to the supplied frame's alpha silhouette, not a rectangular border. Source artwork remains unchanged.
- Existing color cycling, slide/sweep/dimming, timing, scoring, smoke, controls and celebration behavior are preserved. Attention v9, flow CSS v17, scoped shell v20; HTML/worker URLs synchronized.
- Validation: 23 My Carz tests and attention syntax pass. Focused browser palette/crash/input regression and visual review are recorded with artifacts/my-carz-smoke-colors/. Physical-device/audio checks remain pending.

## 28 October 2026 - Black smoke/camera shake, standard tones and bottom UI removal

- Authorization: user requested black-smoke explosion/camera shake like Rocketier, standard question colors and removal of bottom arrow/SWIPE TO STEER content; asked why current confetti is pixelated.
- Added seven localized dark smoke puffs with soft irregular edges and upward expansion, preserving nine original fire-burst particles. Improved the camera shake to a dense decaying 900ms pattern; retained original three-pulse flash, crash modal/answer, 1300ms handoff, retry and audio. Smoke finishes before that handoff. Rocketier files were read for presentation reference, not edited.
- Replaced neon hue rotations with explicit blue/green/orange/purple/red/yellow palette and suitable light/dark text. Masked tint uses the unchanged supplied white frame. Existing panel animations and dimming remain.
- Removed only requested bottom arrow buttons/text plus their DOM updates, handlers and styles. Keyboard/swipe/lane-tap input and lane guard/scoring remain. No gameplay time, question bank, checkpoint, daily reset, reward or car behavior changes.
- Inspected confetti metadata: original 500x500, 75-frame, 256-color indexed GIF. Pixelated/dithered fragment edges are source quality and can be amplified by scaling. Kept the asset and sequential three-second playback; no replacement animation approved in this request.
- Versions: flow CSS v16, attention v8, controller v14, scoped shell v19; cache URLs synchronized. Media/core/config/store/race-view/reward unchanged.
- Validation: 23 My Carz tests and syntax checks pass; Edge passed smoke/burst counts, visibly changing shake transforms, crash answer/retry, removed UI, readable standard colors, retained keyboard and lane-tap control and correct award/confetti/next-question flow, without page errors. Reviewed crash and palette screenshots. Evidence: artifacts/my-carz-smoke-colors/verification.json; test: tests/my-carz-smoke-colors.browser.cjs. Physical-phone and audible-mix checks remain pending.
- No Git publication requested or performed.

## 28 October 2026 - Keep level-one speed for every car

- Authorization: user requested no speed increase after upgrades, retaining level-one difficulty throughout.
- Set speedStep to 0 in the separate config. All nine levels/free play now retain the same 3.8-second spawn-to-contact window and separate two-second reading period, regardless of selected car. This supersedes historical 6% per-level acceleration below.
- No animation, visual-speed multiplier, world/tunnel synchronization, scoring, upgrade, celebration, input, save or reset logic changed. Config v2, scoped shell v18; HTML/worker URLs synchronized.
- Updated progression regression to verify the unchanged window through all eight upgrades, older-car selection and free play. Syntax/unit checks recorded for this change; browser animation QA was not repeated for this config-only adjustment.

## 28 October 2026 - Finish collection/confetti before the next question

- Authorization: user explicitly requested diamond animation/collection -> confetti celebration -> slight dimming -> next question slides in -> dimming clears. This supersedes the earlier overlapping celebration and 1300ms next-question handoff.
- Existing large-diamond animation/flight and HUD collection pulse complete first. The original award component remains 1300ms; an additional 300ms finishes the HUD's existing 500ms landing pulse. The full unchanged three-second foreground confetti then plays and is removed before advancing.
- For ordinary correct answers, dimming settles for 220ms before the existing 380ms next-question slide. It clears after the slide. Full reading and travel intervals, scoring, panel colors, introductory pacing and all other effects remain.
- Completed levels still commit/save after collection, before their added celebration wait. Upgrade/scratch presentation waits for the celebration to finish. A pending midnight reset remains deferred through reward handling. The separate car-reveal celebration is retained.
- Confetti now returns a completion promise rather than starting a detached timer; media failure resolves cleanly rather than trapping the flow. No celebration was shortened or removed.
- Controller v13, attention v7, flow CSS v15, scoped shell v17; HTML/worker URLs synchronized. Post-celebration question dimming is a milder 35% shade; original first-introduction emphasis remains unchanged. Other runtime module/media versions unchanged.
- Validation: 23 My Carz tests and syntax checks pass. Focused Edge checks confirm no award/confetti overlap, completed HUD collection, unchanged question during the full three-second confetti, then dim/slide/clear without page errors. Evidence: artifacts/my-carz-celebration-order/verification.json; test: tests/my-carz-celebration-order.browser.cjs. Full upgrade-flow recheck is recorded on completion. Physical-device/audio validation remains pending.

## 28 October 2026 - Shortened HUD/question presentation holds

- Authorization: user requested shortening the diamond-panel -> question-panel sequence.
- Reduced only the extra opening holds: HUD 1.2s -> 0.35s; question 1.8s -> 0.5s. Existing 450ms HUD and 380ms question entrances, dimming, car hold, colors, effects and sequence remain. This removes 2.15 seconds from startup.
- Full two-second reading and all travel/scoring/reward times are unchanged. Attention v6, scoped shell v16; HTML/worker URLs synchronized. Updated pacing test expectations.
- Validation: 23 My Carz tests and attention-module syntax pass. Focused Edge timing measurement checks the faster HUD/question stages and preserved reading interval; report: artifacts/my-carz-shorter-intro/verification.json. Physical-device smoothness remains unverified.

## 28 October 2026 - Diamond HUD before question and colored white-panel artwork

- Authorization: user requested reversing the HUD/question opening order, using the supplied question-panel-white.webp in different colors for each question, and replacing the thick white lane dashes/double yellow center marking with a single white center line.
- New opening sequence: countdown, car, diamond HUD, question, reading/driving. Kept entrances, dimmed attention, all hold durations and total startup time. HUD stays visible while question enters; question remains unrevealed during HUD entry. Safety cancellation and normal later-question entrances remain.
- Replaced the old illustrated question background with the supplied white WebP, tinted through six distinct cycling tones independent of answers. Consecutive questions have different tones, dark readable text, and the existing right-to-left transition/sweep effects. No source artwork edited/deleted.
- Removed only the requested four thick dashed lane guides and double yellow center paint. Road uses one thin white center line; texture/streak/scenery motion, painted roadside curbs, tunnels and steering/scoring geometry remain unchanged.
- Versions: flow CSS v14, controller v12, attention v5, race-view v6, scoped shell v15. HTML/worker synchronized; core/config/store/reward/media unchanged.
- Validation: 23 My Carz tests and syntax pass. Edge confirmed HUD-first order with dimming, distinct cyan/pink/gold question frames, correct supplied image, three correct answers and HUD increments, no page errors. Visually reviewed new frames and road. Evidence: artifacts/my-carz-panel-colors/verification.json and screenshots. Existing sequence/dimming/pacing browser expectations updated for the new order. Physical-device smoothness and live audio remain unverified.
- No Git publication requested or performed.

## 28 October 2026 - Exhaust follows visible car entry

- Authorization: user reported exhaust appearing before the car entered the screen.
- Cause: the higher-car exhaust was drawn unconditionally at a fixed road position, independent of the car's hidden state and animated entrance.
- The renderer now measures the car artwork's opaque rear, attaches exhaust to the animated car box/steering pose, and shares its actual visibility and opacity. Offscreen exhaust stays outside the canvas until the car's rear enters; countdown/hidden-car stages no longer show floating flames. The existing flame shape, color, pulse and eligible cars are retained.
- No gameplay, timing, scrolling, entry animation or audio behavior changed. Race-view v5 and scoped shell v14; HTML/worker URLs synchronized. Core/config/store/controller/media unchanged.
- Validation: 23 My Carz tests and race-view syntax pass. Focused Edge checks/report: artifacts/my-carz-exhaust/; test: tests/my-carz-exhaust.browser.cjs. Physical-device smoothness remains unverified.

## 28 October 2026 - Focused question/HUD dimming and countdown-only labels

- Authorization: user requested dimming the background when the question/diamond panels arrive and explicitly removing the level/instruction text below the countdown, leaving only 3/2/1/GO.
- Added a pointer-transparent dim layer and attention-state styling. The incoming question or diamond HUD stays bright; surrounding race content dims. Existing moving road, entrances, hold durations, reading/travel times, controls and safety behavior remain. Normal later question entrances also receive the dimmed focus; it clears before reading. Exit cancellation clears the attention state.
- Removed only the requested countdown helper text, plus its controller write and unused styles. The number pulse, 3/2/1/GO sequence, sound and Good Bad Ugly appearance are retained.
- Versions: flow CSS v13, controller v11, attention v4, scoped shell v13; synchronized HTML/worker. Core/config/store/race-view/reward/media unchanged.
- Validation: 23 My Carz tests and syntax checks pass. Headless Edge verified no countdown helper text, active question/HUD brightness over dim scenery, ongoing world movement, normal reading brightness, next-question dimming, correct answer and Save & Exit; no page errors. Reviewed countdown/question/HUD screenshots. Test: tests/my-carz-intro-dimming.browser.cjs; evidence: artifacts/my-carz-intro-dimming/verification.json. Whitespace check passes.
- Physical-device smoothness and live audio remain unverified. No Git push requested or performed.

## 28 October 2026 - Moving car entry, shared road/gate speed and slower introduction

- Authorization: user requested moving roads during car entry, Good Bad Ugly countdown appearance instead of the ring design, matched tunnel/road speed, multi-second gaps between opening steps and investigation/fix of stretched later-level backgrounds.
- Added intro to the foreground moving-world stages. The fast car slide and its glow are retained; road/scenery continues while the car enters and settles, with safety-pause behavior unchanged.
- Countdown now reuses the original Good Bad Ugly cue's italic white/red-shadow typography, dark gradient, level line, 350ms entrance and 600ms pulse. The explicitly superseded rings/borders/lights are replaced. 3/2/1/GO and the four-second audio/countdown timing remain.
- Added presentation holds in CarzAttention.pacing: car 1.5s, question 1.8s, HUD 1.2s. This changes the opening staging duration as requested, not the two-second reading interval or level-scaled travel. All elements/effects/controls are retained.
- Synchronized road and gate movement in one fast world coordinate. Gates start farther away so they retain the existing deadline and measured nose crossing while moving at the same rendered speed as road markings. Removed the duplicate road-only speed scale. Late guidance uses physical proximity; the neutral gate cue remains ahead of arrow guidance, including at the fastest level.
- Diagnosed level-3+ distortion: those sources are narrow strips, not wide canvases like level 2. Corrected widths per theme/side and set background height to auto. Level 2 crops only its transparent canvas using measured 167px/172px content widths; levels 1 and 3-6 fit their strip width without horizontal or vertical distortion. No bitmap was edited/replaced.
- Files: controller, attention/race-view modules, flow CSS, HTML/scoped worker, details/progress and regression/browser tests. Versions: flow CSS v12, controller v10, attention v3, race-view v4, scoped shell v12. Reward/core/config/store/media manifest unchanged.
- Validation: 23 current My Carz tests pass, including two new checks for unchanged crossing deadline and spatially late guidance; syntax checks pass. Level 2-6 browser checks and screenshot review are recorded after completion in artifacts/my-carz-motion-fix/.
- Physical-phone frame pacing and live audio verification remain pending. No Git push requested or performed.

## 28 October 2026 - Requested race controls, speed and reward refinements

- Authorization: user identified that the flow/reference has no separate pause option and requested 3/2/1/GO, faster sliding car entry, faster visual parallax without timing changes, question-frame right entrance/left exit, and a large diamond/ray effect plus green Correct! +1 Diamond popup matching Page 6 and the supplied image.
- Removed the visible pause button, its handler and dedicated styles. Exit confirmation and all automatic background/portrait/stall safety behavior remain. Escape now opens Exit. Related browser tests use Exit to freeze/resume instead of depending on the removed icon.
- Four countdown beats now read 3, 2, 1, GO!; dimming, pulse, ring, progressive lights and sound remain. Regular car entry slides up in 400ms, upgraded entry in 550ms with its glow. Retry/crash return is unchanged.
- Accelerated only rendered road/scenery/texture motion by 1.75x. Gate position and scoring geometry stay unscaled, with identical reading/travel/steering timings. No speed multiplier was added to rules or question time.
- Question frames slide in from right for 380ms and exit left for 260ms on correct and wrong answers. Existing text attention and sweep remain. Exits fit inside the prior 1300ms feedback window, so they do not extend answer timing or reduce reading time.
- Added my-carz-reward-view.js: large diamond/rays and mild dimming for 350ms, existing 750ms HUD flight, count update on landing and 200ms settle. The reference-style green popup shows a check, streak count, Correct! and +1 Diamond. Presentation mirrors for either selected lane. Existing GIF celebration, audio and all rewards remain; no media was edited/replaced.
- Versions: flow CSS v11, controller v9, attention v2, race view v3, reward view v1, scoped shell v11; core/config/store/media manifest unchanged. HTML and worker caches include the new module; syntax checks include it.
- Validation: 21 current My Carz tests and syntax checks pass. Headless Edge passed 3/2/1/GO, absence of pause icon, measurable slide-in, measured 1.75x visual-vs-gate distance ratio, five popup/HUD awards, upgrade, wrong-answer recovery, Exit, saved level 2 and offline reward-module loading, without page errors. Test: tests/my-carz-award.browser.cjs. Reports/screenshots: artifacts/my-carz-award/.
- Responsive popup/question checks are recorded after completion. Physical-device frame pacing and audible mix remain unverified. No Git publication was requested.

## 28 October 2026 - Page 5 sequenced element attention

- Authorization: user explicitly requested Page 5 as ordered countdown, car, question, diamond bar, dynamic tunnels/steering and late green/red guidance, with attention on each new step and minimal distraction. This specifically moves the existing upgraded-car entry after the countdown; its movement/duration are preserved.
- Added my-carz-attention.js to keep presentation stages separate from game rules. Upcoming elements remain unrevealed during earlier steps. After the four-second READY/3/2/1, normal car gets a 550ms localized fade/light settle; upgrades use the original 1100ms entry. Question retains its 380ms entrance and gains a frame-contained 650ms sweep; 320ms settling separates that cue from the 450ms diamond HUD entrance. Full two-second reading then begins, with a 350ms control entrance that adds no input/timer delay.
- Later questions retain normal continuous driving and their full reading/travel window rather than replaying startup. Every tunnel approach receives one neutral 480ms cue at 40% travel. That cue ends before existing final-35% green/red guidance; chevrons retain their motion/fade and gain local glow. Attention never identifies a correct answer.
- Pause/visibility uses the existing foreground clock; intro is pausable, with pending stages cancelled on Save & Exit. Existing countdown, reward/diamond effects, confetti, crash/retry effects, audio and all controls remain. Core/config/store/race geometry and supplied media were not edited in this step.
- Startup now includes deliberate presentation-only reveal time before reading; the existing reading time, level-scaled travel duration, steering guard, scoring, question scheduling, checkpoints and daily reset rules are unchanged.
- Versions: flow CSS v10, controller v8, attention v1, dedicated shell v10; race-view v2/media manifest unchanged. Worker/HTML include the new module; npm run check:my-carz includes its syntax check.
- Validation: 21 current My Carz tests and syntax checks pass. Edge confirmed stage order countdown/car/question/diamonds/drive, paused car introduction, full reading interval, tunnel cue before late guidance, five answers, scratch/reveal, preserved upgrade entrance after countdown, level 2 and Save & Exit with no page errors. Reviewed question/tunnel/entry screenshots. Test: tests/my-carz-page5-sequence.browser.cjs; evidence: artifacts/my-carz-page5-sequence/.
- Browser viewport/offline checks are recorded with their report. Physical-phone performance and audible synchronization remain unverified. No animation/function was removed and no Git push was requested.

## 28 October 2026 - Countdown attention and complete confetti framing

- Authorization: user explicitly requested dimming behind 3-2-1 and polishing the race entrance/confetti while retaining every animation and function. This work is limited to that presentation scope; earlier in-progress race/home/logic changes were preserved.
- Prepare the normal countdown before the race entrance. Added a centered dimmed focus layer with animated perimeter and three progressive lights; transferred the existing 750ms scale/opacity pulse from the overlay to its displayed number. Retained all four READY/3/2/1 one-second beats and sound timing. New-car entry still precedes its countdown. The backdrop fades in the final 220ms of the last beat, without extending/shortening the countdown or question reading time.
- Kept the original GIF, its colors/particles, award triggers and three-second foreground lifetime. Switched cover cropping to bottom-aligned contain so the complete square confetti and both side bursts remain visible. Added a reward-specific layer so its celebration is visible above the reward panel. No asset, animation, audio or functionality was deleted/replaced.
- Files: my-carz.html, my-carz.js, my-carz-flow.css, scoped sw.js, details/progress and a focused browser QA script. Versions: flow CSS v9, controller v7, scoped shell v9. Race-view/core/config/store and production media were not changed in this step.
- Validation: 21 current My Carz tests and syntax checks pass; git diff --check passes. Headless Edge verifies dim READY/3/2/1, centered focus, first-question sequencing, correct-answer celebration, pause freeze and Save & Exit. Bounds at 320x568, 375x667, 393x852, 768x1024 and 1440x900 pass with no page errors. Reviewed 3, READY, compact-phone and confetti screenshots. Report/screenshots: artifacts/my-carz-countdown/verification.json. Browser test: node tests/my-carz-countdown.browser.cjs with CARZ_PLAYWRIGHT configured.
- Limits: headless checks do not establish physical-phone smoothness or live audio mixing. No Git publication requested or performed.

## Current status - 27 October 2026

Approved two-lane flow is implemented with modular rules/config/storage, nine temporary cars, checkpoint saves, daily resets and dedicated offline loading. Production car frames, names and How to Play GIFs remain pending. See current details for authoritative behavior; earlier duplication entries are historical.

## 27 October 2026 - Recording review and authorized race polish

- Approval: after the recording review identified motion/scoring, crash presentation, retry, control sizing and timing defects, the user explicitly requested: "proceed and fix them sincerely without messing up any other logics. i want a polished game". This entry supersedes the earlier car-advance/fade/return presentation contract only within those fixes.
- Stable driving camera: the road and tunnels share one travel distance; the gate enters from offscreen and its beam meets the rendered car's opaque nose at answer commitment. Correct feedback continues the drive with no car fade, teleport or respawn. Car artwork is measured after decoding, including its transparent margins.
- Steering takes 180ms, with the final 200ms reserved for completing an accepted movement. Scoring commits the visible lane; late keys, swipes and taps cannot select a different answer through the gate. The existing two-second reading and level-scaled travel durations remain unchanged.
- New questions enter over 380ms before the full reading interval starts. Retry exits the crash panel over 260ms, then brings the car back from below over 1100ms. Upgrade entry remains 1100ms; countdown starts only after assets/entry are ready.
- Correct diamond flight starts at the actual car; the 750ms flight and 550ms feedback hold remain. Previously earned diamonds no longer replay their award animation. Good/Bad chevrons keep their colors and late-approach timing, follow the visible car, and identify the selected lane rather than implying correctness.
- Crash uses a localized nine-part burst, retaining the 900ms three-pulse impact and 1300ms crash-panel sequence. A separate SVG display mask removes the supplied panel's baked checkerboard without modifying the bitmap. Correct-answer text sits inside its red panel, with the supplied Keep Driving button beneath; the redundant blue card/title are removed only for crashes.
- Race controls have at least 44px touch targets, selected-lane styling, readable guidance, brighter empty diamonds and a refined cyan question frame. Small-screen HUD spacing avoids overlap. Home/collection compositions are preserved.
- Waits, explicit transitions and CSS effects advance from foreground frame time. Pause freezes car, road, gates and chevrons; modal entrance still runs while paused. Resuming restores interrupted audio at its existing playback position. Foreground stalls over 250ms open Pause during controllable race stages. Confetti remains the approved GIF and retains its native playback clock.
- Core/config/store SHA-256 hashes match the pre-fix baseline: question bank, randomization, speed formula, upgrades, scoring rewards, checkpoints, daily reset and persistence were not edited. Original Good Bad Ugly and Rocketier logic are untouched.
- Runtime versions: flow CSS v8, race presentation v2, controller v6, dedicated shell v8; generated manifest has 87 production media files (~16.1 MiB). Added a dependency-free Edge/CDP browser test, `npm run test:my-carz:polish` (server must be running; optional CARZ_BROWSER/CARZ_URL).
- Validation: 27 focused tests and My Carz syntax checks pass. Headless Edge passed visible-crossing/late-steering checks, frozen car and CSS chevrons during pause, continuous correct passage, staged retry, five-answer upgrade, scratch reveal, new-car entry, Save & Exit and offline reload at level 2, with no page/HTTP errors. Bounds pass at 320x568, 375x667, 393x852, 768x1024 and 1440x900. Crash, race and success screenshots were visually inspected. Final browser report, per-frame motion samples and screenshots are stored in `artifacts/my-carz-polish/`.
- Limits: headless browser sampling/screenshots do not establish physical-phone frame pacing or audible sound-mix quality. Supplied final car names/art, rotation frames and help GIFs remain outstanding; no replacement production assets were invented.

## 27 October 2026 - Race reference layout and late tunnel guidance

- Authorization: user requested replicating page-5-a-reference.webp and page-5-b-reference.webp for the race, explicitly limiting red/green guidance to when the car is about to enter a tunnel, with one smooth animated sequence and modular code.
- Matched reference road/scenery proportions, double-yellow center markings and paired lane guide dashes, gate/car positions and proportions, supplied exit/diamond artwork and a lightweight cyan illustrated question-frame SVG. Supplied images and reference files remain untouched. First-level grass/sidewalk art uses the supplied 1-a strips; later themes retain their existing scenery, with full-road images cropped to their roadside edges rather than compressed into narrow strips. Pause, keyboard/swipe/tap/button steering and readable dynamic questions remain available. Level/timer metadata are visually hidden to follow the reference composition.
- New my-carz-race-view.js owns normalized approach geometry, continuous road/scenery rendering and presentation timing. The controller/core still own rules, answer submission, saves, screen sequencing and audio. The car advances beneath stationary overhead gates over the unchanged travel duration; gates enter over 380ms after the full two-second reading stage. Four glowing chevrons follow the selected lane (green Good/red Bad), fading in over 180ms only for the final 35% of approach and hiding at feedback. This visibility change is explicitly authorized by the user's request.
- Correct passage continues under the gate during the existing 750ms diamond-flight stage, then returns the car visibly for the next question during the existing 550ms feedback hold. No added delay or shortened reading/travel window. The car's hidden reset point avoids a visible position jump. Localized crash remains aligned with the car at the gate; the 900ms three-pulse impact, wrong-answer sequence, sound cues, confetti, guarded screen transitions and 1100ms upgrade entry retain their timings/intensity. Updated upgrade-entry endpoint to the reference's car position. Browser pause verification caught a one-frame pose lag; rendering now follows the current frame's simulation update so pause holds the exact displayed pose.
- Versions: flow CSS v7; presentation JS v5; race-view module v1; dedicated shell v7. Worker/HTML URLs synchronized. Added the module to offline shell and syntax checks. Rebuilt the manifest for 86 production files (~16.1 MiB), including the new question SVG; reference/old artwork remains excluded.
- Tests: all 24 My Carz tests pass (21 existing and three presentation checks for late guidance, continuous approach/crossing, passage/return continuity and unchanged 1.3-second feedback total). Syntax and whitespace checks pass.
- Browser validation: isolated headless Edge checked countdown/reading/early-travel guidance suppression, late green/red glow, lane changes, exact pause freeze/resume, feedback guidance removal, diamond feedback/return and five-answer upgrade/scratch/reveal/new-car entry through level-2 reading. Bounds checked at 320x568, 375x667, 393x852, 768x1024 and 1440x900 without horizontal overflow or clipped HUD/steering controls. Reviewed reading, early approach, green/red entry and upgrade screenshots against the supplied references. Evidence: artifacts/my-carz-race-layout/.
- Limits: browser emulation and screenshots do not prove physical-phone frame pacing or live audio mixing/synchronization. Those checks remain pending; no Rocketier or original Good Bad Ugly runtime/media was changed.

## 27 October 2026 - Home matches page-3-b reference

### Reference button size correction

- User explicitly requested larger buttons matching the reference. Removed height-constrained image fitting from the home Start Driving and How to Play/My Cars buttons; images now use their full allocated widths at their original aspect ratios, centered within the existing button positions. This accounts for transparent image margins without editing the assets.
- Only home button rendering changed. Other content, positions, returning-button gating, click/hover animations, screen timings and audio are unchanged. Flow CSS v6; dedicated shell v6; presentation JS remains v4.
- Validation: headless Edge rendered five phone/tablet/desktop viewports without horizontal overflow; reviewed the 375x667 screenshot to confirm enlarged labels and button artwork without clipping. Arrow/paint interaction checks still pass. Worker syntax and whitespace checks pass. Refreshed artifacts/my-carz-home-layout/. Physical-device/audio checks remain pending.

### Exact-reference content correction

- User explicitly requested no extra home-page content, naming Back to games. Removed the home navigation link and its scoped CSS. The opening-page link remains outside this request. Home title/level/paint legend/status were already visually hidden; the visible composition now contains only the reference's car/name/panels/paint/action areas.
- No layout coordinates, selection behavior, animations, sequencing or audio changed. Flow CSS v5; dedicated shell v5; presentation JS remains v4.
- Validation: syntax and whitespace checks pass. Refreshed five viewport screenshots and browser arrow/paint checks; no home navigation link is present. Physical-device verification remains pending.

- Authorization: user specifically requested replicating page-3/page-3-b-reference.webp for the home layout. This authorizes the visible composition changes on home only.
- Positioned the selected car over the supplied garage platform; added the dark car-name bar with red previous/next unlocked-car controls; restyled the horizontal nine-car list as larger Current car/Next car panels with progression chevrons and the supplied green car-panel artwork. Selected car appears first, with the remaining cars retained in the scrollable list. Smooth carousel scrolling remains enabled.
- Matched the reference's paint row, Start Driving and paired How to Play/My Cars positions. Existing title, level progress, paint legend and card status remain available to assistive technology while visually hidden on home. Back to games remains visible. Temporary Car-1 through Car-9 names, all eleven paint colors and the returning-only button rule are preserved.
- Home styles are scoped to #home; collection and gameplay layout are unchanged. Existing 550ms car entrance, screen exit/entry timings, other keyframes, gameplay progression, storage and audio synchronization remain unchanged. Name-bar selection uses the existing selection/save/render path, rejects locked cars and guards repeated arrow presses.
- Files: my-carz.html, my-carz-flow.css, my-carz.js, scoped sw.js and tracking documents. Flow CSS v4, presentation JS v4, dedicated shell v4. Existing panel artwork was already in the media manifest; no media edits or new production assets.
- Validation: syntax checks and all 21 My Carz tests pass; diff whitespace checks pass. Direct headless Edge with an isolated QA profile and software-compatible flags successfully rendered 320x568, 375x667, 393x852, 768x1024 and 1440x900, with no horizontal page overflow. Reviewed the 375x667 and 393x852 screenshots against the supplied reference. Browser interactions passed previous/next unlocked-car selection, disabled final next arrow, paint selection and retention of all nine car slots. Evidence: artifacts/my-carz-home-layout/.
- Limits: browser emulation does not establish physical phone performance, live audio synchronization or full gameplay animation smoothness. Those checks remain pending; earlier failed Edge initialization was overcome for this home-page QA only.

## 27 October 2026 - Approved portrait responsive layouts

### Opening fill follow-up

- User explicitly requested the opening image fill the screen like Rocketier's front page. Matched Rocketier's `center top / 100% 100%` background sizing: the whole image fills the portrait stage, stretching to its aspect ratio, without the previously added blurred background extension.
- Removed fitted-artwork phone button overrides; Next uses the existing stage-relative 19% left, 79.3% top and 65% width. Button image proportions remain intact. Other screens, portrait guidance, animation durations/sequences and audio are unchanged.
- Files: flow CSS, HTML, scoped worker and tracking documents. Flow CSS v3; dedicated shell v3.
- Validation: syntax checks and all 21 My Carz tests pass. Browser screenshots and physical-device visual verification remain pending under the tooling limits recorded below.

- Authorization: user approved responsive layout changes alone, then explicitly confirmed the game remains completely portrait and instructed proceeding.
- Portrait phones up to 600 CSS pixels wide use the full dynamic viewport height. Tablets and PCs keep the centered proportional portrait stage. Existing landscape touch-device rotation guidance remains unchanged.
- Opening artwork remains fully visible and proportional; a softened copy fills spare background space. Next scales and positions relative to the fitted artwork, including wider portrait viewports. Garage content can scroll when needed; safe-area padding protects controls. Modal/reward art sizes use the game container height rather than the outer desktop viewport, and the scratch surface fits the available stage.
- Affected files: my-carz-flow.css, my-carz.html, scoped sw.js and tracking documents. Flow CSS v2; dedicated shell v2. Existing generated media manifest changes in the working tree were left untouched.
- No gameplay logic, animation keyframes, durations, sequencing, input gating or audio synchronization changed.
- Validation: npm run check:my-carz and all 21 My Carz tests pass. Playwright is not installed on this PC. A direct headless Edge screenshot attempt failed because its GPU process could not initialize in the sandbox; no successful visual or physical-device verification is claimed. Phone/tablet/desktop animation and live audio verification remain pending.


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

Page 5 layout/offline verification: revealed question, diamond HUD, car and steering bounds pass at 320x568, 375x667, 768x1024 and 1440x900; the full sequence was checked at 393x852. The attention module also loads from the scoped worker offline. Report: artifacts/my-carz-page5-sequence/responsive.json. Cancelled intros retain their current visual stage during exit instead of flashing upcoming elements.

Final award layout verification: popup bounds and correct check-mark rendering pass at 320x568, 393x852, 768x1024 and 1440x900. Inspected compact-phone and 393x852 award screenshots against the supplied Page 6/reference popup. Browser inspection also confirms the entire new question frame has a right-to-center entrance. Evidence: artifacts/my-carz-award/responsive.json.

Motion/scenery verification completed: headless Edge passed levels 2, 3, 4, 5 and 6 with no page errors. It measured road/gate displacement at 1:1, verified road movement during car entry, minimum stage holds and Good Bad Ugly typography, and resolved a correct answer at every level. Computed background sizing preserves auto height, with 100% width for narrow strips. Reviewed countdown plus snow, beach and city scenery screenshots. Evidence: artifacts/my-carz-motion-fix/verification.json. All 23 current My Carz tests, syntax and whitespace checks pass; physical-device/audio checks remain pending.

Sequential-celebration upgrade validation: the full Edge award-flow test passed five correct answers, HUD counts, scratch/reveal, level-2 entry, wrong-answer recovery, Save & Exit and offline reload with the new celebration wait and no page errors. Evidence: artifacts/my-carz-award/verification.json.
