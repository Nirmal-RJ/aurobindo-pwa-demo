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

## 28 October 2026 - GitHub Pages preload byte mismatch

- Authorization: user reported live loading pauses with Incomplete download and supplied the GitHub Pages URL. Audited live assets: icon.svg is served as 288 bytes while deployed manifest expects 289. Git normalizes this SVG's CRLF to LF, creating a one-byte mismatch and correctly blocking readiness.
- Canonicalized My Carz SVG line endings to LF and added a scoped .gitattributes rule to keep their bytes stable across Windows/GitHub deployment. Rebuilt the manifest. Download-size verification and the Next gate remain strict. Added asset filename and received/expected byte counts to mismatch errors; no artwork, animation or gameplay changes.
- Files: .gitattributes, SVG line endings where needed, preload, manifest, HTML/worker, regression test and tracking documents. Preload v2, scoped shell v83; URLs synchronized.
- Validation: source checks and existing 27 tests pass; added mismatch retry/no-cache regression. Live deployment verification follows publication. Evidence: artifacts/my-carz-live-loading/asset-audit.json.


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


## Light question panels with neon edges - 28 October 2026

- Authorization: user requested light question-panel colors only, with a neon outline following the background image.
- Changed all six named tones to light blue/green/orange/purple/red/yellow fills, with dark readable text for every tone. Added matching neon drop-shadow outlines to the supplied frame's alpha silhouette, not a rectangular border. Source artwork remains unchanged.
- Existing color cycling, slide/sweep/dimming, timing, scoring, smoke, controls and celebration behavior are preserved. Attention v9, flow CSS v17, scoped shell v20; HTML/worker URLs synchronized.
- Validation: 23 My Carz tests and attention syntax pass. Focused browser palette/crash/input regression and visual review are recorded with artifacts/my-carz-smoke-colors/. Physical-device/audio checks remain pending.

## Smoke, standard palette and removed bottom controls - 28 October 2026

The user explicitly requested better explosion quality with black smoke/camera shake like Rocketier, standard question colors and removal of bottom arrow buttons/SWIPE TO STEER content. They also asked why the current confetti looks pixelated.

- Crash adds seven localized charcoal smoke puffs, softened edges and upward expansion, around the existing nine-part fire burst. Camera shake now uses a denser, decaying 900ms shake pattern inspired by Rocketier. The existing 900ms three-pulse red flash, original burst, crash-answer delay, modal, retry animation and audio remain. Smoke finishes before the existing 1300ms crash handoff; no timing/rule changes.
- Question tones are now explicit named standard colors: blue, green, orange, purple, red and yellow. They cycle independently of answers. The supplied white frame is tinted by a masked multiply layer, with separate white/dark text chosen for readability; neon hue rotation is retired. All slides/sweeps/dimming remain.
- Removed the bottom arrow buttons and SWIPE TO STEER/lane-name text, their click handlers, per-frame label/button updates and related styles. Keyboard arrows, swipe and lane taps remain fully available, with the existing steering lock and scoring rules. No new screen instructions were added.
- Confetti diagnosis: the current source is a 500x500, 75-frame, 256-color indexed GIF. Its small fragments and palette/dithered edges are baked into the raster; enlarging the image makes this more visible. No CSS setting can reconstruct missing detail. The original GIF/three-second celebration remains unchanged because the user asked for the cause, not approval of a replacement. A higher-resolution or vector replacement needs explicit authorization.
- Versions: flow CSS v16, attention v8, controller v14, scoped shell v19; HTML/worker URLs synchronized. Core/config/store/race-view/reward/media unchanged.
- Validation: 23 current My Carz tests and syntax checks pass. Edge checks confirm seven smoke puffs plus nine existing burst particles, changing camera transforms, unchanged crash-answer/retry, absent bottom controls, standard blue/green/orange panels, keyboard/lane-tap steering and a correct award/confetti continuation without page errors. Evidence: artifacts/my-carz-smoke-colors/verification.json; test: tests/my-carz-smoke-colors.browser.cjs. Screenshots reviewed; physical-device frame pacing and live audio remain unverified.

