# Solvent Master — progress

## Current status

The approved full practice/challenge flow is implemented, including lesson videos, mixing, results, three-round streaks, saved completed checkpoints and replay. Supplied neutral/happy/sad GIF faces are integrated, temporary demo slides remain approved and Rocketier unlocking is deferred. Read [rules](solvent-master-game-rules.md) and [current details](solvent-master-game-details.md) before work.

## 29 October 2026 — Wider proportional shelf beakers and readable percentages

- Authorization: user requested wide shelf beakers for mobile percentage readability after diagnosis of grid-cell image distortion.
- Added render-only artwork framing that excludes unused outer image margins and fits the visible beaker proportionally within each shelf cell. ResizeObserver responds to viewport/layout changes. Liquid, original artwork label and percentage text share the same frame; percentage font increased from 1.05cqw to a bounded 1.45cqw. Original image bytes and four-by-two shelf arrangement are unchanged.
- Flying clone inherits the proportional frame. Measured pouring-mouth geometry now includes the artwork frame offset so the stream remains connected. Main-vessel effects, timing, input/rules, Undo and audio are unchanged.
- CSS v10 / play v5 / scoped shell v10 synchronized in HTML/worker. Manifest unchanged.
- Validation: desktop/phone liquid tests pass monotonic transfer, surface contact, time exclusion and Undo; viewport/pour regression passes ultrawide and phone sizes without page errors. Reviewed 844x390 shelf readability screenshot and 667x375 framing. Added ratio/text-containment checks to viewport regression. Syntax and whitespace checks pass. Physical-device/Safari checks remain pending.
- Evidence: artifacts/solvent-master-liquid/ and artifacts/solvent-master-viewport/.

## 29 October 2026 — Challenge introduction artwork and attention

- Authorization: user requested unstretched individual elements on the challenge introduction, looping star rotation, pulsing Ready for the Challenge heading and corrected clock text placement.
- Heading now uses a proportional render-crop of supplied transparent artwork, with a 2.4s gentle 1–1.035 scale pulse. Clock panel preserves its native ratio, sizes against both viewport dimensions and centers its two lines within the artwork's right-hand text area. Star preserves its native ratio and rotates continuously over 8s; its size leaves clearance from Play at every rotation angle. Play keeps its supplied ratio, centered placement and hover/press motion.
- Only challenge-introduction foreground layout/attention changed. Background artwork and its baked wording, other screens, gameplay, screen-transition timings, audio and pause behavior remain unchanged. Existing background pause mechanism also freezes/resumes the new CSS animations. No motion suppression was added.
- CSS v9 / play v4 / scoped shell v9 synchronized in HTML and worker. No asset/manifest changes.
- Validation: Edge checks artwork ratios, clock-text bounds, infinite rotation/pulse and star/Play clearance at 1280x720, 1920x900, 2560x1080, 844x390 and 667x375 with reduced-motion preference enabled; no page errors. Reviewed desktop and compact-landscape screenshots. Existing presentation regression passes. Syntax and whitespace checks pass. Physical-device/Safari verification remains pending.
- Evidence: artifacts/solvent-master-challenge/verification.json and screenshots.

## 29 October 2026 — Matching liquid in shelf beakers

- Authorization: user approved the revised main-vessel liquid and requested the same treatment in shelf beakers.
- Added matching translucent side highlights, fine rising bubbles and gently moving elliptical surfaces to each shelf liquid. A glass-interior clipping wrapper keeps fluid inside the artwork and excludes its supplied label so percentages remain on the original white label. The flying clone inherits the treatment and continues its existing drain animation; used selections hide liquid and Undo restores it.
- No artwork, rack values, labels, gameplay rules, timing, audio or main-vessel effects changed. CSS v8 / play v3 / scoped shell v8 synchronized in HTML and worker; manifest unchanged.
- Validation: desktop 1280x720 and phone landscape 844x390 liquid regressions pass monotonic source drain/destination fill, stream contact, timer exclusion and Undo with no page errors. Reviewed shelf and main-vessel screenshot together. Syntax/whitespace checks pass. Physical-device/Safari and audible audio checks remain pending.
- Evidence: refreshed artifacts/solvent-master-liquid/ screenshots and verification.json.

## 29 October 2026 — Liquid Sort and Rocketier reference liquid

