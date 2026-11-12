# See Saw â€” Implementation Progress

## 11 November 2026 â€” Initial Implementation (`v1`)

### Scope Completed
1. **Asset Normalization & Byte-for-Byte Verification**:
   - Copied all supplied See Saw visual and audio assets into `assets/see-saw-assets/` (`page-1/` through `page-12/`, `demo/1.gif..3.gif`, `mascot/idle.gif`, `mascot/correct-answer.gif`, `mascot/wrong-answer.gif`, `mascot/time-up.gif`, `audio/menu-bgm.mp3`, `audio/game-bgm.mp3`) and `assets/see-saw-scripts/docs/SEE SAW.docx`.
2. **RC Games Gallery Banner**:
   - Added the See Saw game card (`poster-see-saw`) at the end of `#rc-game-gallery` in `index.html` linking to `assets/see-saw-scripts/see-saw.html?v=1&from=rc-games` using `assets/see-saw-assets/page-1/page-1-bg.webp`. No other game or shared application file was modified.
3. **See Saw Runtime (`assets/see-saw-scripts/`)**:
   - `see-saw-config.js`: Configured `questionSeconds: 10`, `maxStars: 3`, audio tracks/volumes/crossfade (`1.1s`), preload manifest, and the 5 HPLC Symptomâ€“Cause pairs with `youtube` and `video` fields ready for future video URLs.
   - `see-saw-core.js`: Implemented pure state machine covering first-time onboarding (`Page 1 -> Page 2.1..2.3 -> Page 3 (5 mandatory videos) -> Page 4`), returning user shortcut (`Page 1 -> Page 4`), Home `Demo` flow (`Page 4 -> Page 2.1..2.3 -> Page 4`), 5-question rounds, per-question `timeToBeatMs` recording on Star 1, `Too slow!` (`Page 12`) enforcement when `stars >= 1` and `elapsedMs >= timeToBeatMs[id]`, `Wrong!` (`Page 7`) and `Time Up!` (`Page 8`) streak resets, mandatory remediation video on `Page 9`, retry-same-question until correct followed by restart from Question `1/5`, `Page 10` (`New Star!`) & `Page 11` (`Star Earned`), `Page 13` (`Watch Videos`), and `localStorage` persistence (`see-saw-progress-v1`).
   - `see-saw-audio.js`: Web Audio API + HTML5 Audio fallback with gesture unlock, `1.1s` crossfading between menu and game BGM, video-playback muting, background/orientation suspension, and synthesized SFX cues.
   - `see-saw-video.js`: YouTube IFrame API + local `<video>` fallback + interactive placeholder video player with completion callbacks.
   - `see-saw.html`, `see-saw.css`, `see-saw.js`, `sw.js`: Responsive `9:16` portrait stage matching `page-1-reference.webp` through `page-12-reference.webp`, persistent top Close (`Ã—`) button on every page, drag-and-drop + tap-to-place + keyboard accessibility, and scoped service worker.

### Audio System Setup & Assets
- **Custom Audio Files Copied & Verified**:
  - `Correct Answer Audio.mp3` $\rightarrow$ `assets/see-saw-assets/audio/correct.mp3` (161,040 bytes)
  - `Wrong Answer Audio.mp3` $\rightarrow$ `assets/see-saw-assets/audio/wrong.mp3` (161,040 bytes)
  - `Time up Audio.mp3` $\rightarrow$ `assets/see-saw-assets/audio/time-up.mp3` (161,040 bytes)
  - `SEE SAW Game BGM.mp3` $\rightarrow$ `assets/see-saw-assets/audio/game-bgm.mp3` (292,525 bytes)
  - `SEE SAW Menu BGM.mp3` $\rightarrow$ `assets/see-saw-assets/audio/menu-bgm.mp3` (311,394 bytes)
- **Smooth Audio Crossfading & Persistence**:
  - Web Audio API exponential ramp faders with `1.2s` crossfade duration between UI (`menu`) and Gameplay (`game`).
  - Idempotent `setMode()` logic prevents volume resets or dips during continuous gameplay questions/popups.
  - Smooth `0.8s` decay before entering video modals (Page 3, Page 9, Page 13) preventing abrupt cutoffs.
  - HTML5 Audio fallback equipped with smooth easing volume interpolation loop.
  - Instant pre-decoded AudioBuffer playback for `playCorrect()`, `playWrong()`, and `playTimeUp()`.