## Constant level-one speed - 28 October 2026

- Authorization: user requested no speed increase after upgrades, retaining level-one difficulty throughout.
- Set speedStep to 0 in the separate config. All nine levels/free play now retain the same 3.8-second spawn-to-contact window and separate two-second reading period, regardless of selected car. This supersedes historical 6% per-level acceleration below.
- No animation, visual-speed multiplier, world/tunnel synchronization, scoring, upgrade, celebration, input, save or reset logic changed. Config v2, scoped shell v18; HTML/worker URLs synchronized.
- Updated progression regression to verify the unchanged window through all eight upgrades, older-car selection and free play. Syntax/unit checks recorded for this change; browser animation QA was not repeated for this config-only adjustment.

## Sequential collection and celebration - 28 October 2026

- Authorization: user explicitly requested diamond animation/collection -> confetti celebration -> slight dimming -> next question slides in -> dimming clears. This supersedes the earlier overlapping celebration and 1300ms next-question handoff.
- Existing large-diamond animation/flight and HUD collection pulse complete first. The original award component remains 1300ms; an additional 300ms finishes the HUD's existing 500ms landing pulse. The full unchanged three-second foreground confetti then plays and is removed before advancing.
- For ordinary correct answers, dimming settles for 220ms before the existing 380ms next-question slide. It clears after the slide. Full reading and travel intervals, scoring, panel colors, introductory pacing and all other effects remain.
- Completed levels still commit/save after collection, before their added celebration wait. Upgrade/scratch presentation waits for the celebration to finish. A pending midnight reset remains deferred through reward handling. The separate car-reveal celebration is retained.
- Confetti now returns a completion promise rather than starting a detached timer; media failure resolves cleanly rather than trapping the flow. No celebration was shortened or removed.
- Controller v13, attention v7, flow CSS v15, scoped shell v17; HTML/worker URLs synchronized. Post-celebration question dimming is a milder 35% shade; original first-introduction emphasis remains unchanged. Other runtime module/media versions unchanged.
- Validation: 23 My Carz tests and syntax checks pass. Focused Edge checks confirm no award/confetti overlap, completed HUD collection, unchanged question during the full three-second confetti, then dim/slide/clear without page errors. Evidence: artifacts/my-carz-celebration-order/verification.json; test: tests/my-carz-celebration-order.browser.cjs. Full upgrade-flow recheck is recorded on completion. Physical-device/audio validation remains pending.

## Shorter HUD/question introduction - 28 October 2026

- Authorization: user requested shortening the diamond-panel -> question-panel sequence.
- Reduced only the extra opening holds: HUD 1.2s -> 0.35s; question 1.8s -> 0.5s. Existing 450ms HUD and 380ms question entrances, dimming, car hold, colors, effects and sequence remain. This removes 2.15 seconds from startup.
- Full two-second reading and all travel/scoring/reward times are unchanged. Attention v6, scoped shell v16; HTML/worker URLs synchronized. Updated pacing test expectations.
- Validation: 23 My Carz tests and attention-module syntax pass. Focused Edge timing measurement checks the faster HUD/question stages and preserved reading interval; report: artifacts/my-carz-shorter-intro/verification.json. Physical-device smoothness remains unverified.

## Diamond-first introduction, varied panels and simpler road - 28 October 2026