- Authorization: user was dissatisfied with liquid and requested using Liquid Sort and Rocketier as references for pour/fill animation. Read both implementations; reference code/media remain untouched and runtime remains isolated.
- Replaced the single changing gradient with separately measured pour layers inside the glass. Added translucent side highlights, fine rising bubbles, elliptical meniscus, moving impact rings and damped settling. Undo drains the actual last layer continuously.
- Fly-to-pour endpoint now derives from measured vessel bounds and the source artwork's rotated right lip, following Liquid Sort's mouth/impact geometry. Stream highlights flow downward; its lower endpoint follows the rising surface every frame, following Rocketier's continuous inlet technique. Source drain and destination growth are coordinated, including a short stream-arrival interval. The percentage display counts the visually arrived amount.
- Preserved 1500ms total pour (450ms approach, 225ms tilt, 525ms transfer, 300ms return/settle), 550ms Undo, rules, answer-time exclusion, input gating, landing layout, labels and audio cue ownership. Frame-driven transfer freezes when backgrounded; native animation pause handling remains intact. No reduced-motion suppression introduced.
- Versions: CSS v7, presentation/play v2, scoped shell v7 synchronized in HTML/worker. Other module/media versions unchanged; no asset changes.
- Validation: Edge presentation regression passes full pouring with reduced-motion preferences, timer exclusion, save retry, audio hooks and outcomes. Dedicated liquid regression frame-samples monotonic source drain/destination rise, stream endpoint contact, glass containment, timer exclusion and Undo at desktop and phone landscape. Reviewed pour/filled screenshots. Core and syntax checks pass; whitespace checks pass. Evidence: artifacts/solvent-master-liquid/ and refreshed artifacts/solvent-master-presentation/.
- Limits: physical phone/Safari performance and audible audio mix remain unverified. Happy/sad frames remain pending user images.

## 29 October 2026 — Use the shelf beaker's supplied label

- Authorization: user requested removing the extra label because the shelf beaker artwork already contains a label.
- Removed the generated percentage span's white background and sized/centered its text within the artwork's existing white label. The percentage remains dynamic; no extra label panel is drawn. The pouring clone inherits the same alignment. Artwork, selections, rules, liquid effects, timings and audio remain unchanged.
- CSS v6 / scoped shell v6 synchronized in HTML and worker. No manifest change.
- Validation: Edge viewport/pour regression passes without page errors. Reviewed the 667x375 shelf screenshot; percentage text uses each supplied label. Worker syntax and diff checks pass. Physical-device verification remains pending.
- Evidence: artifacts/solvent-master-viewport/shelf-labels-667x375.png and refreshed pour screenshot/report.

## 29 October 2026 — Landing artwork without distortion

- Authorization: user requested removing image stretching for the landing page alone.
- Scoped #landing-art to object-fit: cover with centered horizontal / 10% vertical positioning. Artwork scales uniformly to cover the landscape viewport; excess background edges crop instead of stretching. Reviewed title and three beakers remain visible at checked sizes. Loading/Next retains its existing safe viewport area and undistorted button art. Other screens, animations, audio, loading behavior and source media are unchanged.
- CSS v5 and dedicated shell v5 synchronized in HTML/worker. No media manifest change.
- Validation: Edge landing loading/retry/offline regression passes eight viewport sizes (2560x1080 through phone landscape and portrait preview), including cover fit and visible Next bounds; no page errors. Reviewed ultrawide and 1024x768 screenshots. Worker syntax and whitespace checks pass. Physical-device/Safari verification remains pending.
- Evidence: refreshed artifacts/solvent-master-landing/ screenshots and verification.json.

## 29 October 2026 — Fill the landscape viewport

- Authorization: after diagnosis of side gaps from the fixed 16:9 stage, the user approved filling the landscape viewport with artwork and controls aligned together.
- CSS now fills available landscape width and dynamic viewport height. Existing percentage positions share the expanded stage; supplied backgrounds stretch without cropping. Portrait retains its existing fitted preview. Landing Next is contained within its action area using an explicit bounded grid row; mixing buttons now use stage-relative dimensions while retaining transparent-margin crops.
- No runtime rules, motion timings, sequencing, audio or source artwork changed. CSS v4 and dedicated shell v4 synchronized in HTML/worker; other runtime/media versions remain unchanged.
- Validation: Edge landing loading/retry/offline regression passes eight viewports including 2560x1080 and 1920x900. Targeted full-width checks pass mixing controls at 2560x1080, 1920x900, 1024x768, 844x390 and 667x375; ultrawide gameplay controls and actual pour stream remain inside the vessel. No page errors. Reviewed wide mixing and ultrawide pouring screenshots. Syntax and diff checks pass.
- Evidence: artifacts/solvent-master-viewport/verification.json and screenshots; refreshed artifacts/solvent-master-landing/. Physical-device and Safari/iPhone checks remain pending.

## 29 October 2026 — Approved complete practice and challenge flow

