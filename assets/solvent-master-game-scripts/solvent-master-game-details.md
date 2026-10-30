# Solvent Master — current game details

## 30 October 2026 - Lesson phone-frame pro tip

- Authorization: user requested the same Rocketier pro tip in the marked upper dark area of the lesson phone frame.
- Added a gold bordered dark gold box reading PRO TIP: Always look at the label, not the colour of the solvent. Positioned within the upper phone area; video geometry, native controls, lesson navigation and all animation/audio behavior unchanged.
- CSS v33, play JS v26 and scoped shell v43 synchronized; no media changes.
- Validation: syntax checks, all six Solvent Master tests and whitespace checks pass. Browser responsive visual and physical-device verification remain pending.


## 30 October 2026 - Supplied animated demo slides

- Authorization: user supplied four GIFs and explicitly mapped Step 1 & 2 to 1/4, Step 3 to 2/4, Step 4 to 3/4 and Video to 4/4.
- Copied each GIF byte-for-byte into owned page-2-demo-page media as demo-1.gif through demo-4.gif and updated demoSlides in the requested order. Existing navigation, completion storage, slide transitions and gameplay unchanged; previous reference images retained.
- Config v11, asset manifest v9 and scoped shell v42 synchronized. Manifest rebuilt to include GIFs.
- Validation: copied bytes match all four sources; syntax, Solvent Master tests and whitespace checks pass. Browser animation/layout and physical-device verification remain pending.


Last updated: 29 October 2026.

## Confirmed requirements

| Area | User requirement |
| --- | --- |
| Name | Solvent Master (`solvent-master`) |
| Orientation | Pure landscape game |
| Questions | Same questions as Rocketier |
| Isolation | Separate game-owned scripts and assets, following Rocketier/My Carz folder organization |
| Games page | Place its card last |
| Animation standard | Follow [game rules and animation expectations](solvent-master-game-rules.md) |
| Development status | User approved the summarized complete practice/challenge flow on 29 October 2026 |

## Rocketier question content reviewed

Values below were checked against `../rocket-game-scripts/rocket-game-core.js` during the 29 October review. Percentages are in Water / ACN / MeOH order.

| Question | Water | ACN | MeOH |
| --- | ---: | ---: | ---: |
| C Column Wash | 90% | 5% | 5% |
| Strong Wash Solvent | 20% | 80% | 0% |
| Needle Wash Solvent | 50% | 0% | 50% |
| Column Storage (C18) | 30% | 70% | 0% |
| D Column Wash | 10% | 45% | 45% |

Question reuse does not establish identical input increments, mission rules, timers, scoring, lives or lesson flow. Recheck the source bank when implementation begins and retain these agreed ratios unless the user changes them.

## Existing preparation

- The last Games card opens `solvent-master.html` in this folder.
- Supplied media exists in the isolated assets folder. Asset filenames alone are not an approved gameplay specification.
- Landscape screens fill the available viewport rather than a centered 16:9 frame. Page 1 artwork scales uniformly using cover with centered horizontal / 10% vertical positioning: excess background edges crop without stretching. Its loader and Next retain their lower-right viewport area. Other screens still stretch with the shared percentage-based coordinate system; their artwork fit has not been changed. Mixing buttons use stage-relative dimensions with their existing render-only transparent-margin crop.
- All production media is loaded into a game-owned revisioned cache with actual byte progress, size/SHA-256 verification, bounded concurrency, automatic attempts and explicit Retry. Reference/old files are excluded.
- Next remains hidden/disabled until media, scoped worker control and landing/button image decoding are ready. It enters over 420ms, then routes first-time players to demo and demo-completed players directly to mixing.
- Portrait-specific guidance and later screen behavior remain pending; the landscape stage currently fits inside every viewport without cropping.

## Demo and mixing introduction

