# AB Express - progress

## 1 November 2026 - Card and flow review

- Added AB Express last in rc-game-gallery as a non-playable Coming soon card with temporary train/text artwork.
- Recorded portrait requirement and separated document proposal from confirmed implementation scope. Copied original flow DOCX unchanged into docs.
- Root shell v471 refreshes gallery. Gameplay awaits clarification.
- Validation: source placement and worker syntax/whitespace checks. Browser visual verification pending.

## 1 November 2026 - Asset import and confirmed flow

- User requested exact ownership folders ab-express-assets and ab-express-scripts. Moved planning/source DOCX into assets/ab-express-scripts; copied the supplied asset tree into assets/ab-express-assets, preserving names and hierarchy.
- Recorded elapsed-time-only challenge counter, all five practice choices, immediate challenge access, shuffled nonrepeating challenge buckets, first-error stop, persisted progress, current-bucket restart and demo skipping.
- Saved all 24 master steps and five eight-step bucket mappings.
- Validation: 85 source/copied files verified by SHA-256 and matching file counts. No gameplay runtime or media edits; cache unaffected by unreferenced asset import.

## 1 November 2026 - Authorized playable implementation

- Connected the final RC-gallery card to the portrait game using the supplied landing artwork. Other games were not changed. Root shell cache is v472; AB Express owns its v1 worker/cache and generated required-image manifest.
- Added the full landing/loading, five-slide demo, Home, bucket-select practice, sequence arrangement, tunnel checking, success/failure, comparison/retry, challenge streak, star reward and three-page learning flows.
- Implemented all 24 canonical actions and the five approved eight-action buckets. Added drag, tap-to-move and keyboard ordering, cancellation restoration, input gating, first-error stop, nonrepeating challenge runs, different-bucket failure retry and retained current-bucket checkpoints.
- Challenge counts elapsed arranging time only. Saved demo completion, challenge order/index and stars remain local to AB Express. Save errors offer retry; asset failures keep Next unavailable and offer retry. Offline reopening is supported after successful initial loading.
- Sequenced train travel, per-step ticks/confetti, crash smoke/shake, newly earned streak animation and star rays. Incoming screens wait for image readiness while the previous screen remains painted. Hidden-page/orientation pauses preserve active motion without replaying completed entrances.
- Kept individual artwork proportional inside a portrait frame. Added a mobile landscape-to-portrait prompt, safe-area sizing and visual-viewport resize handling. Corrected the reward artwork's "start" typo using a text overlay.
- User approved temporary page-5/page-6 reference demo slides and elapsed-time copy over the source countdown wording. Audio remains pending the user's AB Express files.
- Validation: syntax checks and five core tests passed. Full Edge and Windows WebKit flows passed: onboarding, practice, train checking, retained challenge checkpoint, failure/comparison retry, all five successful buckets/star award, learning and 320/390/768/1440-width layouts. Additional Chromium mobile-context checks passed for failed-asset retry, offline reload, rotation prompt and native touch reorder/cancel.
- Screenshots are under artifacts/ab-express. Desktop engine checks are not physical iPhone/Android verification; device performance and audio synchronization remain pending. No Git commit/push was requested for this implementation.

## 1 November 2026 - Confirmed 60-second challenge rounds

- User replaced the elapsed-only rule with a 60-second limit per challenge bucket and explicitly confirmed timeout uses the failed-round flow.
- Countdown begins when arrangement is visible, stops on submission, and pauses on background/orientation interruption. Foreground timer accounting uses uncapped elapsed time so delayed frames cannot extend the round. Submission rechecks the deadline to prevent a last-frame race.
- At zero, capture the current sequence, lock input, show time-up/crash feedback, reset the streak, offer comparison and retry a different bucket. Correct-but-unsubmitted sequences also expire. Practice stays untimed; new/restarted rounds get a fresh 60 seconds.
- Updated intro copy, authoritative details/rules, browser assertion and scoped URLs/cache to v2. Existing saved streaks and stars use the unchanged storage key.
- Validation: syntax checks, five core tests and the dedicated browser timer suite passed (expiry, streak reset, different-bucket retry, fresh countdown, background pause, delayed foreground frame, no expiry after submission, untimed practice). Physical iPhone/Android timer verification remains pending.

## 1 November 2026 - User-requested responsiveness, animation and content audit