- Authorization: user requested diamond HUD before the question, a different panel color for every question using page-5/question-panel-white.webp, removal of thick white road dashes and replacement of the double yellow center marking with a single white line.
- Opening order is now countdown -> car -> diamond HUD -> question -> reading/driving. Existing car/HUD/question entrances, individual hold durations, moving scenery and dimmed attention follow that order. The HUD remains visible when the question appears; the question is unrevealed while the HUD enters. Total startup duration and the full reading/travel windows are unchanged.
- The supplied white WebP is the actual question frame. Six color tones cycle independently of answers/question selection, never repeating consecutively. Only the decorative frame is tinted; dark question text stays sharp/readable, and slide/sweep/dimming animations remain. The source image is unchanged.
- Removed the four thick dashed lane-guide patterns from canvas rendering. A single thin white line replaces the double yellow center lines. Scrolling texture, speed streaks, scenery/curbs, tunnel motion, lane geometry and controls remain.
- Versions: flow CSS v14, controller v12, attention v5, race-view v6, scoped shell v15. HTML/worker URLs synchronized; core/config/store/reward and media files unchanged.
- Validation: 23 My Carz tests and syntax pass. Edge confirms HUD-first ordering and dimming, three successive distinct frame tones using the supplied asset, three correct answers/HUD increments and continuing questions, without page errors. Reviewed panel/road screenshots. Evidence: artifacts/my-carz-panel-colors/verification.json; test: tests/my-carz-panel-colors.browser.cjs. Earlier introduction tests updated to the approved order. Physical-device/audio checks remain pending.

## Car-attached exhaust correction - 28 October 2026

- Authorization: user reported exhaust appearing before the car entered the screen.
- Cause: the higher-car exhaust was drawn unconditionally at a fixed road position, independent of the car's hidden state and animated entrance.
- The renderer now measures the car artwork's opaque rear, attaches exhaust to the animated car box/steering pose, and shares its actual visibility and opacity. Offscreen exhaust stays outside the canvas until the car's rear enters; countdown/hidden-car stages no longer show floating flames. The existing flame shape, color, pulse and eligible cars are retained.
- No gameplay, timing, scrolling, entry animation or audio behavior changed. Race-view v5 and scoped shell v14; HTML/worker URLs synchronized. Core/config/store/controller/media unchanged.
- Validation: 23 My Carz tests and race-view syntax pass. Focused Edge checks/report: artifacts/my-carz-exhaust/; test: tests/my-carz-exhaust.browser.cjs. Physical-device smoothness remains unverified.

## Introduction dimming and countdown text - 28 October 2026

The user requested dimming behind the incoming question and diamond panels and removing all text below 3/2/1/GO.

- A pointer-transparent dimmer covers the moving race background during question/HUD attention. The active question stays bright while other HUD content dims; then the diamond panel stays bright while the question/Exit surroundings dim. Transitions are 220ms and use the existing foreground clock.
- The first question and HUD retain their current entrances/holds. Every later question entrance also dims its surroundings. Focus clears before normal reading/driving; Exit cancellation clears pending dimming. Road/scenery continues moving beneath it. No reading, travel, answer, hold, reward or safety timing was changed.
- Countdown now contains only the animated number/GO label. Removed the level/five-questions line and tunnel instruction from markup, its controller update and its dedicated CSS. Countdown sound, Good Bad Ugly typography/pulse and dimmed background remain.
- Latest versions: flow CSS v13, controller v11, attention v4, scoped shell v13. HTML/worker URLs synchronized; race-view/core/config/store/reward/media unchanged.
- Validation: all 23 current My Carz tests and syntax checks pass. Edge verified countdown-only text, distinct question/HUD spotlighting, moving road under the dimmer, restored brightness for reading, dimming on the next question, correct feedback and Save & Exit without page errors. Screenshots reviewed. Evidence: artifacts/my-carz-intro-dimming/verification.json; test: tests/my-carz-intro-dimming.browser.cjs. Physical-phone/audio verification remains pending.

## Moving entry, readable pacing and scenery correction - 28 October 2026

The latest user request supersedes the ring countdown presentation, short opening settles and separate road-only speed multiplier below.