- Four temporary reference WebP demo slides are explicitly approved by the user until GIFs arrive. Config owns the slide mappings. The loader includes these four reference files as a narrow exception; other reference/old files remain excluded.
- Previous/Next and slide count support navigation; first Previous is disabled and the last Next reads Finish. Only Finish records browser-local completion under `solvent-master-demo-complete-v1`. Reopening before completion starts again from slide one.
- After demo completion, landing Next skips demo. It shows Let's start mixing until practice is complete, then the challenge introduction. The mixing Demo button reopens all slides from slide one. Completion remains across replay and is not tied to gameplay resets.
- Mixing uses the supplied page-3-a background, Demo and common Play assets. Transparent button margins are cropped at render time to match reference size/placement without editing media. The supplied background has an empty beaker; no face artwork was supplied separately or invented.
- Transitions use 260ms outgoing then 380ms incoming motion. Slide changes use 220ms outgoing/incoming motion. Controls lock during movement; incoming images decode before the transition. No timers or audio were added.
- Play opens the first practice lesson. With browser storage blocked, demo Finish works for the session; gameplay progress load/save errors are surfaced rather than silently discarding progress.

## Approved complete flow

The user reviewed the complete flow summary and explicitly said proceed. The checked-in [source flow](docs/Solvent%20Master%20Game%20Flow.docx) is retained unchanged; the clarifications below take precedence over conflicting source wording.

1. Landing downloads all required production media before Next. First-time players complete demo; previously completed demos are skipped.
2. Until practice is completed, show Let's start mixing. Play starts practice with the five recipes above in fixed order. Each recipe opens its matching video, then Start Mixing. Lesson controls allow playback/replay without requiring an ended event.
3. Each solvent rack has eight single-use click targets per question. Exactly one matches a positive target ratio; no alternative subset can sum to that target. Zero-target solvents have only positive distractors. Shelves shuffle values and refresh on every question/retry. Distractors use nearby five-percentage-point amounts above half the target. Each recipe offers multiple incorrect combinations totaling 100%, so reaching 100% alone does not identify the answer. Config owns recipe content.
4. A click flies the selected beaker to the main vessel, tilts it, pours a continuous colored stream with rising liquid, then returns it. Input and answer time are locked during the 1500ms sequence (450ms travel, 225ms tilt, 525ms transfer, 300ms return). The total cannot exceed 100%. Undo removes the last pour, restores that shelf selection and drains the main vessel over 550ms.
5. Practice has no clock. Submit checks exact individual solvent totals. Correct feedback waits for Next; the next recipe opens its lesson. Wrong feedback offers Watch Video and retries the same recipe with an empty vessel until correct. Five correct recipes save practice completion before the mastery celebration.
6. Future visits after practice completion route from landing Next to challenge introduction. It announces five mixes in a shared 60 seconds and three consecutive perfect rounds for a star. Play starts each round with all five recipes shuffled once, no repeats.
7. Time runs only while the round is in the mixing phase and input is available. Pouring, Undo, feedback, screen/question entrances and backgrounding do not consume answer time. Backgrounding pauses native animations, video and synthesized audio; returning resumes coherently.
8. Wrong challenge submissions are recorded, show Wrong Mix and continue on Next, with no same-round retries. At timeout, immediately record all unanswered questions wrong and show results. Every completed five-question round shows five outcomes and per-question videos. Closing a results lesson returns to the unchanged results.
9. Results Next shows Perfect Round for streak 1 or 2, Streak Lost for any wrong/unanswered answer, or Congratulations for the third perfect round. Failed rounds reset only the streak to zero. Completed three-round attempts award a star. Rocketier access/unlocking is unchanged and deferred.
10. Next Challenge and Retry start fresh challenge rounds; Play Again resets the completed streak to zero for a new three-round attempt, retaining earned stars and completed practice.

## Persistence and implementation boundaries

- `solvent-master-progress-v1` stores schema 1, completed practice, streak, earned stars and completed round records. There is no daily reset, backend or account dependency. Demo completion remains separate.
- Completed checkpoints survive reopening. An interrupted, incomplete practice sequence restarts practice; an interrupted challenge round restarts from the last completed-round checkpoint. No partial attempt is represented as completed. Invalid JSON is retained and reported. Failed saves hold the checkpoint handoff with Retry saving.
- Core rules are in solvent-master-core.js; loader, flow, presentation, storage and synthesized audio are separate modules. All videos are owned copies under sibling lesson-videos; no runtime imports another game's code or media.
- New feedback entrances take 700ms. Streak beakers enter over 900ms and final star settles over 1100ms. Existing 260/380ms screen transitions, 220ms slide transitions and 420ms landing Next entrance remain intact. No global motion suppression is added.
- Game-owned Web Audio plays supplied Menu BGM and Game Bgm tracks with a configurable 1.2-second gain crossfade. Lessons fade both music tracks down. The supplied last-10-seconds warning follows active challenge mixing time and pauses during pours/feedback. Pouring uses an owned copy of Rocketier Liquid Flowing.mp3. Existing synthesized button/result/streak cues remain; backgrounding suspends the context. Track mappings and volumes are configurable; audible balance awaits physical-device review.