- Authorization: after reviewing the original Game Flow DOCX, answering clarification questions and reviewing the complete summarized flow, the user explicitly said proceed. Added the original DOCX unchanged under docs/ and recorded approved clarifications in details. Rocketier access remains unchanged as requested.
- Added isolated core rules, local store, practice/challenge presentation and synthesized audio modules; extended existing flow/config/layout. Copied all five Rocketier WebM lessons byte-for-byte into Solvent Master lesson-videos. No other game's runtime/media was modified.
- Practice uses fixed recipe order, a lesson before each mix, exact percentage validation, wrong-answer video/retry and explicit Next after correct feedback. Five successes commit practice completion before mastery. Returning players then enter challenge introduction.
- Racks expose eight unique values each, one exact positive match and no alternative subset yielding the target; each selection is single-use per question. Total is capped at 100%; Undo restores only the last pour. Shelves refresh per question/retry. Mixing animates actual shelf position to vessel, tilt, stream and return; source drains and destination rises continuously with surface motion. Liquid is contained inside supplied glass bounds.
- Challenges shuffle all five once and share 60 seconds of active input time only. Wrong feedback records and continues. Timeout immediately records unanswered entries and produces five-row results. Lesson review returns to unchanged results. Perfect rounds increment streak, any wrong/timeout resets streak, three perfect rounds award a star. Retry/Next Challenge/Play Again preserve practice and earned stars; Play Again resets the completed streak for a fresh attempt.
- Local schema-1 checkpoints retain completed practice/rounds, streak and stars without a daily reset. Partial interrupted attempts restart from the last completed checkpoint. Invalid saved data is reported and retained; failed saves block handoff with Retry saving rather than losing the checkpoint silently.
- Timings: preserve existing landing/demo/screen timings. New pour 1500ms (450 travel, 225 tilt, 525 transfer, 300 return), Undo 550ms, feedback entrance 700ms, streak entrance 900ms, final star 1100ms. Input locks through sequencing; backgrounding freezes timer/native effects/video/audio. No near-zero-duration or reduced-motion suppression was added. Happy/sad frame mappings remain empty for the forthcoming user images.
- Audio: configurable local Web Audio motif and click/popup/result/streak/win/timer/liquid cues, gesture unlock, lesson music fade and background suspension. Liquid sound follows visible transfer. Audible mix/final asset preference requires physical review; no external soundtrack dependency.
- Reference review: removed accidental duplicate overlays over baked background wording; retained supplied wording once, added neutral completion beaker, sized challenge text inside its panel and aligned streak connectors behind glass. Original media bytes are unchanged.
- Versions: CSS/config/manifest v3, screen flow v2; loader/core/store/play/audio v1; scoped shell v3 and media cache v1. Manifest regenerated: 57 production entries, 23,653,542 bytes, including owned videos and only the four explicitly approved demo reference images. Dedicated worker serves cached video byte ranges.
- Validation: five core tests pass, including exhaustive subset checks for every rack target. Edge full gameplay test passes wrong practice retry, all five practices, Undo, wrong challenge continuation, timer/background pauses, timeout results, results-video return, three consecutive perfect rounds, star award, Play Again, reopening skip and offline gameplay/video ranges; no page or HTTP errors. Existing demo-flow regression passes. Focused presentation checks cover full pouring under reduced-motion settings, timer exclusion, recoverable save failure, audio hooks and outcomes 0–3. Reviewed desktop/compact screenshots including lesson, pour, filled vessel, results, challenge and streak/completion. Runtime/builder/worker syntax and whitespace checks pass.
- Evidence: artifacts/solvent-master-gameplay/, artifacts/solvent-master-presentation/ and artifacts/solvent-master-flow/ at repository root. Browser scripts are optional and use SOLVENT_PLAYWRIGHT/SOLVENT_URL; no machine-specific path is required by runtime.
- Limits: actual happy/sad expression animation cannot be verified before user media arrives. Physical phone/Safari/iPhone performance, touch feel and audible audio mix remain unverified. Browser checks are not physical-device proof. No publication or Rocketier lock changes were performed.

## 29 October 2026 — First-visit demo and Let's start mixing

- Authorization: user requested landing Next show navigable demos on first play, skip completed demos on future visits and open the supplied page-3-a introduction with Demo/Play assets. User explicitly approved four reference slides temporarily because GIFs are not yet supplied.
- Added isolated flow controller, demo viewer, previous/next/count/Finish and mixing introduction. Only Finish records browser-local completion. Interrupted demos restart at slide one; returning players skip to mixing after landing Next. Demo replays from slide one. Play emits one integration event pending the next brief; no subsequent gameplay was invented.
- Sequencing: decode incoming assets before transition; outgoing screen 260ms then incoming 380ms, slide exits/entrances 220ms each. Guard inputs and focus controls after entrance. Preserve landing readiness, 420ms Next entrance, loading/retry and audio-free behavior. Render-crop transparent button padding to match the supplied composition; media files unchanged.
- Files: HTML/CSS/config, new flow controller, manifest builder/generated manifest, scoped worker, tests, npm browser command and tracking documents. CSS/config/manifest v2, flow/loader v1, shell v2, media cache v1. Manifest includes 52 production files / 3,269,770 bytes; only the four approved demo references are included.
- Validation: landing browser regression passes loading failure/retry, 52 cached files and offline reload. Demo-flow regression passes first visit, Previous, interrupted restart, Finish persistence, returning skip, replay, offline navigation and mixing-button bounds at 1920x1080, 1024x768, 844x390 and 667x375, with no page errors. Reviewed full-size/compact mixing and demo screenshots. Runtime/builder/worker/flow syntax and diff checks pass. Screenshots/reports are in `artifacts/solvent-master-flow/` and `artifacts/solvent-master-landing/`.
- Limits: GIF animation awaits supplied GIFs. Physical-device performance and Safari/iPhone behavior remain unverified; no audio added.