- Road/scenery now continues through the entire car-entry/settle stage as well as countdown, question introduction and reading. Pausing/backgrounding still freezes it.
- Countdown presentation is adapted directly from Good Bad Ugly's boost cue: centered italic white 90px numbers, red offset shadow, red level line, dark gradient and its 350ms entrance/600ms beat pulse. The requested 3/2/1/GO sequence, four-second duration and sound remain. Rings, borders and lights from the superseded countdown design are replaced only within this explicitly requested visual change.
- Opening pacing is centralized in CarzAttention.pacing: 1.5s hold after the fast car slide, 1.8s after question entrance and 1.2s after diamond-HUD entrance. Each stage has time to register before the next starts. These are opening presentation holds; normal question reading remains a full two seconds and travel/scoring/feedback times are unchanged. Later questions do not repeat the full introduction.
- Road and tunnels now share the same fast world distance. To retain both the faster motion and original deadline, tunnels start farther offscreen and cross the measured car nose at the same time as before. There is no longer a second road-only 1.75x multiplier that makes the gate appear to slide against the road. Guidance is based on physical nearness in that shared coordinate rather than the old unscaled time fraction, preserving late-only lane guidance. A neutral tunnel cue still finishes before the lane arrows begin.
- Scenery diagnosis: level 2 images have 940px-wide canvases but only 167px/172px of roadside artwork. Levels 3-6 are already narrow strips (160-170px wide). The old rule enlarged every later level by 555%, then forced viewport height, distorting the strips. Only level 2 now uses side-specific canvas cropping widths; all strips use their full native content width and auto background height to preserve aspect ratio. Source images are unchanged.
- Versions: flow CSS v12, controller v10, attention v3, race-view v4, scoped shell v12. Core/config/store/reward module and original media remain unchanged by this step.
- Regression checks cover the original gate-crossing deadline and physical-nearness guidance. Browser motion/scenery/pacing evidence is stored in artifacts/my-carz-motion-fix/; physical-device smoothness and live audio remain unverified.

## Page 5 reference controls and reward polish - 28 October 2026

The user's latest five-part request supersedes the earlier countdown labels, car entrance duration, visual scrolling scale and tiny diamond feedback presentation below.

- The supplied game flow and Page 5/6 references have Exit, not a separate pause control. The visible pause button and its click handler/styles are removed as requested. Exit still offers Keep Playing / Save & Exit. Escape opens Exit; automatic background, portrait and foreground-stall safety pauses are retained.
- Countdown now reads 3 / 2 / 1 / GO!, keeping four one-second beats, dimmed focus, ring, lights and existing sound. There is no READY beat. GO has green accent lights.
- Current car now visibly slides upward from below the screen over 400ms, rather than only fading at its resting position. Upgrades keep their entry/glow effect with a faster 550ms slide. Crash retry's existing return animation remains unchanged.
- Road markings, texture, speed streaks and scenery scroll at 1.75 times the previous visual rate. Gate positions, approach progress, car camera, reading/travel duration, steering guard, scoring and level speed rules remain unchanged. Car/tunnel contact still uses the same unscaled geometry.
- Every question frame enters from the right over the existing 380ms entrance and exits to the left over 260ms. Its text entrance and attention sweep are retained. Exit happens within the existing answer-feedback window, not as extra delay. Full two-second reading starts after each entrance.
- Correct answers use the supplied Page 6 reference and attached green popup as layout guidance: a large diamond with radial rays, mild surrounding dimming, check icon, current streak count, Correct! and +1 Diamond. Diamond/popup mirror around the selected lane so both fit without covering each other.
- Reward presentation is owned by my-carz-reward-view.js. It emphasizes the large diamond for 350ms, retains the 750ms flight to the actual next HUD slot, updates the earned diamond on landing, then settles/fades over 200ms. Total feedback remains 1300ms, shared with the question exit. Existing confetti, correct sound, streak/unlock rules, wrong-answer effects and automatic safety pauses remain.
- Latest versions: flow CSS v11, controller v9, attention v2, race-view v3, reward-view v1, scoped shell v11. HTML/worker URLs and syntax checks include the new module. Core/config/store and production media are unchanged by this step.

Browser validation and responsive screenshots are recorded in artifacts/my-carz-award/. Physical-phone smoothness and audible sound synchronization remain unverified.

## Page 5 ordered attention flow - 28 October 2026