## Pending assets and verification limits

Shelf readability revision: visible beaker artwork is framed without unused outer margins, fitted proportionally to its grid cell and kept wide where space permits. Percentage text is larger and remains within the supplied label; liquid and pouring clones share the same artwork coordinates. Source images remain untouched.

Challenge introduction foreground artwork preserves native ratios: proportionally cropped heading, clock panel, star and Play. The heading pulses gently over 2.4 seconds; the star rotates continuously over 8 seconds with clearance from Play. Two centered text lines occupy the clock panel's right-hand label region. Its background and baked wording retain their prior viewport treatment. Existing background pause handling applies to these attention animations.

Shelf liquid height maps each amount directly to the usable glass interior (20% to 91% of the artwork height), without a minimum fill floor. Shelf beakers use the same liquid highlights, bubbles and moving meniscus as the main vessel. Their fluid is clipped to the glass interior with an exclusion for the existing artwork label. The pouring clone inherits these effects; used-beaker liquid hides and last-pour Undo restores it. Selection rules and timings are unchanged.

Liquid presentation revision: individual pour layers retain their colors with side highlights, bubbles and a meniscus inside the glass. Measured rotated source-lip geometry anchors the stream; its endpoint follows the rising liquid surface every frame. Source drain, stream arrival, counted percentage and destination fill are coordinated; impact rings settle during the existing return window. Undo drains the last layer over the existing 550ms. This uses Liquid Sort/Rocketier as visual references without runtime coupling or changes to their files. Pour remains 1500ms and background pauses/answer-time exclusion remain intact.

- Supplied neutral, happy and sad GIFs are copied unchanged into beaker-faces. Config gameplay.faces selects neutral while mixing and happy/sad only after submission. Correct feedback requires the existing exact recipe (100% total). Native GIF playback owns face animation; CSS/gameplay clock pausing does not explicitly seek or freeze GIF frames.
- Temporary demo reference slides remain until GIFs arrive. Rocketier unlocking is deferred.
- Landscape stage fits inside portrait windows; dedicated rotation guidance is not yet specified.
- Browser verification does not establish physical-device smoothness or audible audio mix. Check progress for current evidence.

Challenge gameplay timer uses the supplied page-5 timer artwork at the upper right, with a shrinking orange remaining-time bar and MM:SS digits. Artwork preserves its aspect ratio; challenge gameplay has no mix counter, matching the reference. Both indicators follow the existing active-mixing clock.

Result presentation follows page-3-d/page-3-e: left speech bubble, unobscured beaker face, supplied Next or Watch Video button at right, no dimmed/blurred overlay or duplicate explanatory text. Mixing controls and percentage bubble hide during feedback; all shelf beakers hide, leaving the shelves empty. Practice header uses supplied badge/panel art. Challenge wrong answers retain Next and their challenge-specific bubble, preserving the approved continue-without-retry rule.

Perfect-round streak 1/2 choreography: retain the 900ms beaker entrance, fill the newly earned beaker with water over 1400ms, switch its neutral face to happy and celebrate with 1600ms jumps/sparkles, fill its outgoing colorless pipe over 1300ms, then activate the next empty neutral beaker over 1100ms. Later beakers remain dimmed/grayscale with GIF faces visible. Previously earned beakers/pipes stay filled. The title pulses with glow; the activated next beaker continues a prominent glow/bob pulse. Next Challenge is disabled until this handoff ends. Timings live in gameplay.streakAnimation; existing background pause handling covers native and frame-driven motion. Native GIF timing remains browser-owned. Lost-streak and final-star flows remain unchanged.