- Audited 23 screens/states at 320x568, 360x640, 390x844, 430x932, 768x1024, 1024x768 and 1440x900 in Edge and Windows WebKit: 161 combinations per engine, 322 total. Checked all five arrangement/comparison buckets, all demos, learning pages, Home, landing, practice, wrong-answer and challenge introduction. Reports/screenshots: artifacts/ab-express-audit.
- Full Edge/WebKit playthroughs additionally checked success, streak and reward screens at four sizes, train motion and pause/resume, star motion, ray duration, input and persisted five-round completion. WebKit ran with reduced-motion enabled; approved effects remain active.
- Visual review caught duplicate baked/live demo navigation and Back covering illustrated Start. Replaced only the reference slides' navigation strip using supplied scene backgrounds, retaining one live navigation set.
- Removed duplicate Home on the final learning page; replaced custom text Home badges with the supplied Home asset. Removed the redundant floating wrong marker when the failure panel's own marker appears. Correct-result marker moves smoothly to its reference position.
- Entrance animations and their JavaScript holds now wait for incoming artwork visibility rather than consuming part of their duration while hidden. Outgoing screens remain painted during preparation.
- Corrected supplied weighing/post-weighing subtitle errors from "before weighing" to "during weighing" / "after weighing". All 24 canonical action descriptions and five bucket definitions remain unchanged.
- Enlarged bucket touch targets to >=44px at a 320px viewport, and expanded Back/Next/Home hit areas without overlaps. Targeted final caption and practice-layout checks passed.
- Content review: no invented actions, questions, scoring rules, marketing text or debug copy. Functional additions serve the approved flow: bucket selection, countdown/timeout feedback, navigation and recoverable loading/save errors. Audio remains pending the user's files. Reference-only demo pages remain the approved temporary solution.
- Regression checks passed: syntax, five core tests, both complete browser flows, both layout matrices, native-touch reorder/cancel, failed asset retry, offline reload, mobile rotation gate, and timer expiry/pause/retry/submission protection. Scoped URL/cache version is v3; no other game's runtime/assets were changed.
- Limits: this is desktop-engine and emulated-viewport verification, not physical iPhone/Android testing. Side-by-side comparison text remains compact at small widths due to the supplied eight-row composition. Physical-device readability/performance and future audio synchronization still require device review.

## 1 November 2026 - Mobile gaps and thin compartments corrected

- User's screenshot exposed issues missed by the earlier audit: the fixed 360x640 stage letterboxed on tall phones, and source-image padding plus stretched row rendering made the compartments thin with poorly placed labels.
- Portrait phone gameplay now uses the available viewport width and height, with responsive row spacing. Other portrait screens retain proportional reference compositions with scene-colored blurred overflow instead of solid letterbox bars; desktop composition remains contained.
- Cropped transparent compartment margins in the rendering layer using the visible alpha bounds (126,149)-(2048,622), without modifying the supplied image. Increased mobile frame/label size, kept icons from shrinking, centered copy inside the cream area, and preserved the live compartment's dimensions while dragging.
- Fixed a background overflow offset found during navigation regression checks. Scoped runtime/cache URLs advanced to v4.
- Checked viewport coverage at 320x568, 390x844 and 430x932 in Edge and WebKit; inspected screenshots including the longest bucket-5 copy. Native touch reorder/cancel, loader retry/offline/orientation tests and syntax/core checks passed. Physical-device/browser-chrome fullscreen remains unverified; this change fills the game viewport.
- Test server uses separate port 4174 and is stopped after validation so the user's dev port 4173 remains available.
- Final full-flow Edge regression passed after the mobile layout changes (practice, challenge checkpoint/retry, five-round reward and responsive controls). Added an explicit no-letterboxing assertion to the mobile regression test.

## 1 November 2026 - Rocketier portrait scene sizing replicated

- Inspected Rocketier's live CSS: full-width mobile scenes use viewport-based height rather than a centered fixed-ratio stage. Its portrait fill does not depend on a native Fullscreen API request.
- Applied that approach to every AB Express portrait phone scene, not just arrangement. Removed the blurred gap-fill workaround and centered 9:16 mobile positioning. Backgrounds fill the scene; independent image controls retain contain sizing. Scene artwork also covers safe-area background while controls remain inset.
- Updated temporary-demo footer sizing to follow the actual scene height. Preserved desktop containment, gameplay, timing, input and all approved effects. No Rocketier files were changed. Runtime/cache URLs now v5.
- Added explicit viewport-fill assertions for every portrait phone screen in the audit. Edge and Windows WebKit each passed 161 screen/size combinations, including exact scene coverage at 320/360/390/430 widths. Visual review of full-height menu and learning screens, syntax checks and five core tests passed. Physical device/browser-chrome behavior remains unverified.