The user's subsequent Page 5 request authorizes the following ordered reveal, superseding the earlier upgrade-before-countdown placement for entry into the driving screen. No existing effect or functionality is removed.

1. READY/3/2/1 retains its dimmed focus, pulse, ring, lights, sound and four-second duration. Upcoming car, question, diamond bar and steering controls stay unrevealed until their turn.
2. Current car appears with a 550ms localized fade/light settle. An upgraded car instead uses its existing full 1100ms entry animation here, after the countdown.
3. The question keeps its 380ms text entrance and gains a 650ms light sweep confined to its frame. A 320ms settle after the text entrance keeps this cue separate from the next one.
4. Diamond bar enters at the top right over 450ms with a short settle/highlight. Existing diamond counts/award animations are retained.
5. Full two-second reading begins after the startup reveals. Steering controls become available and enter over 350ms, with all keyboard/swipe/tap/button controls retained. This control entrance adds no timer delay. Later questions keep the existing 380ms entrance and full reading window, without replaying the whole startup sequence.
6. Dynamic tunnels approach on the existing road/gate geometry and travel timing. A neutral 480ms brightness/glow cue at 40% approach draws attention to their labels without suggesting which answer is correct. It settles before the final 35% guidance period at every configured speed.
7. Existing green Good/red Bad lane chevrons appear only near tunnel entry and follow the actual car. Their existing movement/fade is retained with a localized glow; no early answer hint or persistent competing highlight is introduced.

`my-carz-attention.js` owns these presentation stages/cues only. The controller owns progression and time, and the existing foreground clock freezes entrances while paused/backgrounded. An entry token cancels pending staged reveals after Save & Exit so they cannot restart a discarded drive. Core rules, config, storage, randomization, rewards, reset rules, sounds, confetti, crash/return effects and scoring geometry are unchanged by this step.

Latest versions: flow CSS v10, controller v8, attention module v1, scoped shell v10. HTML/worker URLs and syntax checks include the new module. Production media and race-view v2 are unchanged.

Validation: 21 My Carz tests and syntax/whitespace checks pass. Edge verifies ordered stages, pause during car reveal, full reading window, tunnel-before-arrow emphasis, five correct answers, preserved upgrade entry after countdown and level-2 Save & Exit. Evidence: artifacts/my-carz-page5-sequence/verification.json and screenshots. Physical-device frame pacing and live audio remain unverified.

## Countdown and celebration refinement - 28 October 2026

The user requested a polished race entrance, dim background throughout 3-2-1, better confetti presentation, and explicit preservation of every existing animation and function.

- Countdown is ready before the initial race screen enters, so it never arrives over a briefly undimmed screen. A centered radial dim layer separates READY/3/2/1 from the moving road, HUD and car. An animated ring and three sequential lights give the countdown a consistent focal point across viewport sizes.
- The original 750ms scale/opacity pulse now targets only the displayed number rather than moving the full overlay. Four one-second READY/3/2/1 beats, countdown audio, upgrade entry, question entrance and the full reading/travel times remain unchanged. The dim layer fades during the last 220ms of the existing final beat, adding no delay before the question.
- The original square confetti GIF remains unchanged and plays for the same three foreground seconds after load. It is now contained and bottom-aligned rather than enlarged/cropped to a portrait viewport, retaining both side bursts. Reveal celebrations have a dedicated layer above the reward panel; no particles, triggers or playback were removed.
- Countdown, pulse, ring and lights retain the existing foreground animation clock and pause behavior. Steering, scoring, road/gate movement, all reward/crash effects, audio, save/reset rules and core/config/store are outside this change.
- Versions: flow CSS v9, controller v7, scoped shell v9; race-view v2 and the existing media manifest are unchanged. HTML and worker URLs agree.
- Validation: 21 current My Carz tests, syntax and whitespace checks pass. Headless Edge checked READY/3/2/1 dimming and centering, subsequent question/answer, original GIF fit/removal, pause freeze and Save & Exit; bounds/screenshots pass at 320x568, 375x667, 393x852, 768x1024 and 1440x900. Inspected countdown and confetti screenshots. Evidence: artifacts/my-carz-countdown/; repeat with CARZ_PLAYWRIGHT set to an installed Playwright package and node tests/my-carz-countdown.browser.cjs against a running server (CARZ_URL optional).
- Limits: physical-phone frame pacing and audible sound synchronization remain unverified. No original media was edited or replaced.

