# AB Express gameplay and presentation standard

The approved flow in [game details](ab-express-game-details.md) governs behavior. The original [source document](docs/AB%20Express%20Game%20Flow.docx) and supplied references guide composition; later user clarifications take precedence.

1. Match supplied art, proportions and placement. Independent elements must not stretch, overlap copy, cover controls or escape the portrait frame. Respect device safe areas.
2. Load and validate required media before enabling entry. Show real progress in the Next area and provide retry on failure. Retain the outgoing view until incoming artwork is ready.
3. Sequence entrance, reading, arrangement, submission, checking, feedback and continuation deliberately. Lock conflicting controls; reject duplicate submissions and stale callbacks.
4. Keep movement continuous, with stable artwork and attachment points. Use a shared elapsed animation clock for train motion; pause presentation and gameplay time together during interruptions.
5. Check compartments in submitted order and stop at the first error. Correct steps receive ticks and confetti; an incorrect step receives crash/smoke feedback. Preserve deliberate feedback holds.
6. Support touch dragging, cancellation, tap reordering and keyboard input without duplicating or losing steps. Text must remain readable on phones.
7. Each challenge round has a 90-second countdown, counting active arrangement only. Timeout before submission follows the failed-round flow and resets the streak. Stop counting on submission; pause during backgrounding/orientation prompts. Practice has no timer or points.
8. Persist demo completion, earned stars, challenge order and completed streaks. An unfinished current bucket restarts from its beginning. Saving errors must be visible and recoverable.
9. Audio must follow the game's approved sound brief and visible events. Avoid stacked loops, abrupt music changes and disproportionate cue volumes. Use the supplied AB Express menu/gameplay/wrong-answer tracks and the approved generated UI button sound.
10. Preserve effect duration, intensity and continuity across device settings. Do not suppress animations through global reduced-motion or mobile overrides without explicit approval.
11. Keep rules, configuration and presentation understandable and isolated from other games. Record approved scope, changes, checks, cache updates and pending work.
12. Validate complete flows, first-error behavior, repeated input, interrupted attempts, responsive bounds and browser rendering. Source tests and desktop WebKit do not prove physical iPhone/Android performance.

These standards carry forward the user's Rocketier, My Carz and Solvent Master expectations; they do not copy those games' mechanics, orientation or sound policies.

13. Client-supplied instruction text must be displayed verbatim in every mode, including comparison. Do not shorten, paraphrase or substitute labels to improve layout. Adjust presentation only unless the user explicitly supplies approved replacement wording.

14. Practice assigns buckets 1, 2, 3, 4, 5 in order, without a selector. Failure retries the same bucket; successful Next starts the following bucket. After bucket 5, Next returns Home.

## Shared step pool - 4 November 2026 (supersedes fixed buckets)

The approved revised 17-step list in config.steps replaces the fixed bucket definitions for gameplay. Each round selects eight unique steps, exactly one from the first three and seven from the remaining fourteen. Correct order follows the master list; presentation is shuffled. Five distinct selections form a practice/challenge run; individual steps may repeat between rounds. Practice retries the same selection until success, then Next advances, returning Home after five. Challenge retains 90 seconds, five consecutive successes, failure reset with a different selection, and saved streaks. Existing saved bucket-based runs migrate to fresh selections while retaining completed streaks, stars and demo status. Learning artwork remains unchanged by this runtime update.