Gameplay feedback focus revision: both correct and wrong submissions fade a dark background scrim in over 350ms, behind the main beaker and result controls. Correct answers additionally celebrate with 1600ms jumps/tilts and sparkles, moving face/glass/liquid together. Next waits until the celebration and existing 700ms feedback entrance finish; wrong feedback keeps its existing entrance duration and does not jump. Timings are configurable. This later user request supersedes the previous no-dimming result treatment.

Perfect-round summary layout uses separated title, remaining-round message and compact shaded streak badge above a consistently aligned beaker row. Font sizes are bounded by viewport width and height for landscape readability; pipes sit behind the beakers. This presentation adjustment preserves the celebration choreography.

Practice mastery page overlays the supplied happy GIF on its baked beaker, with glow/sparkles and a staged title ? mastery badge ? face ? Next entrance. Title pulses and badge floats after entrance. The message and beaker are baked into page-3-f background and retain their original placement with focus effects; no duplicate text or glass is added. Next is enabled after the sequence.

Final three-round celebration: congratulations enters (700ms), star/rays appear (existing 1100ms star settle), beaker/happy face rise together (900ms), then Play Again enters (500ms) and unlocks. Golden rays rotate behind the floating star; title pulses, happy beaker/face bob together, and focus halos animate around the baked completion message and locked rocket. The message/rocket remain part of the supplied background; their attention effects do not independently move that artwork. Rocketier unlocking remains deferred.

Compatibility: native animations created while the document is already hidden are immediately paused and registered for resume. Final title has extra top clearance through its pulse. Chromium and Windows WebKit checks at compact phone-landscape and desktop sizes verify final element bounds and ray animation; these are not proof of every physical iOS/Android device or older browser version. No effect suppression was added.

Audio assets are owned under audio/: menu-bgm.aac, game-bgm.aac, last-10-seconds.aac, liquid-pour.mp3. All are included in byte/hash-verified loading and offline media caching. Music loops share one Web Audio context; crossfades continue from the current gain envelope even if navigation reverses. Last-10 warning resumes at the countdown-corresponding offset, cannot stack, and stops outside active mixing. At 10 seconds the timer bar becomes red and its track/digits pulse; countdown and all existing animation timing remain unchanged.

Additional supplied audio: menu buttons use Buttons 1 (audio/menu-click.aac). Successful completed-round streak pages, including the final three-round outcome, crossfade into Congratulation BGM (audio/congratulation-bgm.aac), starting from the beginning on entry; leaving crossfades to the destination music. Streak-loss page plays Streak Lose (audio/streak-lose.aac) once as the broken-beaker entrance begins. One-shot sources are replaced rather than stacked and the shatter source is stopped if leaving early. Shared audio suspension applies while backgrounded.

Final-page refinement: rotating rays are contained in a smaller circular region below the completion message, with the star centered over them. Removed the rocket-focus halo. This page uses the supplied Congratulation BGM as its celebration track.

Correct/wrong gameplay submissions use the supplied Minions happy-1 and sad-audio recordings, owned as audio/mix-happy.aac and audio/mix-sad.aac. They replace generated correctness cues and begin with the corresponding face/feedback reveal. Only one result voice plays at a time; leaving feedback stops it. Volumes are gameplay.audio.mixHappy/mixSad.

Mobile orientation requirement: iPhone/iPad/Android portrait shows a full-screen Rotate to landscape prompt and blocks game input. Gameplay time, frame-driven liquid, native game animations, video and audio pause until landscape returns. Desktop/laptop portrait-shaped windows are unaffected; iPadOS desktop-style user agents are recognized via MacIntel plus multitouch. Native GIF frame playback remains browser-owned behind the prompt.

Fullscreen follows Working Standard: first game-button click requests document fullscreen under user activation; a persistent bottom-right toggle enters/exits manually. Standard and WebKit-prefixed APIs are supported, with best-effort landscape lock after entry. Unsupported/rejected manual requests show the same Add to Home Screen guidance for iPhone, while gameplay/video/audio/animations pause until dismissed. Native fullscreen cannot be forced on browsers that do not expose it; page navigation alone does not preserve the gallery click activation.