## 29 October 2026 — Page 1 landscape landing and asset loading

- Authorization: user requested page 1 using the supplied reference/background/Next artwork, with a loading bar in place of Next until all assets load, following the recorded rules. This supersedes the development hold for page 1 only.
- Implemented isolated entry HTML, CSS, configuration, loader, manifest builder/generated manifest and dedicated worker. The 16:9 stage fits without clipping/cropping; the reference's lower-right action area hosts loading then Next. Existing Games card now links here and remains last. Added scoped npm commands and startup manifest generation.
- Loading covers all 48 supplied production media files (2,864,938 bytes), excludes reference/old artwork, streams real byte progress, checks sizes and SHA-256 revisions, reuses verified cached files, bounds concurrency, retries failed downloads and exposes Retry after persistent failure. Readiness also requires scoped worker control and successful landing/button image decoding.
- Next remains hidden and disabled during loading. Its 420ms opacity/translate/scale entrance follows readiness. No gameplay timer or audio is introduced. Repeated Next clicks emit only one guarded integration event; page-2 navigation awaits the brief and currently stays on page 1.
- Versions: all new runtime URLs v1, dedicated solvent-master-shell-v1 and solvent-master-media-v1. Root shell v462 refreshes the linked gallery card. No Rocketier/My Carz runtime or media edits.
- Validation: runtime/builder/worker syntax and diff checks pass. Headless Edge verifies failed required download keeps Next locked, Retry succeeds, all 48 media entries are cached without reference files, duplicate Next protection, offline reload and six viewport bounds (1920x1080, 1366x768, 1024x768, 844x390, 667x375, 393x852). No page errors. Reviewed desktop, compact landscape and retry screenshots against the supplied composition. Evidence: `artifacts/solvent-master-landing/verification.json` and screenshots at repository root.
- Limits: physical-device performance and Safari/iPhone behavior remain unverified. No audio exists for this page. Later screens, portrait guidance and their choreography remain pending.

## 29 October 2026 — Organized rules and planning documents

- Authorization: user requested saving the reviewed animation/configuration expectations as game rules and organizing documents for easy future reference.
- Added a README document index, contributor entry instructions, game rules, current details and this progress log under `assets/solvent-master-game-scripts/`.
- Recorded landscape-only orientation, Rocketier question reuse, script/media isolation and the development hold. Separated confirmed requirements from pending game-brief decisions.
- Preserved the reviewed animation principles, configuration boundaries, reference lessons and verification requirements. Example timings are explicitly reference-only.
- Validation: checked document links, required planning content and whitespace. No game runtime, animation, audio, media or cache behavior changed. No browser/device verification was needed for this documentation-only change.

## Prior preparation recorded on 29 October 2026

- User requested the Solvent Master card last on the Games page. `index.html` contains a Coming soon card using supplied page-1 artwork; root worker shell was bumped from v460 to v461.
- Prior reported checks: worker syntax and diff checks passed. Browser appearance was not verified.
- User subsequently specified landscape-only orientation, the same questions as Rocketier, isolated scripts/assets, and no development yet.
- Read-only review covered Rocketier/My Carz documentation, configuration and selected animation controllers. No new audiovisual checks were performed during that review.

## Future entry format

- Date, concrete request and authorized scope.
- Resulting behavior and affected files.
- Animation stages, ordering, durations, input gating and audio synchronization affected.
- Cache/runtime/manifest versions affected, or documentation-only status.
- Checks and results, distinguishing source, browser and physical-device verification.
- Remaining issues and decisions awaiting the user.

## 29 October 2026 - Percentage-based shelf fill

- Authorization: user requested shelf beaker fill levels matching their amount percentages.
- Mapped each percentage to the full usable glass interior (71% of artwork height), removing the previous minimum fill floor and undersized capacity. Labels, artwork proportions, liquid effects, 1500ms pour, Undo and audio remain unchanged.
- Updated play v6, CSS v11 and scoped shell v11 consistently in HTML and worker; media manifest unchanged.
- Validation: Edge checks all 24 shelf fill ratios at 1280x720 and 844x390, with passing source drain, destination fill, stream contact, timer exclusion and Undo. Reviewed phone-landscape screenshot. Syntax and whitespace checks pass. Physical-device and audible audio verification remain pending.

## 29 October 2026 - Challenge gameplay timer artwork

- Authorization: use page-5/timer.webp following page-5-reference.webp. Replaced the plain countdown pill with proportional supplied artwork at the upper right, an orange remaining-time bar and centered MM:SS digits. Moved the challenge mix counter toward the header center to avoid overlap; practice layout remains unchanged.
- Countdown and bar use the existing active-mixing clock, including its pour/background/feedback pauses. No gameplay, animation duration or audio changes.
- CSS v12, play v7 and scoped shell v12 synchronized. Timer media already exists in the verified manifest; source media unchanged.
- Validation: syntax checks and desktop/mobile-landscape Edge liquid regression pass, including timer exclusion during pouring. Reviewed 844x390 screenshot for timer placement and readability. Physical-device verification remains pending.