## 1 November 2026 - Learning Home button size and alignment

- Enlarged Home from 22% to 35% of the learning scene width, centered it, and aligned its top/height with Back and Next. Adjusted the two neighboring buttons within the same footer row to preserve spacing. Other screens' navigation is unchanged.
- Checked all three learning pages at 320, 390 and 768 widths: aligned button bounds, no overlap, and working Home navigation. Visually inspected the middle page. Cache/runtime URLs advanced to v6; physical-device verification remains pending.

## 2 November 2026 - Consistent Home button scale and placement

- Enlarged Practice Home and centered it below Start Practising. Rebalanced bucket-selector spacing so both actions fit without overlap even at 320x568.
- Reviewed all screens for the same issue. Challenge introduction and star reward now stack Home below the primary action. Arrangement and comparison use a spacious two-button footer; replay demos use the same larger centered Home as learning pages. Previously approved learning footer remains unchanged.
- Preserved artwork proportions, gameplay, timing, effects and navigation destinations. Scoped cache/runtime URLs advanced to v7.
- Edge's seven-size, 161-state audit passed; stored evidence also confirms Home widths >=30% of the scene and Practice Home below Start. WebKit full flow/result-screen checks passed, along with all five returning-player demo footers at 320px, syntax and core tests. Visually reviewed Practice, Challenge and comparison screenshots. Physical-device verification remains pending.
- Added regression assertions for readable Home sizing and Practice stacking, so bounds-only checks cannot overlook the earlier tiny-button defect. Temporary test server on 4174 was stopped after checks.

## 2 November 2026 - Practice primary-action hierarchy

- Made Start Practising visibly larger than Home by cropping its transparent source margins in CSS and sizing the visible button proportionally. Kept Home unchanged and centered below it; no other pages changed.
- Verified 320, 390 and 768 widths: Start is over 40% wider than Home, with no vertical overlap; clicking it still enters practice. Visually reviewed the 390px screenshot. Runtime/cache URLs advanced to v8. Physical-device testing remains pending.

## 2 November 2026 - Page 9 reference proportions and single Start control

- Removed Home from the arranging page in both practice and challenge; retained Home on other pages. Centered Start the Train and cropped its transparent display margins for a proportionate reference-style button.
- Inspected the exact supplied Downloads page-9 reference. Matched the narrower 71%-width compartment column, moved its top to 11.3%, increased its height to 79.6%, and reduced row gaps to 2px. This corrects the overly wide, vertically squeezed appearance while fitting all eight steps.
- Preserved full descriptions inside the cream panels; placed the challenge timer in the right gutter so it cannot cover the first compartment.
- Verified Home removal, centered Start and full label fit at 320, 390 and 768 widths; visually reviewed the tall-phone composition. Native touch reorder/cancel, loader/offline/orientation checks, syntax and five core tests passed. Physical-device verification remains pending. Scoped runtime/cache URLs advanced to v9.

## 2 November 2026 - Bottom train entry and answer-first continuation

- Train now begins fully below the viewport and travels upward continuously over 2000ms with its attached carriages before checking starts. Existing intro/check/impact holds remain intact; entry uses the shared pausable sequence clock.
- Failure feedback now decodes and reveals before continuation exists: 650ms reveal plus 1600ms reading hold, then Next (practice) or Check Right Order (challenge). Success also waits for decoded answer artwork and the presentation/read interval before Next. Timeout uses the same entry and answer-first failure presentation.
- Added named configuration timings and a dedicated train browser regression. Confirmed below-screen initial engine bounds, upward travel, no Next during entry or answer reveal/reading, and successful full sequence completion. Syntax and five core tests passed. Physical-device animation review remains pending.
- Runtime/cache URLs advanced to v10; tests ran on 4174 and the temporary server was stopped afterward.

## 2 November 2026 - Approved crash and comparison rework

