# AB Express - approved game details

User confirmed: portrait game named AB Express, card last in RC gallery, review the supplied flow and ask questions.

## Source flow summary (subject to confirmed clarifications below)

Landing preloads assets with progress replacing Next. First-time players see five demo slides, then Home with Challenge, Practice, Demo and Learn the Sequence.

24 unique steps appear across five ordered buckets of eight steps each; repeats across buckets are allowed. Drag/drop arranges steps; Start the Train submits. Compartments show step icons and pass through a tunnel with correct-order feedback and crash/smoke for wrong order.

Practice has no timer/points. Success goes through congratulations; Next opens the following bucket, with Home after bucket 5. Failure goes through comparison to same-bucket retry, with an option to exit Home.

Each challenge round has a 60-second countdown. Five correctly completed buckets build five streaks and award one star. Any wrong order resets streak, offers comparison, then retries with a different bucket. Learn shows all 24 steps across three pages.

## Confirmed clarifications

- Isolated folders: assets/ab-express-assets/ and assets/ab-express-scripts/.
- Latest confirmation supersedes the earlier elapsed-only timer: each challenge bucket has 60 seconds of active arranging time. At zero, lock the arrangement, show time-expired/crash feedback, reset the streak, offer comparison and retry with a different bucket. Even a correctly arranged sequence must be submitted before zero.
- Start the countdown when the arrangement is visible and ready; stop it on submission. Pause during backgrounding and the orientation prompt. Each new/restarted bucket begins with 60 seconds; completed streak checkpoints remain as previously approved.
- Practice assigns buckets in order 1 through 5; there is no selector. Challenge is available immediately.
- Challenge shuffles all five buckets without repeats. Failure resets the streak and restarts with a different first bucket.
- Train checking stops at the first incorrect compartment.
- Demo completion, completed streaks and stars persist. An interrupted attempt restarts the current bucket from its beginning, retaining completed streaks.
- After completing the five-slide demo once, future visits go directly from landing to Home; Demo remains accessible there.
- User supplied the master sequence and bucket definitions below. Assets imported from the requested Downloads folder unchanged; filenames do not authorize additional game behavior.
- On 1 November, user authorized implementation using supplied assets and references. User approved temporary reference slides for demo pages 5/6. The initial elapsed-only wording was subsequently superseded by the confirmed 60-second countdown.
- Audio is intentionally pending: the user will provide AB Express music and effect files.

## Ordered bucket step IDs

| Bucket | Correct step order |
| --- | --- |
| 1 | 1, 3, 6, 7, 8, 13, 15, 21 |
| 2 | 2, 4, 5, 8, 9, 10, 12, 13 |
| 3 | 3, 9, 10, 11, 12, 13, 15, 16 |
| 4 | 8, 13, 15, 16, 17, 18, 21, 22 |
| 5 | 8, 9, 10, 14, 19, 20, 23, 24 |

## Master sequence

### Pre-Weighing
1. Check the balance bubble is centred.
2. Check calibration is within date.
3. Label the preparation vessel.
4. Match the sample container label to the worksheet.
5. Open the balance door.
6. Clean the pan with the correct brush.
7. Clean the entire base if residue is present.

### Weighing
8. Use a clean & dry butter paper boat.
9. Centre the boat on the balance pan.
10. Tare the empty paper boat to zero.
11. Discard excess sample in the bin. Don't return it to the container.
12. Close the door for a stable reading & to prevent contamination.
13. Wait for a stable reading before recording.
14. Check net weight against the worksheet.
15. Calculate and record the actual sample weight.

### Post-Weighing
16. Transfer the weighed sample to a dry preparation vessel.
17. Weigh the used butter paper to check sample left.
18. Record and print the gross weight.
19. Clean the entire pan and base with brush after weighing.
20. After weighing and cleaning, close the door to prevent contamination.
21. Throw the used butter paper in the bin.
22. Throw other waste and sample residue in the bin.
23. Leave the balance clean and ready for use.
24. Recheck the balance bubble is centred.

## Train presentation clarification - 2 November 2026

The train enters from below the screen before compartment checks. Show the answer feedback first, complete its reveal and reading hold, then show Next (or Check Right Order for challenge failure). Continuation must not appear simultaneously with the answer panel.

## Crash and comparison presentation - 2 November 2026