## 29 October 2026 - Remove challenge mix counter

- Authorization: remove Mix 1/5 because it is absent from the reference. Challenge gameplay now hides and clears the counter; practice retains its existing progress display. Removed the obsolete challenge counter positioning rule. Timer, gameplay, animations and audio unchanged.
- CSS v13, play v8 and scoped shell v13 synchronized. Media manifest unchanged.
- Validation: runtime syntax and whitespace checks pass. This narrow visibility change was not separately browser/device verified.

## 29 October 2026 - Supplied GIF faces and reference result composition

- Authorization: import the specified neutral/happy/sad GIFs and match the supplied correct/wrong references without unwanted elements. Copied original GIF bytes into game-owned beaker-faces; replaced unused frame-array placeholders with gameplay.faces mappings.
- Neutral face overlays the liquid during mixing. Submission switches to happy for an exact 100% correct recipe or sad for wrong answers. Preserved original GIF animation cadence and transparency.
- Replaced centered dimmed modal and duplicate text with the supplied left speech bubble and right artwork action. Correct uses Next; wrong practice uses Watch Video; wrong challenge retains Next under the approved flow. Mixing controls/total hide, selected empty beakers remain without labels, and practice header uses supplied artwork. No timer, scoring, pour, audio or 700ms feedback-entrance timing changes.
- CSS v14, play v9, config/manifest v4 and shell v14 synchronized. Regenerated manifest: 60 media entries, 23,880,578 bytes. Reference images remain excluded.
- Validation: desktop 1280x720 and phone-landscape 844x390 Edge tests exercise neutral face, wrong submission/sad/retry, actual pours to 100%, happy/Next and next lesson; no page errors. Reviewed screenshots for both results. Runtime syntax checks pass. Physical-device smoothness/audio remain unverified; native GIF frame playback is browser-owned and not explicitly paused by the game's CSS-animation pause mechanism.

## 29 October 2026 - Empty shelves during feedback

- Authorization: user requested removing the background beakers behind the result bubble. All shelf beakers now hide during both correct and wrong feedback, including used selections; normal mixing restores their existing visibility. Main vessel, faces, feedback, timing and audio unchanged.
- CSS v15 and shell v15 synchronized in HTML/worker. Media unchanged.
- Validation: whitespace and worker syntax checks pass. Narrow visibility change not separately browser/device verified.

## 29 October 2026 - Plausible 100% distractor combinations

- Authorization: user identified that the shelf values reveal the 80/20 answer and requested more misleading options. Replaced narrow sequential distractors with nearby five-point choices, including values around the correct amount. Multiple incorrect cross-solvent combinations now reach 100% for every recipe.
- Preserved one exact beaker per positive target, unique shelf values, no alternative same-solvent subset reaching its target, single use, 100% cap and exact-ratio scoring. No animation, audio or presentation changes.
- Core v2 and scoped shell v16 synchronized in HTML/worker; media unchanged.
- Validation: all six core tests pass, including exhaustive same-solvent subsets and at least three incorrect 100% combinations per recipe. Syntax and whitespace checks pass. No browser/device visual check for this numerical generation change.

## 29 October 2026 - Results question names only

- Authorization: remove the unanswered suffix from result rows. Rows now display only the question name; outcome icons, video buttons and timeout scoring/data remain unchanged. No animation or audio changes.
- Play v10 and scoped shell v17 synchronized in HTML/worker.
- Validation: JavaScript syntax and whitespace checks pass. Text-only change not separately browser verified.

## 29 October 2026 - Larger result question names

- Authorization: enlarge result question text to match the neighboring icons/buttons. Increased responsive font size from 1.3cqw to 1.65cqw with compact line spacing and flexible wrapping for longer names. Icons, buttons and row placement unchanged. No animation/audio changes.
- CSS v16 and shell v18 synchronized in HTML/worker.
- Validation: whitespace and worker syntax checks pass; browser/device visual verification pending.

## 29 October 2026 - Sequenced perfect-round celebration

- Authorization: user approved water fill, happy jumping celebration, initially colorless connecting pipes and activation only on pipe arrival. Other beakers remain visually disabled with neutral GIFs. Implemented for both first and second streak wins.
- Added title glow/pulse, clipped blue water with highlights/bubbles, happy GIF on fill completion, celebratory jumps/sparkles, left-to-right pipe fill and a persistent attention pulse on the next empty neutral beaker. Used existing background numbers without duplicate labels. No changes to lost-streak or final-star presentation.
- Sequence after existing 900ms entrance: fill 1400ms, dance 1600ms, pipe 1300ms, activation 1100ms. Config owns timings. Liquid sound accompanies fill; streak cues mark celebration/activation. Next Challenge stays disabled through the handoff; game timer remains inactive. Existing native/frame pause mechanisms remain in use; native GIF playback is browser-owned.
- CSS v17, play v11, config v5 and shell v19 synchronized. Media bytes/manifest unchanged.
- Validation: Edge presentation regression covers outcomes 0-3, full pour, timer exclusion and save retry with no page errors; reviewed streak screenshot and corrected duplicate labels. Additional sequence assertions verify stage order, locked counts, neutral empty next beaker and Next gating. Syntax/whitespace checks pass. Physical-device smoothness and audible mix remain unverified.