- Replaced the weak single smoke effect with a connected 2800ms burst, shock ring, camera shake, carriage recoil, sparks and layered rising smoke. New isolated effects module uses the existing pausable clock; named config controls intensity and timing. Crash title follows impact; feedback and continuation wait until smoke clears and the existing answer reading hold completes.
- Comparison now uses scrollable paired cards with 14px logical full descriptions, action icons, numbered positions and explicit correctness markers. Preserved supplied heading/column artwork and footer actions. No AB audio was invented or borrowed.
- Syntax checks and all five core tests passed. Dedicated crash/comparison test passed in Edge and WebKit at 320x568, 390x844, 430x932 and 768x1024, including preserved effects with reduced-motion preference. Captured and visually inspected impact, smoke and phone comparison screenshots. Existing train regression passed for bottom entry, delayed failure Next and successful completion.
- Physical iPhone/Android animation performance and audio remain unverified. Browser screenshots are under artifacts/ab-express-impact. Scoped runtime/cache versions advanced to v11. Temporary port 4174 server stopped after verification.

## 2 November 2026 - Compartment padding and supplied comparison artwork

- Increased arranging-panel left/right padding and reduced icons to 24px so icons and copy stay inside the cream panel without touching the red frame.
- Verified supplied Downloads page-14-bg.webp and project asset are byte-identical. Restored that image's eight paired compartments as the comparison layout; removed custom cards/borders/scrolling and aligned icons and full text to the baked-in icon areas and cream insets.
- Visually inspected arranging and comparison screenshots. Edge and WebKit crash/comparison checks passed at four viewport sizes; syntax and five core tests passed. Physical device review remains pending. Scoped cache and URLs advanced to v12; no other game runtime changed.

## 2 November 2026 - Larger arranging compartments and text

- Widened the arranging column from 71% to 88% and increased text from 10.5px to 12px, retaining all eight rows, artwork and Start control. Added right padding for border clearance. Moved the challenge timer beside the bottom action to clear the wider rows.
- Visually reviewed the phone layout; all 24 descriptions fit at 320x568, 390x844 and 430x932 in Edge. Existing crash/comparison browser check, syntax checks and five core tests passed. Physical device validation remains pending. Scoped version advanced to v13.

## 2 November 2026 - Arrangement alignment audit

- Audited all five practice buckets and the challenge footer at 320x568, 360x640, 390x844, 430x932 and 768x1024 in Edge and WebKit. Verified consistent text starts, icon/text separation, cream-panel clearance, row separation, footer containment and timer/Start separation.
- All 60 browser layout cases passed. Visually inspected narrow-phone bucket 5 and tall-phone challenge screenshots. Existing layout needed no further runtime edits. Added tests/ab-express-alignment.browser.cjs; screenshots are under artifacts/ab-alignment. Physical-device verification remains pending.

## 2 November 2026 - Supplied music, wrong-answer cue and generated button sound

- Copied the three explicitly requested AAC files into owned audio storage. Menu music covers UI scenes; gameplay music covers arrangement/train checking. Added 850ms gain crossfades with continuous levels during rapid reversals, first-interaction unlock, visibility/orientation pause, and wrong-answer cue at failure.
- Generated a soft UI press tone with slight non-repeating pitch variation through Web Audio; included a generated WAV for the HTML-audio fallback. Config exposes volumes and transition duration. Loading progress/cache now include all four audio assets; scoped version v14.
- Edge verified AAC decode, exactly two persistent music loops, gain ramps, UI oscillators, wrong cue and suspend/resume. This Windows WebKit build does not expose Web Audio; verified its fallback can load and reach gameplay without errors. This is not an iPhone audio test. Audible volume balance, native iPhone/Android behavior and fallback crossfade quality remain unverified.
- Syntax and five core tests passed. No unrelated soundtrack files or other game runtimes changed.

## 2 November 2026 - Taller compartments and larger content

- Corrected flattened arrangement rows with an 82px logical minimum height. Increased icons from 24px to 38px and copy from 12px to 14px with explicit cream-panel clearance. Full instructions preserved; compact screens scroll the row area while Start stays fixed.
- Updated drag targeting for scroll offsets and enabled touch scrolling over copy, with icon dragging and existing tap/keyboard reorder retained. No comparison artwork or other game changed. Scoped version v15.
- Edge and WebKit checked all 24 descriptions at 320x568, 390x844 and 430x932; none exceeded row content bounds. Captured top/bottom screenshots and visually reviewed the 390px composition. Syntax and five core tests passed. Physical-device touch/scroll behavior remains pending verification.

## 2 November 2026 - All-page visual and responsive review