Failure now triggers a 2800ms connected impact sequence: warm burst and shock ring, camera shake and carriage recoil, sparks, then layered rising smoke. The crash title enters after 650ms; the existing title hold overlaps the effects. Smoke clears before the answer panel reveals and its 1600ms reading hold finishes. All impact frames use the shared pausable game clock. Timing and intensity live in config.crash. Audio remains pending supplied AB Express files.

Comparison uses the exact supplied page-14-bg.webp, including all eight paired compartments. Icons occupy the red icon areas and full descriptions sit inside the cream insets. Custom scrolling cards, additional borders and position/status decorations were removed following the user correction. Home and Play Again remain below the artwork.

## Approved audio - 2 November 2026

Owned audio files are under ../ab-express-assets/audio: Gameplay BGM.aac maps to gameplay-bgm.aac, Menu BGM.aac to menu-bgm.aac, and Wrong answer 2.aac to wrong-answer.aac. Arrangement and train checking use gameplay music; other screens use menu music. Two persistent decoded loops crossfade over 850ms using Web Audio gain ramps, including interrupted/reversed transitions. Music begins after a user interaction and pauses with visibility/orientation interruptions. Wrong-answer audio triggers with failed checking; generated soft UI tones vary slightly in pitch without consecutive repeats. Volumes and crossfade duration are in config.audio. Audio is included in loading progress and the scoped offline cache.

## Readable arrangement proportions - 2 November 2026

Arrangement compartments now have an 82px logical minimum height, 38px icons and 14px text. Full descriptions remain intact. The eight-row area scrolls when needed rather than shrinking contents; Start remains outside it. Swipe the text area to scroll, drag an icon to reorder on touch, or use existing tap/keyboard reordering. Drag targeting uses actual visible row bounds and scroll offset, with edge scrolling during pointer movement.

## Rearrangement and train audio - 2 November 2026

Button tones now use a stronger triangle timbre at gain .28 with a 150ms lifetime and pitch variation. Rearrangement uses a generated 240ms airy whoosh, throttled to one per 140ms of position changes, and 240ms eased movement from the previous visible row positions. Animation participates in the existing visibility/orientation pause mechanism; drag hit testing uses layout positions rather than animated rectangles.

Supplied Correct 1.aac is stored as train-entry.aac and triggers once when entry movement begins, gain .95. Correct 2.aac is stored as correct-compartment.aac and triggers on every correct compartment check, gain .7. All gains remain configurable. Scene changes stop old cue sources, and repeated cues replace their own previous source instead of stacking.

## No-scroll layout and themed feedback correction - 2 November 2026

The latest user instruction supersedes the scrolling arrangement: all eight rows stay within the screen. Row height shares available space; icons and full text scale within bounded sizes. Entire rows support touch dragging again. No content is shortened.

Buttons use a newly generated soft harmonic chime with slight pitch variation. Rearrangement uses a quiet, short bell-like placement cue, replacing the airy whoosh while retaining eased row movement. My Carz's active my-carz-explode.mp3 and eight PNG explosion frames were copied into AB Express ownership. They run at a failed tunnel check with a short impact jolt, failed-carriage separation and staggered trailing-car separation; the old repeated train shake and procedural fireball were replaced. Frames use the pausable clock over 2.2 seconds. Correct trains retain the approved entry/correct sounds and do not explode.

## Small-phone comparison readability - 2 November 2026

Comparison uses 24 configured concise labels with deliberate two-line breaks, 11.5px semibold text (previously 9px), and consistent inset alignment. Full canonical wording remains in learning/gameplay and in comparison accessibility labels/tooltips. Only incorrectly positioned submitted steps have a small cross marker and dark-red copy. All eight pairs and original compartment artwork remain visible, without scrolling.

## Challenge readability and countdown urgency - 2 November 2026

Challenge arrangement now uses the concise comparison labels at 14px bold; full canonical wording remains in row accessibility labels/tooltips and practice/learning. All eight rows remain visible. A dedicated gold time badge sits left of Start in the footer with large tabular digits and a remaining-time strip.

At 10 seconds remaining the badge turns red and pulses once per second with a short generated tick. At five seconds it pulses/ticks twice per second. Tick scheduling follows the active round clock without intervals or queued catch-up sounds. Visibility/orientation pause suspends both presentation and audio; submission, expiry and scene changes stop further ticks. Practice remains untimed. Tick volume is configurable.