## 29 October 2026 - Gameplay correct celebration and feedback focus

- Authorization: add jumps/celebration for correct gameplay answers and dim the background for happy or sad feedback. Added a 350ms native fade scrim below the beaker/result, with 1600ms correct-only jumping/tilting and sparkles. Glass, face and liquid move together; Next remains disabled until the motion finishes. Existing 700ms feedback entrance runs concurrently, and wrong answers do not jump. Existing result cues and pause handling retained.
- CSS v18, play v12, config v6 and shell v20 synchronized; no media changes.
- Validation: runtime syntax/whitespace checks; Edge face/result regressions at desktop and phone landscape. Physical-device animation/audio not verified.

## 29 October 2026 - Balanced perfect-round layout

- Authorization: improve placement and presentation of the remaining-round message, streak badge and connected beakers. Scoped layout to successful streak 1/2: centered title with top clearance, responsive message typography, a compact softly shaded badge, more space before the beakers and shorter pipes aligned behind glass.
- Preserved all celebration stages, timings, pulse strength, input gating and audio. Lost/final outcomes unchanged. CSS v19 and shell v21 synchronized; media unchanged.
- Validation: Edge presentation/sequence regression and screenshot review; whitespace/worker syntax checks. Physical-device layout and audio remain unverified.

## 29 October 2026 - Prevent streak beakers appearing before entrance

- Authorization: user reported three beakers visible before their entrance plays. Outcome setup now holds the group at zero opacity through image decoding/page transition, then performs the existing 900ms entrance once and restores normal opacity. Applies to lost and perfect streaks. No duration, choreography, effects or audio changes.
- Play v13 and shell v22 synchronized.
- Validation: syntax/whitespace checks and Edge outcome/sequence regression. Physical-device verification remains pending.

## 29 October 2026 - Practice mastery happy face and individual attention

- Authorization: add happy face and animate individual elements on the five-solvents mastery page. Added supplied happy GIF aligned over the baked beaker, soft beaker/message glow and sparkles. Congratulations enters over 700ms, mastery badge over 650ms, face over 500ms, then Next over 420ms; Next locks until complete. Title continues pulsing and badge floats gently. Existing baked message/beaker remain aligned with the reference; they receive focus effects rather than independent travel.
- Existing native pause handling applies to new CSS/entrance motion; happy GIF playback is browser-owned. Win cue marks mastery entrance. Other screens unchanged. CSS v20, play v14 and shell v23 synchronized; media unchanged.
- Validation: focused Edge mastery test at 1280x720 and 844x390 checks happy face, entrance completion and Next to challenge; screenshot review. Syntax/whitespace checks. Physical-device smoothness/audio unverified.

## 29 October 2026 - Final star celebration and mobile-engine checks

- Authorization: celebrate individual final-page elements, happy beaker, animated background star rays, and check mobile animation clipping/compatibility. Added staged congratulations/star/rays/beaker-face/button entrances, rotating golden rays, floating star, pulsing title, happy beaker bob and focus halos for baked message/rocket. Play Again locks through the sequence. Existing star settle stays 1100ms. The locked rocket remains locked; no integration changes.
- Fixed final title top-edge pulse clipping found during phone-size checks. Newly created native entrance animations now pause immediately if the page is already hidden; existing resume ownership retained. No reduced-motion effects suppression added.
- CSS v21, play v15 and shell v24 synchronized; media unchanged.
- Validation: Chromium and Windows WebKit final-page checks at 844x390, 667x375 and 1280x720 pass happy face, visible element bounds, active ray animation and button handoff with no page errors. Reviewed screenshot. Broader WebKit presentation regression covers pouring, timer exclusion, save retry and outcome sequences. Runtime syntax/whitespace checks pass. Physical iPhone/Android hardware, audible mix, older-browser support and exhaustive all-device behavior remain unverified.

## 29 October 2026 - Supplied menu/game music, countdown warning and Rocketier pour