- Reviewed supplied page 1-17 references alongside current landing, five demos, Home, practice, three learning pages, all five arrangement/comparison buckets, challenge, train, success, failure, streak and reward captures.
- Edge and WebKit each passed the 161-case responsive audit (23 screens at seven viewport sizes). Complete Edge flow passed onboarding, reorder, interrupted train, success, challenge failure/reset, five-round reward and responsive checks. These boundary checks supplement visual review; they do not prove physical-device performance.
- Found undersized challenge/reward primary actions caused by transparent image margins. Cropped those margins in CSS and enlarged Play/Play Again while preserving Home below. Verified shared layout clearance at five sizes and inspected the settled challenge screenshot. Scoped version v16; syntax and five core tests passed.
- Comparison remains small-text at narrow widths because its approved fixed eight-row/two-column artwork is preserved. Learning text is baked into supplied assets. Physical iPhone/Android touch, audio and animation review remains pending; no claim of perfect device verification.

## 2 November 2026 - Audible buttons, rearrangement motion and correct cues

- Strengthened button tone volume/timbre and extended its envelope. Added generated rearrangement whoosh with rate limiting and 240ms eased row movement that continues from current visual positions. Drag targets now use stable layout positions to avoid animation-related jitter.
- Imported the requested Correct 1 and Correct 2 files into owned audio storage. Entry cue plays once at train motion start with louder .95 gain; each correct compartment plays its own .7 cue. Scoped preload/cache manifest includes the new assets; version v17.
- Edge and WebKit browser regression checks passed: reordered rows animate then settle, whoosh triggers, one entry cue precedes eight correct cues for a solved bucket. Syntax and five core tests passed. WebKit uses the previously documented HTML-audio fallback. Physical iPhone/Android listening, speaker balance and animation review remain pending.

## 2 November 2026 - Themed sounds, all-visible rows and imported crash

- Replaced the sharp UI tone with a generated harmonic magical chime, preserving subtle pitch variation. Replaced the airy whoosh asset with a short bell-like placement cue at .16 gain; smooth rearrangement remains.
- Removed arrangement scrolling/minimum row height. All eight rows fit the available portrait area, with bounded icon/text scaling, full instructions, and restored whole-row touch dragging. Added cream-panel border clearance.
- Copied My Carz's active explosion MP3 and eight PNG frames into AB Express assets; source game files untouched. Replaced procedural fireball and repeated train oscillation with the imported 2.2-second explosion, synchronized sound, brief jolt, failed-carriage breakaway and staggered trailing-car separation. Separated cars stay separated through feedback rather than snapping back.
- Edge/WebKit checks passed for all 24 descriptions at three phone sizes with no scroll, crash phases/continuation, and reorder/entry/correct cue counts. Inspected compact/tall phone and explosion screenshots. Audio decode/playback regression, syntax and five core tests passed. Last 4px/6px inset adjustment rechecked in Edge. Physical phone listening and touch/performance checks remain pending; no claim of audible/theme perfection from automated tests.
- Updated required media manifest and scoped version v18; only AB Express runtime/assets/docs/tests changed. Temporary test server stopped after validation.

## 2 November 2026 - Small-phone comparison readability

- Added comparison-only concise labels for all 24 actions. Increased type from 9px to 11.5px semibold with intentional two-line wrapping and high contrast; full canonical instructions preserved elsewhere and in accessible labels/tooltips.
- Added small cross markers and dark-red copy to misplaced submitted steps. Original page-14 artwork, all eight pairs, footer and no-scroll presentation retained.
- Edge and WebKit verified all 24 labels fit at 320x568, 390x844, 430x932 and 768x1024. Visually reviewed the 320px screenshot; corrected a source-encoding issue in the cross marker using a CSS Unicode escape. Syntax and five core tests passed. Physical-phone review remains pending. Scoped version v19.

## 2 November 2026 - Challenge concise labels and urgent timer

- Applied concise labels to challenge arrangement with 14px bold text; full wording retained accessibly. Added a gold countdown badge beside Start with tabular digits and time strip. Eight rows stay visible.
- Final 10 seconds use red pulsing and one generated tick per second; final five use half-second pulses/ticks. Shared round clock prevents background ticking or queued bursts. Scene changes stop tick sources.
- Edge and WebKit passed focused checks for label application, footer bounds at three phone sizes, urgency thresholds, faster final ticks, pause/resume and submission stop. Final 14px text enlargement rechecked in Edge. Inspected 320px urgent-timer screenshot. Syntax and five core tests passed. Physical-phone sound balance/animation performance remain unverified.
- Added timer-tick.wav to loading/cache manifest; scoped version v20. Temporary test server stopped after checks.