## Approved implementation snapshot - 27 October 2026

Latest authorized correction: following review of the user's screen recording, race presentation now uses a stable car camera and moving gates tied to road distance. The gate beam reaches the car's measured opaque nose when the answer commits. Steering settles over 180ms and rejects new commands in the last 200ms; the visible lane is scored. Correct passage no longer fades/repositions the car. New questions have a 380ms entrance before the full two-second reading interval; crash retry has a 260ms panel exit and 1100ms car entry. Core progression, question scheduling, travel duration, storage and reset logic are unchanged.

Crash presentation masks the original artwork's baked checkerboard, places the answer inside its red panel, and retains the supplied button, localized burst, 900ms three-pulse impact and 1300ms panel delay. Diamond flight starts at the car (750ms plus 550ms hold). Controls are enlarged, chevrons follow the physical lane, and foreground waits/transitions/CSS effects share frame time with the race. Pause preserves animation position and resumes interrupted audio; the existing confetti GIF retains its own playback clock. See the recording-review entry in the progress document for exact scope, tests and device/audio verification limits. Current versions: flow CSS v8, race view v2, controller v6, scoped shell v8; 87 production media files.

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
| Normalized race geometry, road/scenery rendering and tunnel approach | my-carz-race-view.js |
| Ordered Page 5 reveal and localized attention cues | my-carz-attention.js |
| Large diamond award, reference popup and HUD landing | my-carz-reward-view.js |
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
5. Ready, 3, 2, 1 precede driving. Each question has two seconds of reading time while the road continues moving, then the tunnel approach begins. In the approved page-5 reference presentation, the car drives forward beneath the overhead tunnel gates. The player's current lane is automatically the answer at the tunnel crossing; no swipe is required to submit.
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

The recording-review correction in the latest implementation snapshot supersedes the older interpolation, feedback freeze and car-return descriptions in this historical contract. Preserve the current stable-camera passage, deterministic steering/commit guard, staged question/retry entrances and foreground animation clock. Other durations and effects listed below remain unless explicitly superseded above.

- Screen transitions: guarded exit 260ms, entrance 380ms; next screen and controls are sequenced after the prior screen exits. There is a Web Animations fallback using visible opacity/transform transitions.
- Car steering uses delta-time interpolation and tilt. Road/scenery remains continuous during reading and freezes through answer feedback/pause; speed follows the level.
- Preserved three-pulse red wrong-impact sequence lasts 900ms, with a localized explosion before the crash modal. Correct feedback uses the existing bottom-aligned confetti GIF and a 750ms diamond flight before the HUD count settles.
- Garage preview entrance 550ms; new-car race entry 1100ms. Arrow chevrons animate in the currently selected lane: green Good, red Bad. As specifically requested for page-5-b, guidance appears only near tunnel entry (the final 35% of travel), with a 180ms visibility fade; it is hidden during countdown, reading, early travel and feedback. Modal entrances use scale/settle.
- Backgrounding pauses race time/sounds; active reading/travel/countdown opens Pause. Touch-landscape guidance freezes the race until portrait returns. Keyboard left/right, on-screen arrows, swipe and lane tapping are supported. Modal controls manage focus and trap Tab.
- No global motion suppression or new reduced-motion branches have been introduced. Preserve approved effects; change them only within explicit user scope.

## Temporary media and outstanding production inputs