- Authorization: use supplied AAC menu/game tracks and last-10-seconds sound, red/pulsing final countdown bar, smooth music transitions and Rocketier liquid audio. Copied only these requested tracks into game-owned audio assets; Rocketier source remains untouched.
- Replaced procedural music with two decoded looping tracks and configurable 1.2s crossfades. Lessons fade music down. Warning follows active challenge mixing, pauses during pours/feedback, resumes at the remaining-time offset and stops at timeout/menu. Replaced synthesized liquid noise with owned Liquid Flowing.mp3 synchronized to transfer/fill. Other sound cues remain.
- Added red urgent timer bar and pulsing track/digits at ten seconds. Backgrounding suspends the shared Web Audio context. Gesture unlock retained; no autoplay assumption.
- CSS v22, play v16, config v7, audio v2, manifest v5 and shell v25 synchronized. Regenerated manifest: 64 files, 24,895,716 bytes.
- Validation: runtime syntax/whitespace checks and focused Chromium audio tests pass decoding, crossfade gain envelopes, warning/pour pause-resume and stopping on results. Windows WebKit lacks AudioContext entirely, confirmed by constructor probe, so its audio test is explicitly skipped. Temporary WAV fallback experiment was removed after identifying the runtime limitation; actual Safari audio needs Apple-device verification. Headless checks establish state/timing, not audible mix or physical iPhone/Android audio behavior.

## 29 October 2026 - Menu click, congratulations music and streak-loss shatter

- Authorization: use the three named AAC recordings for menu clicks, successful-round streak BGM and streak-loss broken-glass sound. Copied them into game-owned audio assets and added configurable mappings/volumes.
- Menu clicks replace their generated cue; gameplay/lesson click behavior stays intact. Successful streak outcomes use the celebration track with existing 1.2s crossfade; track restarts on each celebration entry. Streak Lose plays once at the broken-beaker entrance, replacing the generic wrong cue there. One-shot ownership prevents stacking; shared context pause/resume remains in use.
- Config v8, audio v3, play v17, manifest v6 and shell v26 synchronized. Manifest: 67 files, 25,111,635 bytes.
- Validation: syntax/whitespace checks; focused Chromium audio flow checks decoding all seven tracks, menu click mapping, celebration gain envelope and loss shatter dispatch in addition to timer/pour/music regression. Audible balance and physical iPhone/Android behavior remain unverified; Windows WebKit lacks AudioContext.

## 29 October 2026 - Final star ray clearance and remove rocket halo

- Authorization: prevent star effect overlapping completion text, use Congratulation BGM on this page, and remove the round shape behind rocket. Removed the added rocket-focus halo entirely. Centered a smaller circular ray field below the message, contained rotating beams within its bounds and lowered the star to align with it. Rays remain fully animated.
- Confirmed successful final outcome already selects the supplied audio/congratulation-bgm.aac through the celebration music crossfade. No audio change needed.
- CSS v23, play v18 and shell v27 synchronized.
- Validation: Chromium final-page checks at phone/desktop sizes include ray/message clearance, active beam animation and absent rocket halo; screenshot review. Syntax/whitespace checks. Physical-device checks remain pending.

## 29 October 2026 - Results beaker happy face

- Authorization: add happy face to the results-page beaker. Added the supplied happy GIF overlay aligned inside the baked beaker. Result rows, controls, audio and timing unchanged.
- CSS v24, play v19 and shell v28 synchronized. Media unchanged.
- Validation: syntax and whitespace checks pass. Face placement follows the supplied screenshot proportions; separate browser/device visual verification pending.

## 29 October 2026 - Filled final celebration beaker

- Authorization: fill the final completion beaker. Added blue water with glass-contained highlights/bubbles below the happy face, matching the existing full-capacity liquid geometry. Liquid shares the beaker entrance and continuous bob timing. Other page elements unchanged.
- CSS v25, play v20 and shell v29 synchronized; media unchanged.
- Validation: syntax/whitespace checks pass; existing final-page browser regression used for layout/handoff. Physical-device audiovisual verification remains pending.

## 29 October 2026 - Play Again clearance

- Authorization: fix final Play Again overlap. Moved the button into the lower 13% of the stage with 1.5% bottom inset, reduced width to 24% and contained artwork proportionally. This places its upper edge below the beaker/rocket bases. Other outcomes and animations unchanged.
- CSS v26 and shell v30 synchronized.
- Validation: whitespace/worker syntax checks; final-page phone/desktop layout regression. Physical-device verification pending.

## 29 October 2026 - Neutral face on mixing introduction

- Authorization: add neutral face to the Let's start mixing beaker. Overlaid the supplied neutral GIF inside the baked beaker. Layout, controls, timing and audio unchanged.
- CSS v27 and shell v31 synchronized. Media unchanged.
- Validation: whitespace and worker syntax checks pass. Face uses screenshot-relative alignment; physical-device/browser visual check pending.

## 29 October 2026 - Neutral face on lesson beaker

- Authorization: add neutral face to the lesson-page beaker. Added the supplied neutral GIF overlay within the baked beaker; applies to practice lessons and results lesson review. Video, controls, audio and timing unchanged.
- CSS v28, play v21 and shell v32 synchronized. Media unchanged.
- Validation: JavaScript syntax and whitespace checks pass. Screenshot-relative placement; separate browser/device visual verification pending.

## 29 October 2026 - Lesson face alignment

- Authorization: move lesson face upward and slightly inside the beaker. Shifted top from 57% to 53%, left from 22% to 20%, and narrowed width from 15% to 13% to keep cheeks inside the glass. Other screens and animation unchanged.
- CSS v29 and shell v33 synchronized.
- Validation: whitespace/worker syntax checks pass; screenshot-led coordinate correction, separate browser/device verification pending.