## Authoritative client-copy correction - 2 November 2026

This supersedes all earlier concise-label decisions: all practice, challenge and comparison instructions must use config.steps verbatim. Removed shortened-label data and both render paths that used it. Full client wording is visibly rendered, not merely retained in accessibility attributes. Comparison uses bounded font fitting to preserve every word inside the fixed artwork; it may necessarily be smaller for long instructions. Challenge retains its timer/urgency and all-eight-visible layout. Never paraphrase client copy to improve presentation without approved replacement wording.

## Sequential practice - 2 November 2026

No player bucket selection. Start Practising begins bucket 1, then successful Next advances directly to buckets 2, 3, 4 and 5. Incorrect attempts go through the existing comparison flow and Play Again retries the same bucket until success. Successful Next after bucket 5 returns Home. Opening a new practice session starts at bucket 1. Challenge progression remains unchanged. This supersedes the previous five-choice selector clarification.

## Shared footer alignment - 2 November 2026

All bottom navigation uses a shared footer with consistent safe margins, gaps and vertical centres. Back/Home/Next use a horizontal row; practice/challenge/reward keep the larger primary action above Home. Comparison gives Play Again more width than Home. Challenge arrangement places the timer beside Start in the same footer. Single continuation buttons are centred.

Button image transparency is cropped using recorded alpha bounds, then visible artwork is scaled proportionally into its hit area. Resize refits these faces without stretching the supplied artwork. Labels, client instructions, navigation destinations and feedback gates are unchanged.

## Shared step pool - 4 November 2026 (supersedes fixed buckets)

The approved revised 17-step list in config.steps replaces the fixed bucket definitions for gameplay. Each round selects eight unique steps, exactly one from the first three and seven from the remaining fourteen. Correct order follows the master list; presentation is shuffled. Five distinct selections form a practice/challenge run; individual steps may repeat between rounds. Practice retries the same selection until success, then Next advances, returning Home after five. Challenge retains 60 seconds, five consecutive successes, failure reset with a different selection, and saved streaks. Existing saved bucket-based runs migrate to fresh selections while retaining completed streaks, stars and demo status. Learning artwork remains unchanged by this runtime update.

### Current approved master sequence

1. Check the balance bubble is centred.
2. Check calibration is within date.
3. Label the preparation vessel.
4. Match the sample container label to the worksheet.
5. Open the balance door.
6. Clean the pan and base
7. Use a clean & dry butter paper boat.
8. Centre the boat on the balance pan.
9. Tare the empty paper boat to zero.
10. Pour the sample onto the paper boat without spilling
11. Close the door for a stable reading.
12. Wait for a stable reading before recording.
13. Transfer the weighed sample to a dry preparation vessel.
14. Weigh the used butter paper to check sample left.
15. Clean the entire pan and base with brush after weighing.
16. Throw the used butter paper in the bin.
17. Throw other waste and sample residue in the bin.

## 4 November 2026 - Current timer and mobile presentation

The challenge limit is now 90 seconds per round, superseding all earlier 60-second references. It starts after card entry and the two-second reading hold. Final-ten-second urgency and failure/retry rules are unchanged. Arrangement clouds use the three supplied Cloud WebP images copied into AB Express assets. Effects remain enabled on mobile and under reduced-motion settings, with interruption pause/resume. Audio unlock now confirms the running context, retries in touch-end/keyboard gestures, primes playback, and recovers after interruptions. Supported Safari versions request the playback audio session.

## 5 November 2026 - Three-round challenge (supersedes five-round challenge)

Challenge requires three consecutive successful rounds to earn one star. Intro and failure displays show three tunnels; failure shows 0/3. Each round remains 90 seconds, with unchanged shared-pool selection, first-error failure and retry rules. Practice remains five rounds. Existing saved challenge streaks of zero through two retain progress; older streaks of three or four convert to one star and clear the completed run, persisted on load.

Start artwork must be measured after its delayed reveal, never while display:none. Portrait phones and tablets fill the available safe-area viewport on every page. Wide displays retain the portrait composition without distortion, with the scene filling the surrounding backdrop. The tunnel row has no dark rectangular overlay.