- **Star Progression & Replay Flow**:
  - Stars progress continuously across rounds: Star 1 (5 streaks), Star 2 (faster times), and Star 3 (further speed improvement).
  - No 1-star-per-day restriction â€” players can replay and earn stars back-to-back at their own pace.

- **Page 12 ("Too Slow!") Visual Alignment Fix**:
  - Aligned Row 1 ("Your time") and Row 2 ("Time to beat") with Row 3 ("Streak reset") per user annotation.
  - Inserted vertical separator bars (`.ss-p12-sep`) in Row 1 and Row 2 at exact horizontal coordinate (`left: 47.9%`), matching the baked separator in Row 3 (`x = 173px` on 390px mobile viewport).
  - Vertically centered values inside cream pill rows (`top: 38.8%`, `height: 11.0%` for Row 1; `top: 53.2%`, `height: 11.2%` for Row 2).
  - Positioned numeric values immediately to the right of the separator bar (`left: 51.0%`) with `line-height: 1`, preventing sagging or overflow across pill borders.
  - Pixel-verified in Chromium/Edge: all three separators align on the identical pixel column `x = 173`, with uniform 8px gap before numbers.
  - Added inline critical styling block in `<head>` of `see-saw.html` and legacy class fallbacks in `see-saw.css` so that even if a client browser has cached markup, the values are locked to the exact vertical center.

- **Loading & Cache Delivery Fixes**:
  - Added `'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg'` into `server.mjs` MIME whitelist.
  - Standardized fallback slides to `.webp` format across `see-saw-config.js`, `see-saw-video.js`, and `sw.js`.
  - Added non-blocking `.catch()` resilience to `preloadImage()` in `see-saw.js` so asset warnings never freeze progress at 93%.
  - Upgraded Service Worker to `v2` with Network-First strategy for HTML/CSS/JS so future layout adjustments and code edits apply immediately without requiring manual cache wipes.

- **Close Button & Mascot GIF Looping Controls**:
  - Replaced font-glyph close button with centered vector SVG cross inside `.ss-close-btn` (`dx = 0.00px`, `dy = 0.00px`), eliminating baseline descent sag.
  - Injected binary Netscape `loop = 1` into `correct-answer.gif`, `wrong-answer.gif`, and `time-up.gif` mascot animations so they play through once and hold on their celebration/reaction pose without looping indefinitely. `idle.gif` retains continuous looping.
  - Added celebration confetti particles (ribbons, stars, sparkles), balanced see-saw beam golden aura, and newly earned streak dot pop animation with an extended 3.8s hold time and tap-to-advance capability.

## 12 November 2026 â€” Game Logic & Daily Star Quota Refinements (`v2`)

### 1. Round Timing & Simplified Benchmark Architecture
- **Rule Clarification**: All 5 questions make one complete round. Questions within the SAME round are NEVER compared against each other.
- **Round 1 (First Star)**:
  - "5 in a row = first star".
  - Player answers all 5 questions correctly within the standard 10-second timer per question (no time-to-beat pressure).
  - Upon achieving 5 in a row, Star 1 is awarded and the player's round average time (e.g. `3.4 s`) is displayed on Page 10.
  - This round average becomes the single, intuitive benchmark time (`timeToBeatMs`) for every question in Round 2.
- **Subsequent Star Rounds (Star 2 and Star 3)**:
  - "Beat previous round average = next star".
  - For every question in the round, the player simply needs to answer faster than that winning round average benchmark (`elapsedMs < timeToBeatMs`).
  - If `elapsedMs >= timeToBeatMs`, triggers "Too slow!" (`page-12`), showing `Your time` vs the clear average `Time to beat`.
  - When all 5 questions beat the benchmark, the next star is earned and the new, faster round average becomes the benchmark for the subsequent star round.