- Cars are named Car-1 through Car-9. Six inherited models are reused for nine temporary slots. Replace config records when names/order and car art arrive.
- Supplied demo images temporarily serve both introduction and How to Play; GIFs can replace config helpSlides later.
- Arrow chevrons are original CSS animation pending supplied GIFs.
- Frames arrays are empty pending supplied car images. Current showcase uses a gentle automatic perspective turntable effect, not a true 360-degree model. The frame playback integration is ready for supplied rotations.
- Paint remains functional through the inherited light-body pixel recoloring algorithm.

## Cache and validation

Race reference update (27 October 2026): page-5-a/b define the road proportions, overhead gates, larger car, exit artwork, diamond panel and cyan illustrated question frame. A new lightweight SVG reproduces the blue question-frame style without modifying the supplied white panel or reference images. First-level scenery uses the supplied 1-a strips; subsequent themes retain their artwork and expose the roadside edge at the proper scale. Level/timer metadata remain accessible but visually hidden to match the reference; Pause and all steering methods remain available.

Presentation is isolated in my-carz-race-view.js (v1); rules/storage remain unchanged. Car approach and tunnel overlap are continuous and delta-time driven. Correct passage and the next-car return use the existing 750ms diamond-flight plus 550ms feedback window. Wrong-impact duration, crash/audio timing, reading/travel timing, screen transitions and 1100ms upgrade entry remain intact. Flow CSS v7, presentation JS v5, dedicated shell v7; manifest rebuilt for 86 production media files (~16.1 MiB). Syntax plus 24 tests pass. Browser checks and limits are recorded in the latest progress entry and artifacts/my-carz-race-layout/.

Home button-size correction (27 October 2026): user requested reference-sized buttons. Start Driving and returning action images now fill their allocated widths with automatic proportional heights instead of being reduced by fixed-height containment. Original assets, positions, animations, audio and button gating are preserved. Flow CSS v6; dedicated shell v6; presentation JS v4. Five browser viewport checks and arrow/paint interactions pass; reviewed 375x667. Physical-device/audio checks remain pending.

Exact-reference home correction (27 October 2026): user explicitly prohibited extra home content. Removed home Back to games and its styling; the opening-page link remains. Home now has only the reference composition's visible content areas. Flow CSS v5; dedicated shell v5; presentation JS remains v4. No animation/audio or gameplay changes.

Home reference update (27 October 2026): home now follows page-3-b-reference.webp with the platform car, red-arrow car-name bar, large Current car/Next car panels, paint row and supplied action buttons. All nine car slots remain horizontally scrollable, all eleven paints remain functional, and returning-only buttons retain their existing gating. Title/level/status text remains accessible but is visually hidden on home to match the reference. Collection/gameplay and approved animation/audio timings are unchanged. Current versions: flow CSS v4, presentation JS v4, dedicated shell v4. Syntax and 21 tests pass; isolated headless Edge checked five phone/tablet/PC viewports plus arrow/paint interactions. Screenshots reviewed at 375x667 and 393x852; physical-device/audio verification remains pending. Evidence: artifacts/my-carz-home-layout/.

Opening-fill follow-up (27 October 2026): the user requested Rocketier-style front-page fill. Opening art now uses `center top / 100% 100%`, stretching to fill the portrait stage without cropping or blurred extensions. Next retains its original stage-relative coordinates and proportional button image. This supersedes the proportional opening-art/fitted-button description immediately below. Flow CSS v3; dedicated shell v3. Other screen layouts, gameplay, portrait guidance, animations and audio remain unchanged. Syntax and all 21 tests pass; browser/device visual verification remains pending.

Responsive layout update (27 October 2026): portrait phones up to 600 CSS pixels wide fill the dynamic viewport; tablets and PCs retain the centered portrait stage. Opening artwork stays proportional with a softened background extension, and Next tracks the fitted artwork. Garage/safe-area and container-relative modal sizing handle shorter stages. Landscape touch-device portrait guidance and all gameplay/animation/audio contracts remain unchanged. Flow CSS is now v2 and the dedicated shell is v2, superseding those versions below. Syntax and 21 My Carz tests pass; visual checks on this PC remain pending because Playwright is unavailable and direct headless Edge failed GPU initialization.

