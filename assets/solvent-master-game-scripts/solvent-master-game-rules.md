# Solvent Master — game rules and animation expectations

Recorded: 29 October 2026.

The user requested that the reviewed Rocketier/My Carz expectations be retained for future reference. This document records that quality standard. The complete gameplay flow was subsequently clarified and approved on 29 October 2026; see [game details](solvent-master-game-details.md) for the authoritative approved behavior and pending assets.

## 1. Continuous motion

- Move, scale, rotate and settle objects continuously between their actual start and end positions. Avoid visible image replacement, teleporting, endpoint snaps and mismatched artwork during a connected movement.
- Preserve visual identity, proportions, attachment points and background continuity through a sequence.
- Use time-based interpolation where appropriate so movement is consistent across frame rates.

## 2. Ordered stages and input gating

- Explicitly sequence relevant entrance, attention/reading, preparation, active play, feedback, reward and exit stages.
- Start gameplay timers only after the applicable entrance, reading and preparation finish. Do not charge animation or lesson time as answer time.
- Enable controls only at the intended stage. Guard against rapid duplicate actions and stale callbacks after navigation, retry or exit.
- Preserve purposeful reading and celebration holds; do not shorten them as a general smoothness fix.

## 3. Attention and feedback

- Use dimming, light sweeps, pulses, glows, trails, count-ups and celebrations to direct attention according to the approved design.
- Keep text readable within the reference artwork and responsive bounds.
- Preserve approved effect strength, duration and sequencing. Do not silently remove, hide, shorten or weaken effects, including through global near-zero durations or browser/device/reduced-motion branches.
- Match supplied references and later approved clarifications. Do not add unrequested controls, panels or flow steps.

## 4. Reward and screen handoffs

- Complete the relevant travel, landing, counting and celebration before enabling continuation or starting the next stage.
- Keep outgoing and incoming layers correctly ordered. An outgoing dim/blur overlay must not accidentally affect the incoming popup or make its entrance appear to repeat.
- Maintain continuous endpoints between effects and their destination UI elements.

## 5. Audio synchronization

- Attach sound cues to their visible events, such as transfer, impact, reward formation and landing.
- Stop continuous sounds when their action ends; avoid stacked loops and duplicate playback.
- Handle backgrounding, pause/resume, retry and gesture-based audio unlocking without breaking sequence timing.
- Music selection and playback behavior require this game's brief; do not inherit another game's soundtrack policy automatically.

## 6. Animation clocks and interruptions

- Pause and resume relevant gameplay time, animations and audio coherently, preserving the intended visual position.
- Cancel obsolete sequence work on exit/retry so it cannot reveal controls or trigger sounds on a later screen.
- Choose clock ownership deliberately. Do not blindly drive native CSS transitions with a custom frame clock: My Carz's opacity/filter transitions flickered when manually reset and advanced.
- Preserve the intended composition during interrupted entrances; avoid briefly exposing upcoming elements.

## 7. Configuration and module boundaries

- Plan an explicit game-owned configuration for questions/ratios, media mappings, timing stages, effect settings and audio volumes.
- Keep game rules separate from presentation, persistence and loading/cache responsibilities.
- Use named stages and understandable settings instead of scattering unexplained timing values through controllers.
- Keep scripts in `assets/solvent-master-game-scripts/` and media in `assets/solvent-master-game-assets/`. Copy agreed content into this game's ownership when implementation is authorized; do not introduce runtime coupling to Rocketier or My Carz.
- Exact module names and configuration schema remain implementation decisions pending the full brief.

## 8. Loading and verification

- Plan for production media readiness before enabling entry into sequences that require it, with real progress and recoverable loading errors.
- Synchronize runtime URL versions, scoped cache versions and generated media manifests when those systems are implemented or changed.
- Check full sequences, input gating, rapid interactions, interruptions and relevant landscape viewports.
- Verify affected motion visually and check audio synchronization. Logic/source tests alone do not establish smooth animation quality.
- Clearly distinguish source tests, browser-engine verification and physical-device audiovisual checks. Windows WebKit is not proof of physical iPhone behavior.
- Record authorized scope, files, timing/sequence changes, cache changes, checks and unresolved limits in [progress](solvent-master-game-progress.md).

## Reference lessons, not Solvent Master timings

| Source | Reviewed example | Lesson |
| --- | --- | --- |
| Rocketier | 1900ms docking travel → 200ms settle → 1500ms reading → 650ms nose opening → 900ms tank descent → attempt starts | One connected preparation sequence; full countdown starts afterward |
| Rocketier | Continuous liquid jets, surface response, animated digits and directional Fill/Undo trails | Feedback follows the action continuously |
| My Carz | Question entrance/reading, tunnel passage, diamond flight, celebration and scratch/reveal handoff | Distinct stages with deliberate attention and reward timing |
| My Carz | Native dim transitions and finale overlay moved behind the incoming modal | Correct clock ownership and layering prevent flicker/repeated-looking entrances |

These examples explain the expected quality. They do not prescribe rockets, cars, portrait layout, rewards or identical durations for this landscape game.

## Source references

- [Rocketier details](../rocket-game-scripts/rocket-game-details.md), [progress](../rocket-game-scripts/rocket-game-progress.md), [core/question definitions](../rocket-game-scripts/rocket-game-core.js) and [animation controller](../rocket-game-scripts/rocket-game.js).
- [My Carz details](../my-carz-game-scripts/my-carz-game-details.md), [progress](../my-carz-game-scripts/my-carz-game-progress.md), [configuration](../my-carz-game-scripts/my-carz-config.js) and [attention controller](../my-carz-game-scripts/my-carz-attention.js).

The source histories contain superseded decisions. Follow their current preservation rules and later approved clarifications when interpreting examples.