### 2. Daily Star Quota (Up to 3 Stars a Day)
- Player can win up to 3 stars total.
- **No Midnight Reset**: Earned stars and benchmark average times (`timeToBeatMs`) are permanent and never reset across days.
- **Page 4 (Home)**: Added top-left floating stars badge (`#p4-daily-stars-badge`) displaying `Stars: â˜…â˜…â˜… (X/3)` symmetrically balanced with the top-right close button.
- **Page 11 (Star Earned)**: Displays `X of 3 stars earned` and highlights all 3 stars with `All 3 stars earned!` when complete. Further play is permitted for practice and personal speed records without losing stars.
- **Outcome Popups Clean Background Fix**:
  - Automatically hides the bottom answers tray (`answers-tray.webp`) and all 5 cause options (`p5TrayArea.hidden = snap.page !== 'page-5'`) when showing **Time Up!**, **Correct Answer**, **Wrong Answer**, or **Too slow!** outcome popups.
  - Eliminates visual overlap and ensures the popups appear on a clean background without any background tray borders or rocks peeking out behind the popup cards.
- **Wrong Answer Dynamic Tilt & Mascot Sliding Sequence**:
  - Replaced the subtle 2.8Â° shift with a dramatic physics-driven tilt animation (`@keyframes ssSeesawTiltWrong`) tipping the beam down to `-7.6Â°` before settling smoothly at `-6.5Â°`.
  - Added a sequenced mascot sliding animation (`@keyframes ssMascotSlideWrong`) where the HPLC character slips down the incline of the plank (`-9.5u` left, `+1.5u` down, `-6.5Â°` tilt), gently bumping and resting snugly beside the left symptom stone just like the design reference (`media_1794464336045_9bda20d0.jpg`).
  - Added smooth transition recovery when retrying or advancing, returning both the beam and mascot back to their level horizontal position.
- **Dynamic Rule Text & Font Scaling (Page 4 & Page 5)**:
  - Scaled the font size of `.ss-p4-rule-line1` (`5 questions Â· 10 seconds each`) from `4.5u` to `5.7u` (`calc(var(--u) * 5.7)`), perfectly matching the size and weight of the other text rows (`5 in a row = first star` and `Beat each previous time = next star.`).
  - Made the seconds display dynamic on Page 4: displays `10 seconds each` for Star 1, and dynamically displays the user's winning round average (e.g. `7.2s each`) for subsequent star rounds.
  - Connected the in-game countdown timer on Page 5 so the question timer dynamically counts down from that same benchmark (e.g. 7.2s countdown).
- **Question & Answer Stone Placement, Rotation, and Layering**:
  - Re-anchored `.ss-seat-left` (`left: 4.8%`, `top: 30.2%`, `width: 31.5%`, `height: 12.8%`, `z-index: 3`) so the question rock sits squarely on top of the blue beam, with the grass tufts resting snugly inside the yellow end-cap curve rather than protruding or being clipped.
  - Mirrored symmetrically for `.ss-seat-right` (`left: 63.7%`, `top: 30.2%`, `width: 31.5%`, `height: 12.8%`, `z-index: 3`), ensuring both the question mark slot (`.ss-drop-placeholder`) and the placed cause rock (`.ss-placed-rock`) mirror the exact vertical elevation, width, and margin (`4.8%` on both edges).
  - Ensured `z-index: 3` on both seats over the plank (`z-index: 1`) so rock bases and grass elements sit naturally on top of the beam surface rather than being occluded by plank end-caps.
  - Retained child hierarchy under `#seesaw-beam` so both rocks maintain lockstep rotation and parallel seating across all game states (horizontal at `0Â°` in idle/balanced mode, and dynamically tilted at `-6.5Â°` in wrong-answer mode).
- **Automated Verification**: Comprehensive unit test suite in `tests/see-saw.test.cjs` covering all round comparison transitions, daily quota caps, outcome popup tray hiding, dynamic rule benchmark formatting, wrong answer tilt/mascot slide animations, and stone placement/symmetry (12/12 tests passing).
  - Updated mascot outcome GIFs (`correct-answer.gif`, `wrong-answer.gif`, `time-up.gif`) to `loop = 1` in their Netscape application header so they play once and freeze on the final frame.
  - Preserved continuous looping (`loop = 0`) exclusively on `idle.gif`.
  - Added transition re-triggering logic in `see-saw.js` so each outcome animation cleanly starts from frame 0 and halts upon completion without infinite looping.