## 2 November 2026 - Challenge introduction animation

- Animated the baked page-15 artwork through aligned clipped sections: title, instructions, scenery, star and clock reveal in sequence without moving rectangular background cutouts. Added gentle title/star luminance cycles, a breathing star halo and four twinkling accents.
- Added staggered tunnel entrance wrappers while preserving current/completed/gained tunnel effects. Timer-copy reveal stays synchronized with its artwork. Play and Home remain stable; existing post-round Play gate is unchanged.
- Edge and WebKit passed staged-element, ongoing effect, hidden-page pause/resume, viewport containment and Play navigation tests, including reduced-motion preference without suppressing approved effects. Visually inspected the settled phone screenshot. Physical iPhone/Android performance remains unverified. Scoped version v21.

## 2 November 2026 - Restore exact client instructions

- Restored config.steps verbatim in challenge and comparison; removed comparisonLabels entirely. Full content remains visible rather than replaced by abbreviations. Practice copy unchanged.
- Added an explicit immutable-client-copy rule to AGENTS and game rules. This supersedes previous concise-label decisions. Comparison adjusts typography to contain full instructions; challenge retains timer, urgency and eight-row presentation. Scoped version v22.
- Edge checks passed for comparison full-text fitting at four sizes and challenge content/timer/pause/submission behavior. Syntax and five core tests passed. Physical-device review remains pending.

## 2 November 2026 - Sequential practice without bucket selection

- Removed the practice picker and its unused CSS. Practice starts at bucket 1; successful Next opens the next bucket directly through bucket 5, then returns Home. Wrong attempts preserve the current bucket through comparison/retry. New practice starts at 1; challenge flow untouched.
- Updated browser helpers/tests that previously clicked bucket choices. New regression exercises all five buckets, retries at buckets 1 and 3, completion and new-session restart. Test-only timings are accelerated; production feedback/animation holds are unchanged.
- Edge and WebKit practice regressions and five core tests passed. Scoped runtime/cache v23. Physical-device review remains pending.

## 2 November 2026 - Consistent bottom controls

- Replaced per-page button placement with a shared footer: even horizontal spacing for navigation; stacked primary/Home on intro and reward pages; weighted Play Again/Home on comparison; aligned timer/Start on challenge arrangement. Single continuation controls are centred.
- Normalized transparent asset margins using alpha crop bounds and proportionate visible-art sizing. Buttons refit on viewport changes; no artwork distortion or client-copy changes. Existing actions and feedback gates preserved.
- Edge and WebKit each passed the 161-case page/viewport audit. Reviewed learning, practice and comparison phone screenshots; dedicated challenge timer/urgency regression passed. Syntax and five core tests passed. Physical-device touch/visual review remains pending. Scoped cache/version v24.

## 4 November 2026 - Shared pool replaces fixed buckets

- Applied the user-approved 17-step wording. Every round draws eight unique steps: exactly one of the first three, plus seven of the remaining fourteen. Kept original matching icon assets via explicit icon mapping.
- Practice retains five rounds, same-selection retries and Next advancement. Challenge retains timer, failure reset, five-success reward and saved streaks. Persist complete sampled selections; migrate old numbered-bucket saves without losing completed streaks/stars/demo completion. Distinct selections within each run; failed challenge selection excluded from its replacement run.
- Updated regression tests and current rules/details. Scoped version v25. Regenerated asset byte manifest to match four already-modified user images; did not modify those images.
- Syntax and five core tests passed, including 1,000 sample draws, selection invariants, fixed-RNG termination, validation and persistence. Edge and WebKit passed five-round practice/retry flow; Edge passed countdown, timeout, reset, pause and submission regression. Physical iPhone/Android testing remains pending. Learning artwork unchanged by this runtime update.

## 4 November 2026 - Refresh replaced backgrounds on returning devices

- Media URLs now include the scoped release version, preventing an older unversioned page-2 background from being reused by browser, game or parent-site caches. Scoped service worker uses network-first HTML navigation with cached offline fallback. Gallery launch includes the release query to bypass older cached HTML immediately. Artwork unchanged.
- Bumped config, HTML URLs and scoped cache to v26. Added a browser regression that seeds stale unversioned image data, verifies the current background SHA-256, poisons cached HTML to test online refresh, and checks offline demo replay. Edge passed including offline replay; WebKit passed image/shell checks but its desktop runner returned an internal error on offline navigation, which remains unverified there. Syntax and five core tests passed. Physical devices remain unverified.
