# Approved scope and presentation rules

## Approved handoff flow - 2026-11-06

This supersedes the earlier temporary replay-only flow and deferred streak implementation. Source: Match_It_Blast_It_Developer_Handoff-2.docx and the user's five confirmed answers.

- Title Next opens three demo steps on first visit; completed demos are remembered. Later Next opens Home (page 2). Demo always remains available. Final demo Next opens page 2.
- Home is the Diya Streak landing page. Start Challenge opens a fresh 60-second round. A persistent top-right Close control returns to the originating Games or RC Games gallery from every screen. Direct entry defaults to Games.
- Match all five meanings before Light becomes available. Dragging, tap placement/swapping and keyboard return remain supported. Parameter crackers and meanings shuffle independently on each new board. Consecutive boards must not repeat the same order. Matching and feedback remain tied to stable pair IDs, with checking following the displayed bottom-to-top order.
- Active elapsed time starts once the board becomes interactive and stops on the Light press. Entry and checking animations do not count. Hidden/landscape pause remains.
- Ignite from the bottom. Correct pairs burst bottom-to-top with the supplied Blast 2 MP3, flame, light smoke and falling artwork fragments. The first wrong pair emits black smoke and stops further bursts.
- Correct and strictly under target: Correct -> Next -> page 8; one diya lights. Play Again starts a new round. Third diya transitions to page 10 Gold Star after its lighting animation.
- Correct at or above target: Correct -> Next -> page 9 reset -> Play Again.
- Wrong: page 6 -> Watch Video and Play Again -> feedback for the first wrong pair encountered bottom-to-top -> Play Again. The corresponding supplied feedback video plays on this page.
- Timeout: page 9 directly, with Time's up sticker -> Play Again. No wrong-pair checking on timeout.
- Initial target is strictly under 20 seconds (20.000 seconds fails). After three qualifying consecutive rounds, award one star. The next target is the previous best three-round average; each new round must be strictly faster. Compare unrounded elapsed milliseconds, not displayed time labels.
- Wrong, target miss or timeout resets only the unfinished diya streak; earned stars and best average remain.
- Persist demo completion, stars, best average and unfinished streak in this browser's local storage. In-progress board is not saved; reopening starts a fresh board and retains completed qualifying rounds. Record results once at submission/expiry so reloads cannot duplicate awards.
- Three supplied demo slides are shown in numerical order with Next navigation. Demo never changes progress except its completion flag.
- Pair mapping remains: % RSD -> Precision; Resolution -> Peak Separation; Tailing Factor -> Peak Symmetry; Plate Count -> Column Efficiency; Retention Time -> Peak Identification.

## Shared quality standards

- Preserve artwork aspect ratios and baked labels. No duplicate labels or shortened client copy.
- Full available portrait viewport with safe-area protection; desktops keep a portrait composition. Prompt mobile landscape users to rotate.
- Decode required assets before enabling Next, show actual load progress, and offer retry for failures.
- Lock submission/placement during fuse ignition, checking and result transitions. Timer pauses during hidden/landscape states; animation clock pauses with it.
- Maintain smooth entry, selection/drop, fuse sparks, sequential bursts and result feedback. Do not suppress effects on mobile or reduced-motion settings without approval.
- Scoped cache version, shell dependencies and entry link must remain aligned when updates ship.
- Browser tests do not establish physical iPhone/Android compatibility; report that limit. Do not push without user instruction.

## Audio and urgency - 2026-11-06

- Supplied menu and gameplay MP3s crossfade over 1.1 seconds. The game track covers board entry, matching and checking; all other UI pages use menu music. Feedback video pages fade music out so future video speech is clear.
- Sparkle effect loops from Light activation through ignition and checking, stopping when the first wrong pair extinguishes the fuse or the final correct pair bursts. No sparkle on timeout.
- Final ten active seconds use red timer digits, glow and pulse plus the copied AB Express tick sound. Final five seconds increase pulse/tick frequency. No ticks after submission or timeout.
- Gesture-unlock and visibility/orientation pause apply to all audio. All files stay in this game's audio folder; no runtime dependency on AB Express media. Browser checks do not certify physical-device audibility.

## Continuous presentation - 2026-11-06

- Use a shared pause-aware animation clock for page crossfades, placement, assembly, sparkler approach, contact, fuse travel and feedback holds. Timing is centralized in config.
- Preserve the existing board artwork nodes through matching -> checking. Interpolate visible artwork bounds without a one-frame layout jump. Preserve native image proportions. Fade the tray/timer digits as the board moves.
- Complete assembly before the sparkler approaches. Show the ignition point only at contact; withdraw the sparkler after flame transfer. Check bottom-to-top at 600 ms per subsequent pair. Finish local effects before result feedback.
- Keep outgoing pages as noninteractive crossfade snapshots; block repeated navigation taps until the destination is established. No duplicate accessible controls.
- Demo controls follow the essential demonstration. Board timer/input start together after entry. Results, retry, streak replay and Gold Star Home appear after their feedback holds.
- Only the newest earned diya lights; existing flames stay lit. Reveal its time with ignition. Hold the third diya before the star page. Reset pages extinguish previously earned streak flames. Stars/best target persist unchanged.
- Media placeholders remain until supplied. No push without an explicit request.

- Saravedi presentation: use the original thread.webp artwork with invisible segmentation; burn only behind the live flame, then blacken, thin, curl and fade. Correct pairs scatter torn paper with staggered fire and warm light; wrong pairs retain black-smoke failure without secondary explosions.

- Correct bursts include decaying screen shake, background dimming, warm scene-wide fire illumination and dense erratic paper debris; preserve bottom-to-top checking and stop at the first wrong match.

- Wrong-pair feedback waits for a focused failure sequence: previous blast settles, camera centers/zooms, fuse struggles, flame extinguishes with supplied wrong sound/failure GIF and black smoke, then camera returns. Unchecked pairs dim and do not burst.

- Exit cancels active input, timers, animation callbacks, particles, fuse/effect audio and feedback video playback. Existing recorded results and saved progression are retained; abandoning an unsubmitted board does not record a new result. Audio stops when leaving the game.

- Feedback videos use the supplied YouTube videos first. Request the matching local WebM only if the YouTube API/player fails or initialization times out. Autoplay blocking alone is not a failure; show Tap to play. Never preload fallback videos.