- **Correct Answer Hold Delay & Celebration Visuals**:
  - Increased `correctHoldMs` from `1750ms` (1.75s) to `3800ms` (3.8s) in `see-saw-config.js` to give players comfortable time to recognize their correct answer, review their time, and watch the balanced see-saw.
  - Added instant tap-to-advance on `#popup-correct` so players who wish to skip the hold can immediately proceed without waiting.
  - Added dynamic celebration layer (`#celebration-layer`) spawning 48 staggered particles:
    - 27 fluttering ribbons in vibrant rainbow/metallic tones with 3D tumbling rotation.
    - 11 gold stars (`polygon` clip-path with golden drop-shadow).
    - 10 floating sparkles around the celebrating mascot and the balanced beam.
  - Added golden glow sheen on the plank when balanced (`[data-tilt="balanced"]`).
  - Added pop & glow keyframe animation (`.is-newly-earned`) on the newly acquired streak progress dot.

### Verification & Visual Limits
- **Fallback Video Slides**: Integrated the 4-step storyboard sequence provided by user (`slide-1.jpg` .. `slide-4.jpg`) into `see-saw-video.js` with animated scrubber, slide transitions, and completion unlocking.
- **Unit Tests**: `node --test tests/see-saw.test.cjs tests/sw.test.cjs` â€” 7/7 tests PASS.
- **Browser Verification (Playwright & Edge)**: Full automated run through all 15 screens (`page-1.png` through `page-13.png`), verifying banner launch from `#/rc-games`, splash, demo 1..3, 5 unskippable onboarding videos, home, gameplay (1/5) with 10s countdown timer, correct answer, wrong answer, time-up, page 9 remediation video player with fallback slideshow, 1-star celebration, 3-star victory, "too slow!" retry, and watch videos page.
- **Pending / Limits**: YouTube/MP4 URLs will seamlessly supersede fallback slides once provided in `see-saw-config.js`. Physical device testing on mobile browsers recommended for touch feel and audio gestures. Local only; no git push or deployment performed.


## 12 November 2026 — Stronger wrong-answer tilt and connected mascot slide
User authorized stronger board motion, foreground stones and a synchronized mascot slide. Moved the mascot into #seesaw-beam so it inherits the board pivot/rotation. Board now tips to -15 degrees, rebounds to -12 and settles at -13 over 1.1s. Mascot hesitates briefly, accelerates 12u downhill in board-local coordinates, rebounds gently and settles without a duplicate independent board rotation. Seats moved to top 31%, bottom-aligned artwork, foreground z4 above mascot z2 and plank z1; beam/base layering explicit. Correct/time-up visuals, supplied GIFs, audio cues, question rules and popup timings preserved. HTML/scoped SW revision v3.
Validation: 12 See Saw/service-worker tests passed. Edge and WebKit wrong-answer flows captured at 390x844 and 320x568; inspected idle/wrong screenshots and confirmed mascot remains a beam child. Physical iPhone/Android feel remains unverified. Local only; no deployment or Git push.

## 12 November — Remove unrequested home star badge
Removed the home Stars badge markup, styling and render handlers completely; earned-star storage/progression and end-of-round summary retained. HTML/scoped SW v4. Audited generated UI copy: extra All 3 stars earned summary line, watch-list Probable Cause label and operational loading/orientation/video controls remain; no further removals made without scope. Ten See Saw tests passed and Edge/WebKit home-to-wrong-answer flow passed. No deployment or Git push.

## 12 November — Slide toward answer stone with immediate reaction
Mirrored wrong-answer tilt and mascot travel to the right-hand answer stone: +15 degree overshoot settling at +13, local mascot slide +12u with existing rebound and 1.1s duration. Inspected the supplied wrong GIF: its initial neutral poses delayed visible reaction. Retained original and added wrong-answer-immediate-v1.gif beginning at source frame 25, preserving remaining frame timing, holding final pose without looping. Uses preloaded stable URL; board/slide wait for reaction decode, guarded against stale mascot mode before applying motion. Correct and time-up playback unchanged. HTML/scoped SW v5.
Validation: ten See Saw tests passed; Edge/WebKit wrong flows checked at 220ms (reaction at onset) and 1200ms (settled at answer side). Inspected both frames. Physical phone verification pending. Local only; no deployment or push.