Dedicated shell v1; My Carz CSS v4, flow CSS v1, presentation JS v3, other modules v1. Root shell v460 caches the compatibility redirect; My Carz's own worker handles its runtime/media. The generated manifest currently contains 85 production files, about 16.1 MiB; reference/old artwork is excluded. Unchanged content revisions are reused.

Run npm run assets:my-carz after media changes (also part of predev/prestart), npm run check:my-carz, npm run test:my-carz, node --check sw.js and git diff --check. Optional browser test: CARZ_PLAYWRIGHT points to a Playwright package and CARZ_URL selects the running game; run node tests/my-carz.browser.cjs. Browser QA evidence belongs in artifacts/my-carz-flow/.

Physical phone performance, live audio mixing and production car/GIF frame quality remain unverified. Do not equate rule tests or headless screenshots with those checks.

Verification on 27 October 2026: 21 My Carz rules/cache tests and two root-worker tests pass. Headless Edge passed full cold-load/demo/crash/upgrade/save/exit/offline flows and five viewport bounds; home, race/tunnels and reward screenshots were reviewed. Additional Edge checks passed real scratch gestures, download failure/retry, first-visit button visibility, touch-landscape guidance, Car-9 celebration/free play, deferred midnight reset and archive retention. Reports: artifacts/my-carz-flow/verification.json and extra-verification.json. These are browser checks, not physical-device/audio validation.

The supplied page-8/scratch-card.webp was detected during implementation and is used as the scratch surface, trimmed to its opaque artwork bounds at render time. The manifest now includes 85 production media files (~16.1 MiB).

## Home PC handoff on 27 October 2026

The original agreed flow is checked in at `docs/Carz Game Flow.docx` beside these documents. Later approved decisions are captured in this details file and the progress log. README.md has clone/pull, Node version, startup and validation instructions. Source/media/config/tests and browser evidence are portable; local player saves/cache and external Playwright installations are not Git content.

Next production work: receive final nine-car names/order/art and rotation frames, replace temporary help images with supplied GIFs, replace CSS arrows if supplied GIFs are preferred, then verify the production media on physical phones and check the live sound mix. Backend integration remains deferred behind the repository adapter.

Handoff validation: 48 targeted tests pass and project/My Carz syntax checks pass. The full repository suite is 210/212: two pre-existing Snake test failures reference undefined beginTutorial/slitheringBody; Snake source/test object hashes match the prior commit. These are outside My Carz and were not changed.

Page 5 layout/offline verification: revealed question, diamond HUD, car and steering bounds pass at 320x568, 375x667, 768x1024 and 1440x900; the full sequence was checked at 393x852. The attention module also loads from the scoped worker offline. Report: artifacts/my-carz-page5-sequence/responsive.json. Cancelled intros retain their current visual stage during exit instead of flashing upcoming elements.

Final award layout verification: popup bounds and correct check-mark rendering pass at 320x568, 393x852, 768x1024 and 1440x900. Inspected compact-phone and 393x852 award screenshots against the supplied Page 6/reference popup. Browser inspection also confirms the entire new question frame has a right-to-center entrance. Evidence: artifacts/my-carz-award/responsive.json.

Motion/scenery verification completed: headless Edge passed levels 2, 3, 4, 5 and 6 with no page errors. It measured road/gate displacement at 1:1, verified road movement during car entry, minimum stage holds and Good Bad Ugly typography, and resolved a correct answer at every level. Computed background sizing preserves auto height, with 100% width for narrow strips. Reviewed countdown plus snow, beach and city scenery screenshots. Evidence: artifacts/my-carz-motion-fix/verification.json. All 23 current My Carz tests, syntax and whitespace checks pass; physical-device/audio checks remain pending.

Sequential-celebration upgrade validation: the full Edge award-flow test passed five correct answers, HUD counts, scratch/reveal, level-2 entry, wrong-answer recovery, Save & Exit and offline reload with the new celebration wait and no page errors. Evidence: artifacts/my-carz-award/verification.json.