## 29 October 2026 - Results expression follows round accuracy

- Authorization: use sad face unless all answers are correct. Results now selects happy only when all five entries are correct; any wrong/timeout uses the supplied sad GIF. Selection is reapplied after lesson review. Scoring, layout, audio and timing unchanged.
- Play v22 and shell v34 synchronized.
- Validation: runtime syntax/whitespace checks pass. Condition uses the existing five result records; separate browser/device verification pending.

## 29 October 2026 - Sad faces on broken streak beakers

- Authorization: add sad faces to all three broken beakers. Each lost-streak vessel now contains the supplied sad GIF and travels with its existing entrance. Other outcomes, audio and animation timing unchanged.
- CSS v30, play v23 and shell v35 synchronized. Media unchanged.
- Validation: runtime syntax/whitespace checks pass; face placement uses existing streak-face proportions. Separate browser/device visual verification pending.

## 29 October 2026 - Supplied happy/sad mix voices

- Authorization: use the specified Minions AAC recordings after correct and wrong submissions. Copied originals into game-owned audio as mix-happy.aac/mix-sad.aac; mapped existing correctness events to these one-shot voices at face/feedback reveal. Opposite/previous result voices stop before a new one; leaving feedback stops residual playback. Shared background suspension applies.
- Config v9, audio v4, manifest v7 and shell v36 synchronized. Manifest: 69 files, 25,143,672 bytes.
- Validation: runtime syntax/whitespace checks; Chromium practice feedback checks at desktop and phone landscape verify all nine tracks decode and correct/wrong submissions dispatch mixHappy/mixSad with matching faces. Physical-device audible mix remains unverified.

## 29 October 2026 - Replace sad mix recording

- Authorization: replace sad-audio-1 with the supplied sad-audio.aac. Replaced the owned audio/mix-sad.aac bytes; existing volume, trigger, pause and stop behavior retained.
- Regenerated revisioned media manifest; manifest v8 and shell v37 synchronized.
- Validation: source/copy SHA-256 equality, manifest generation and whitespace checks. Audible/device review pending.

## 29 October 2026 - Mobile portrait landscape prompt

- Authorization: ask mobile portrait players to switch to landscape while leaving laptop/desktop behavior unaffected. Added isolated orientation controller and full-screen prompt, with iPhone/iPad/Android detection including iPadOS desktop-style user agents.
- Blocks input and pauses answer time, liquid interpolation, native animation, video and shared audio context. Resumes on landscape; handles hidden-tab overlap. Native GIFs remain browser-owned behind prompt.
- Orientation v1, CSS v31, play v24, audio v5 and shell v38 synchronized. Media unchanged.
- Validation: Chromium mobile user-agent test verifies portrait prompt/inert game, landscape dismissal, frozen challenge timer and resume. Desktop narrow portrait window has no prompt. Runtime syntax/whitespace checks pass. Physical-device rotation/safe-area behavior remains unverified.

## 29 October 2026 - Fullscreen entry and toggle

- Authorization: add fullscreen control/automatic entry following Working Standard. Reviewed its request/exit, landscape lock and iPhone help behavior; implemented an isolated controller with first-game-button auto request and persistent bottom-right toggle. Native unsupported/rejected manual entry shows usable fallback guidance.
- Help participates in the existing orientation/background pause mechanisms for timer, liquid, native motion, video and audio. Game input is inert until dismissal; Escape/Continue closes the dialog. No gameplay animation timings changed.
- Fullscreen v1, orientation v2, CSS v32, play v25, audio v6 and shell v39 synchronized. Media unchanged.
- Validation: Chromium browser test passes actual fullscreen entry on first tap, manual exit, simulated unavailable API fallback and inert/pause flag restoration. Runtime syntax/whitespace checks pass. Physical iPhone/Android standalone behavior remains unverified.

## 29 October 2026 - Mobile orientation detection and event fallbacks

- Authorization: investigate missing mobile portrait prompt against Working Standard. Added its legacy MediaQueryList listener fallback and resize/orientationchange handling, plus visualViewport resize/pageshow checks. Extended mobile detection to UA client hints and primary coarse/no-hover touch devices using desktop-style user agents; desktop narrow windows with mouse input remain unaffected.
- Orientation v3 and shell v40 synchronized. Pause/motion/audio behavior unchanged.
- Validation: syntax/whitespace checks and orientation browser regression including desktop-UA touch emulation. Physical user device reproduction remains pending; these address concrete detection/event gaps rather than establish the exact cause on that device.

## 29 October 2026 - Lower happy beaker voice

- Authorization: reduce the happy beaker audio because it is louder than the other game sounds. Reduced mixHappy gain from 0.60 to 0.35 (about -4.7 dB). Other audio levels and timing unchanged.
- Config v10 and shell v41 synchronized.
- Validation: config/worker syntax and whitespace checks pass. Audible balance awaits user/device review.