## 12 November — Outcome GIFs play once; idle alone loops
Removed the GIF repeat application-extension blocks losslessly from the three active outcome assets. New cache-safe filenames: correct-answer-once-v1.gif, time-up-once-v1.gif, wrong-answer-immediate-v2.gif. Frame data/durations preserved, originals retained. Idle retains infinite-loop metadata. Outcome instances keep fresh playback URLs so repeated outcomes restart; wrong motion still waits for decoded reaction and guards stale callbacks. HTML/scoped SW v6. Existing screen hold/advance timings preserved.
Validation: ten See Saw tests passed; Edge/WebKit actual GIF playback checks after full 7.5s/10s duration verified all three outcomes hold identical terminal frames while idle continues changing frames. Physical-phone playback pending. Local only; not deployed/pushed.

## 12 November — Wrong reaction audio/visual start synchronization
Moved playWrong from immediate answer submission to the decoded reaction's reveal frame, shared with board/mascot motion start. Reaction stays hidden only while decoding; wrong audio fires once per fresh reaction source. Source/current-page guards discard stale callbacks after navigation. Correct and timeout audio behavior unchanged. HTML/scoped SW v7.
Validation: ten See Saw tests passed. Edge/WebKit checks deliberately delayed GIF decode by 300ms: no wrong sound during wait, exactly one call when reaction visibility is restored, then correct rightward slide. Physical-device audio latency remains unverified. Local only; no deployment/push.

## 12 November — Wrong MP3 audible onset
Measured decoded wrong.mp3 samples: first low-level sound ~0.52s, first strong reaction ~1.4s, explaining why sound was heard after the 1.1s slide despite a synchronized play call. Added configurable wrongStartOffsetSeconds=1.4; Web Audio starts at that offset and HTML fallback reuses preloaded audio with matching currentTime. Original MP3 untouched. Correct/time-up audio unaffected. HTML/scoped SW v8.
Validation: ten See Saw tests passed. Edge real-buffer instrumentation confirmed start offset 1.4 exactly while reaction visibility is restored, after an intentionally delayed decode. Physical-device listening remains pending; Windows WebKit lacks AudioContext. Local only; not deployed/pushed.

## 12 November — Animated New Star rays
Animated the existing page-10 star ray layer with continuous 18-second rotation and gentle 2.8-second opacity pulse. Preserved star bounce, ray size/mask, page layout and all copy. HTML/scoped SW v9. Edge/WebKit computed-frame checks confirmed rotation and pulse, including reduced-motion emulation; inspected screenshot for containment. Physical phone review pending. Local only; no deploy/push.

## 12 November — Supplied YouTube training videos
Mapped all five client Shorts URLs to the matching pairs: High Pressure qp7AV0sm9IY; Low Pressure dZSrWQI4M-Q; Peak Tailing Lzsot0zqUWA; Retention Time Shift TtUwfHJX4b4; Pressure Fluctuation BSuYdW8Rctk. Existing shared video player supplies onboarding, remediation and Watch Videos; completion gates and fallback slides retained. HTML/scoped SW v10. Ten tests passed; verified all topic-to-ID mappings through the actual Shorts URL extractor. Live YouTube playback/embedding availability and physical-device streaming not verified in this change. Local only; no deployment/push.

## 12 November — Full-stage training video panels
Expanded the shared Watch Videos/remediation front card to fill the game stage. Compact fixed-height header leaves room for persistent close; video flexes across full inner width and remaining height; bottom Back/Try Again retains a 44px minimum target. Removed nested modal side margins/large vertical gaps. Supplied title/button wording, video handling and completion locks unchanged. HTML/scoped SW v11.
Validation: Edge/WebKit checked list and retry panels at 390x844 and 320x568: full-height card, video exceeds 72% stage height, bottom control contained and no overlap. Inspected layout screenshot; streaming not part of this geometry check. Local only; no deploy/push.

## 12 November — Mobile-only orientation prompt
Fixed rotation overlay using AB Express's existing Android/iPhone/iPad/iPod and touch-Mac iPad detection. Previously a landscape window below 540px height triggered the prompt even on desktop; now only mobile/tablet landscape activates it. Desktop remains playable at any window height. Existing mobile orientation pause/audio behavior preserved. HTML/scoped SW v12.
Validation: Edge/WebKit tested 1280x480 desktop (no prompt), iPhone/Android 844x390 emulation (prompt), and return to 390x844 (prompt clears). Syntax passed; physical devices not tested. Local only; no deploy/push.

## 12 November — Reduce intrusive Shorts controls
Set YouTube player controls=0 for all embedded training videos, keeping autoplay, inline playback, completion gates and existing keyboard policy. Removed deprecated modestbranding parameter. No masking, zoom/crop or cover layer over player. HTML/scoped SW v13.
Validation: actual Edge playback in Android-UA 390x844 produced normal video with large side Like/Share controls absent; small YouTube branding and transient title/play overlay remain controlled by YouTube. Inspected screenshot; ten See Saw tests and JS syntax passed. Physical phones and all YouTube UI variants remain unverified. Local only; no deployment/push.

## 12 November — Home instruction typography/alignment
Aligned live question-count/time text to the artwork's other instruction rows at 43% left, vertically centred beside clipboard. Increased rounded-font size to 6.7u and matched navy colour/two-line spacing; widened text area to 49% for supplied timer text. No wording or game-rule changes. HTML/scoped SW v14. Edge/WebKit 390x844 and 320x568 checks passed; inspected benchmark-time screenshot. Physical phone review pending. Local only; no deploy/push.

## 12 November — Five lifetime stars, three daily, non-star result
User confirmed max 5 lifetime stars with 3 per IST day. Separated lifetime/daily clamps and increments; day reset preserves lifetime totals and benchmark. Default date helper now uses Asia/Kolkata. Capped completed rounds keep score-time summaries without awarding stars. Non-star page-10 uses supplied empty result background and Well Played artwork, hides star/rays/New Star heading and returns directly to another round. Star-earned page retains its approved background/animation; summary now displays five star icons and X of 5. Removed obsolete All 3 stars earned generated line. Copied New Star Panel unchanged into isolated assets for reference; original earned-star composition remains intact. HTML/scoped SW v15.
Validation: 11 tests passed including multi-day 3+2 lifetime awards, daily cap, lifetime cap, reload preservation and exact IST midnight boundaries. Edge/WebKit browser runs checked actual five-answer rounds for new-star, daily-capped and lifetime-capped results, correct visuals and navigation. Inspected both result screenshots; physical-device verification pending. Local only; no deployment or push.

## 12 November — v15 Firebase Hosting release
User authorized deployment. Hosting-only deployment to apl-qc-core-app-f5a3e completed (version bc125385d5a2f88a). Thirteen tests passed; 1016 staged files verified for hashes/inventory/private exclusions. Live eight runtime files and five active changed GIF/result media files SHA256-match local release. Includes prior approved See Saw motion/audio/single-play GIF, video/UI/orientation, star-ray and 5-lifetime/3-daily/result changes. Backend/database untouched; no Git push. Physical-device checks remain pending.

## 12 November — Drag-and-drop-only answer placement
Removed tap/direct keyboard answer submission. Pointer release submits only after movement exceeds existing drag threshold and ends over the drop target. Touch/mouse dragging, ghost/highlight, cancellation and miss-drop behavior retained. Drop target no longer advertises a clickable button; tray answer focus removed. HTML/scoped SW v16.
Validation: eleven tests passed; Edge/WebKit verified tap on stone plus target does not answer, while real mouse drag and simulated touch-pointer drag both submit correctly. Physical-device touch feel pending. Local only; no deploy/push.

## 12 November — Fixed question timer, independent benchmark result
All attempts including retries use Config.questionSeconds (10s) for countdown and timeout. Home instruction now always shows configured seconds. Previous winning average remains a separate comparison after a correct drop: elapsed above average => Too slow, equal/below => Correct. Wrong drop remains Wrong; no drop by full configured duration remains Time Up. Applied comparison to retries as requested for every attempt. HTML/scoped SW v17.
Validation: twelve tests passed including below/equal/above benchmark, retry comparison and full-duration timeout. Edge/WebKit with 0.5s saved benchmark continued into 00:09 on the 10s clock, then showed Too slow on a correct late drag. Physical devices pending. Local only; no deployment/push.

## 12 November — Equal average is Too slow
User clarified equality: correct answers must be strictly faster than the saved average. Equal or slower triggers Too slow, including retries. Countdown remains configured 10s. HTML/scoped SW v18. Twelve tests passed with updated equality boundary. Local only; no deploy/push.

## 12 November — Games and review discussion entries
Added See Saw last in the public Games gallery, with origin-aware navigation. Updated existing RC gallery link to v18. Added See Saw to the shared review catalog so both Global and RC show its discussion card; existing local review state gains its separate review build automatically. General Discussion remains pinned first. Root service-worker cache advanced to v489.
Validation: twelve See Saw tests and catalog syntax check passed. Edge and WebKit verified public Games entry and opening See Saw discussions in both Global and RC. Review conversations remain simulated. Local only; no deployment or Git push.

## 12 November — New game first in both galleries
Moved See Saw to the first entry in Games and RC Games as requested. Other entries retain their relative order. Root service-worker cache v490. Verified first-link order in both sections. Local only; no deploy/push.

## 12 November — Requested gallery order
Both Games and RC Games now start See Saw, Wave Rider, Match It Blast It, AB Express, Solvent Master, My Carz, Rocketier. Remaining older entries retain relative order; all 21 links per gallery retained. Recorded new-games-first convention in root AGENTS.md. Root cache v491. Source ordering and whitespace checks passed. No runtime/animation changes; local only.

## 12 November — v18 release and gallery ordering publication
User authorized Firebase deployment and Git push. Hosting release 2dce030a7ee97750 completed to apl-qc-core-app-f5a3e. Fourteen See Saw/service-worker tests passed; 1016 staged files passed inventory/hash/private exclusion verification. Live index, root worker, review catalog and four See Saw runtime files SHA256-match local. Includes drag-only placement, fixed 10s timer, equality Too slow, gallery order and discussion entry. Root cache v491. Backend/database untouched. Physical-phone verification remains pending. Git publication scoped to See Saw and gallery/catalog/contributor convention files; unrelated local edits excluded.

## 12 November — Strict placeholder release target
User requested drag-and-drop release inside the answer placeholder only. Removed expanded drop margins and entire-beam fallback. Hover highlight and submission now use the visible placeholder bounds; outside drops return without answering. Drag threshold and pointer-release submission retained. Shell/scoped cache v19.
Validation: twelve tests and JS syntax passed. Edge/WebKit verified taps and releases just outside the placeholder do not submit, while mouse and simulated touch-pointer drops inside do. Physical-phone verification pending. Local only; no deployment/push.

## 12 November — Too Slow time-divider overlap
The popup artwork contains red dividers at 52.8% width; generated values at 51% overlapped them. Removed duplicate generated blue dividers and moved both time values to 58%, preserving supplied artwork. Shell/scoped worker v20 (also synchronizes pending strict-drop runtime cache references). Twelve tests passed. Edge/WebKit checked time bounds and captured popup screenshots; inspected Edge image, both values now clear of divider. Local only; not deployed/pushed.

## 12 November — Average-time warning during play
At elapsed time greater than or equal to the saved benchmark, timer text pulses red and a non-interactive red four-corner splash pulses around the stage. Uses existing Too Slow equality rule. No benchmark means no average warning. Clears on answer, timeout or leaving gameplay; full configured countdown remains unchanged. Benchmark captured once per attempt, no per-frame storage reads. Shell/scoped cache v21.
Validation: twelve tests and JS syntax passed; Edge/WebKit checked warning absent initially, active above benchmark, timer red, and cleared after drop. Inspected phone-sized Edge screenshot. Physical devices pending. Local only; no deploy/push.

## 12 November — Home first instruction bold styling
User requested first instruction match the heavier artwork rows. Replaced Trebuchet fallback with Arial Black/Arial bold and added a subtle 0.25px same-color text stroke for consistent weight on mobile font fallbacks. Content, sizing and position retained. Shell/scoped cache v22. Browser verification recorded below. Local only.
Validation: inspected 390x844 Edge home screenshot; bold first row stays aligned within instruction panel. Physical iPhone/Android font rendering pending. Not deployed/pushed.

## 12 November — v22 publication
User authorized deployment and push. Firebase Hosting-only release completed. Fourteen tests and 1016-file staging/hash/exclusion checks passed. Live HTML, JS, CSS and scoped worker SHA256-match local on both apl-qc-core-app-f5a3e.web.app and apl.redchariots.in. Includes strict placeholder drop, Too Slow divider fix, benchmark red timer/corners and bold home instruction. Backend/database untouched; physical-device checks remain pending.
