# Rocket'ier context and progress

Last updated: 24 October 2026, after enlarging docked rockets and rebalancing the filling scene.

This is the continuation/handoff file for the Rocket'ier work. Read this first when conversation context is lost, then read `rocket-game-details.md` and the relevant source files. This document records decisions and observed progress; the working code and newer user instructions take precedence if they differ.

## Current status and authorization

The user originally requested analysis and clarification only. After resolving the gameplay rules, they explicitly instructed: “put all these in a seperate rocket-game-details.md file and start”. Implementation is authorized and underway. Subsequent turns have focused on matching supplied artwork and refining animations, typography, placement and responsiveness.

The user approved the continuous conveyor-to-pad animation. The nose hinge alignment is fixed. All five variant seams and nozzle insertion are implemented. The engraved recipe name is implemented. The latest change enlarges the solvent tanks, preserves the tube artwork aspect ratio, and fits Fill/Undo/Launch controls into their artwork panels. The earlier linear fade for unselected rockets remains. One assembled rocket grows/moves linearly, the same scenery zooms, the nose opens, and tanks descend in sequence. The filling scene retains the previous page-5 reference cleanup. The user explicitly requires this progress file to be updated after EVERY feature/change. Keep that requirement active in future turns.

No commit or deployment has been made during this work. Files remain in the local working tree. Do not reset unrelated changes or remove the user-supplied asset directory.

## Workspace and sources

- Workspace: `D:\laragon\www\aurobindo-pwa`.
- Shell: PowerShell; local project is a plain HTML/CSS/JavaScript PWA.
- User timezone: Asia/Calcutta.
- Original updated flow document: `C:\Users\Admin\Downloads\Rocket'ier Game Flow (2).docx`.
- Artwork: `assets/rocket-game-assets/`, organized as page-1 through page-8, including page-7-1/2/3.
- Recipe source: `liquid-sort.js` (the existing test-tube/liquid-sort game).
- User has an exported history open: `C:\Users\Admin\Downloads\rocketier-history-1792835316537.json`. Its contents have NOT been inspected during this work.
- The DOCX was read as ZIP/XML. It was open in another process, so extraction required a read-only FileStream with FileShare.ReadWrite. Its tables and flow were successfully read. Later user clarifications override conflicting document text.

## Working files

| File | Responsibility |
|---|---|
| `rocket-game.html` | All game screens, dialogs, tank/rocket containers and artwork references |
| `rocket-game.css` | Portrait layout, artwork positioning, screen effects, conveyor and boarding animations |
| `rocket-game.js` | DOM interactions, screens, timing presentation, animation sequencing, persistence, video provision and export |
| `rocket-game-core.js` | Pure game rules and state; UMD export for browser and Node tests |
| `rocket-game-details.md` | Agreed gameplay specification and subsequent visual decisions |
| `rocket-game-progress.md` | This context/progress handoff |
| `tests/rocket-game.test.cjs` | Rules tests |
| `tests/rocket-game-ui.test.cjs` | Mock-DOM integration tests with controlled timers |
| `index.html` | Added Rocket'ier card in Games gallery, using page-1 background as its poster |
| `sw.js` | PWA cache versions and precache entries for game code and runtime artwork |
| `package.json` | Added `check:rocket` and `test:rocket` scripts |

The stylesheet starts with older compressed rules followed by newer overrides. Search all occurrences before changing a selector; the later rules usually govern the current layout. Avoid assuming the first occurrence is the effective value.

## Agreed gameplay rules

The complete flow is opening -> mission brief -> mission popup -> choose rocket -> place rocket and prepare tanks -> fill mixture -> launch -> journey results -> next question, until enough distance is covered. At a destination, show mission results and advance to the next mission. After Neptune, show final completion.

### Recipes and controls

| Recipe | Water % | ACN % | MeOH % | Water / ACN / MeOH step size |
|---|---:|---:|---:|---|
| Column Cleaning | 90 | 5 | 5 | 30 / 5 / 5 |
| Strong Wash Solvent | 20 | 80 | 0 | 10 / 20 / 10 |
| Needle Wash Solvent | 50 | 0 | 50 | 25 / 10 / 25 |
| Column Storage (C18) | 30 | 70 | 0 | 15 / 35 / 10 |

- Recipes and increment algorithm match liquid-sort. They are copied into the core, not imported from liquid-sort's browser IIFE. A test checks that recipe values still match.
- Shuffle all four recipes per bag. Exhaust the bag before a new cycle. Never immediately repeat a recipe across bag boundaries.
- Wrong answers/timeouts intentionally retry the same question.
- Rocket designs are cosmetic choices and do not change stats.
- Hold Fill: one increment on press, then one every 350ms. Release/cancel/focus loss/screen change stops it. Keyboard activation adds one increment.
- Undo removes one increment of that specific solvent, bounded at zero.
- Cap total mixture at 100%. Enable Launch only at 100%.
- Correctness requires exact percentages. All current recipes use two or three solvents.

### Missions and travel

| Mission | Route | Distance | Base speed/progress | Baseline rockets | Stars | Attempt limit |
|---|---|---:|---:|---:|---:|---:|
| 1 | Earth -> Venus | 25,800,000 | 7,000,000 | 4 | 1 | 40s |
| 2 | Venus -> Mars | 74,400,000 | 16,000,000 | 5 | 1 | 36s |
| 3 | Mars -> Mercury | 105,600,000 | 20,000,000 | 5 | 1 | 32s |
| 4 | Mercury -> Jupiter | 447,800,000 | 70,000,000 | 6 | 1 | 28s |
| 5 | Jupiter -> Saturn | 407,000,000 | 70,000,000 | 6 | 2 | 24s |
| 6 | Saturn -> Uranus | 893,200,000 | 120,000,000 | 7 | 2 | 20s |
| 7 | Uranus -> Neptune | 1,009,000,000 | 140,000,000 | 7 | 2 | 16s |

Preserve the document's values without physical unit conversion. The user explicitly defined “MILLION KMS” as mission distance and “IN MILLION MILES” as rocket speed/base progress. The implementation displays distance in km and speed in miles; these are game values, not a physical travel simulation.

```text
timeSaved = max(0, attemptLimitSeconds - inputSecondsUntilLaunch)
engineFactor = 1 with 3 engines, 0.67 with 2, 0.34 with 1
speed = baseSpeed * engineFactor
calculatedDistance = speed * (1 + timeSaved / 100)
appliedDistance = min(calculatedDistance, remainingMissionDistance)
```

One second saved means one percentage point of extra distance, NOT a percentage of the time limit. Example: 40s limit, 29s used -> 11% extra; 7,000,000 becomes 7,770,000 with all engines. Fractional seconds are retained internally.

Baseline rocket counts are not hard limits. Fast answers can finish a mission in fewer questions; damage may require more. Mission completion is based on distance. Record calculated and capped/applied distance separately.

### Countdown, damage and retry

- Start the countdown only when the selected rocket is placed and tanks are ready for input.
- Preparation, page transitions, launch/journey animations and lesson videos consume no answer time.
- Timeout is a wrong answer and destroys one engine. A Launch at/after the deadline is a timeout even with a correct full mixture.
- Wrong mixtures NEVER launch or advance distance. The user's clarification overrides the document's ambiguous second-failure wording.
- First and second failure: red edge glow/smoke, lose engine, failure popup -> Watch video -> lesson or “Video coming soon” -> retry popup -> empty chamber and same question with full countdown.
- Damage persists across questions for the entire mission. Correct launches use the surviving engines and exact 33%/66% penalties above.
- Third failure: mission failed -> Retry Mission -> mission brief, reset distance and restore three engines.
- Next mission also starts with three engines.
- Stars are fixed completion awards, awarded once per mission, 10 total.
- Journey “time taken” currently means accumulated actual attempt input time; no separate simulated flight-time unit is defined.

## Visual decisions and completed revisions

The user wants a responsive portrait game on mobile, tablets and PC, smooth motion on every page, and close fidelity to supplied reference artwork. Avoid substituting generic cards when a matching supplied panel exists.

1. Opening screen: use page-1 artwork and start button. Removed the top Games/title/History bar and bottom “Resume Mission / stars” caption at the user's request. Progress still resumes automatically. Moved History download to mission completion.
2. Mission brief: use `page-2/mission=brief.webp` and start-mission button only. Removed the extra route/distance/timer/stars/instructions glass card. Artwork sits at top 25%, left 5%, width 90%; button at top 73%, left 20%, width 60%.
3. Mission popup: replaced the custom star and glass card with `page-3/mission-1.webp`. Use `page-3/page-3-reference.webp` as reference. Overlay dynamic mission number, route, distance and destination in its blank areas; Play sits inside the bottom of the panel. Background is softly blurred.
4. Mission popup typography: title 7cqw / weight 700; route 3.15cqw / weight 600; description 3.15cqw / weight 600, line-height 1.2, top 22%, left 3%, width 94%; highlighted values use weight 700. These replaced overly bold, narrow, lower text.
5. Page transitions: outgoing scene fades/scales/blurs for 220ms; cyan sweep and incoming fade/slide. Input is inert for the 700ms transition. Reduced-motion mode skips this decorative transition.
6. Conveyor prompt: follow `page-4/page-4-reference.webp`. One cyan inset-glow panel near the top says “Choose your rocket for this journey!”. Hide question name/number and HUD while selecting; reveal them during preparation. Removed duplicate “CHOOSE YOUR ROCKET” text above the belt.
7. Conveyor animation: use `page-4/conveyer-belt.webp`. Two identical runs of five rockets make a seamless 200%-width track. Belt and rockets move left to right by one stage width per 14 seconds against stationary scenery. Both use `assembly-right`, from translateX(-50%) to 0.
8. Conveyor movement fix: the user reported no movement. Removed rules that disabled motion for reduced-motion settings or paused it on hover/focus. Both now continue; reduced-motion slows this gameplay motion to 24 seconds per cycle. Only selecting a rocket deliberately pauses the belt.
9. Exact user-requested CSS values: `.rocket-track { bottom: 10%; }` and `.conveyor { bottom: 7.6%; height: 11%; overflow: hidden; }`. Preserve these unless the user changes them.
10. Latest: added the visible conveyor-to-pad boarding sequence described below.
11. Filling scene cleanup: use page-5-reference.webp as layout authority. Replace the CSS timer/engine boxes with timer.webp and engine-panel.webp. Remove the large glass question-card styling, route/question-number text, “Hold Fill / Undo / Launch” instructions, per-step captions and visible “% filled” caption. Retain a small recipe title, solvent names and digital percentages for playability. Chamber total remains as a screen-reader-only output. Raise the tanks/pipelines/chamber into the upper half and enlarge the rocket to the reference's lower half. Selection prompt/conveyor retain their previously approved positioning.

## Latest implementation: continuous rocket boarding

User feedback: the previous transition was raw/ugly and looked like images replacing one another. The requested behavior is for the small rocket to grow, move linearly to the pad and then open, as one continuous animation sequence.

Recording reviewed: `C:\Users\Admin\Videos\Screen Recordings\Screen Recording 2026-10-24 155937.mp4` (3.13 seconds, 30fps). OpenCV was available for read-only frame extraction. A temporary contact sheet showed the rocket appearing abruptly on the pad, followed by a larger split rocket/filling screen. The previous code skipped its movement and compressed all preparation to 500ms when reduced motion was enabled, consistent with the recording. The intermediate full-image to split-image handoff also changed geometry.

Current implementation in `prepare(button)`:

- Conveyor buttons now render `.rocket-model` from the same page-5 top/bottom assets used by `#pad-rocket`. Their shared geometry is fixed: nose top 1%, left 22%, width 56%, height 34%; body top 32%, width 100%, height 68%. This eliminates the shape change between page-4 whole-rocket art and page-5 parts.
- Freeze both conveyor layers on selection. Measure the clicked `.rocket-model`, reveal `#pad-rocket`, measure its final bounds, hide the source copy and animate the pad rocket from the source bounds to its destination.
- Use two transform endpoints with linear timing, 1900ms, transform-origin top left. No bounce, curved path, intermediate pad placement or second resizing step.
- The same scenery stays visible: `#hangar-closeup` now holds the page-4 planet background from the start. Animate its scale from 1 to 1.22, anchored top centre, concurrently with the rocket. Do not swap to a different page-5 background image.
- Unselected conveyor rockets fade out linearly over 450ms. The belt then fades over 1000ms with a 450ms delay. The selection prompt also fades during movement. Only the selected pad rocket grows/moves; its original conveyor copy is hidden immediately to avoid duplication. After arrival, preserve the final camera scale and reveal the HUD/compact recipe label.
- Settle for 200ms, open the same nose piece over 650ms, then reveal/descend the fuel system over 900ms.
- Start `game.beginAttempt()` only after the complete 3650ms sequence. Tank buttons stay disabled until then.
- Remove the former `#boarding-rocket` element and `.zooming` image-swap rules. There is one pad rocket throughout movement, opening, filling and launch.
- Keep this essential sequence visible even with reduced-motion preferences: no 500ms shortcut. Decorative screen effects remain subject to reduced motion. CSS explicitly preserves nose-opening/tank/HUD animation durations.
- Each new question resets scenery scale to 1 and the hangar classes; normal selection then repeats.
- `later()` still guards callbacks using `screenVersion`.

Validation after this revision: syntax checks and all 16 Rocket'ier tests (10 core, 6 UI) passed. A new test exercises the measured geometry/animation branch under reduced-motion settings, checks linear 1900ms travel, unchanged rocket-part sources, and the full countdown after preparation. The supplied recording was reviewed; the newly changed visuals have NOT yet been verified in a live browser.

## Previous feature: page-5 filling scene cleanup

Reference inspected: `assets/rocket-game-assets/page-5/page-5-reference.webp`. Also inspected timer.webp, engine-panel.webp, rocket-1-top.webp, rocket-1-bottom.webp and tank-tubes.webp.

- HUD: left 14%, width 68%, top 1.7%, height 6%, using supplied panel images. Three engine indicators remain because engine health is a gameplay requirement.
- Recipe title: compact, unboxed, at top 8%; keep it to identify the mixture being asked for. Hide route/question number and input instructions once selection ends.
- Fuel system: top 10%, left 14%, right 18%, height 42%; three tanks use a 1% grid gap.
- Pipelines: top 47% of fuel system, height 21%; chamber top 64%, left 5%, width 90% of fuel system.
- Removed generated step captions; input ARIA labels still explain each solvent's increment.
- Chamber-total output is visually hidden but still updated and available to assistive technology.
- Rocket and boarding zoom endpoint: left 28%, top 54%, width 44%, height 34%.
- Added vertical touch hit-area expansion around the smaller artwork-aligned Fill/Undo buttons.
- Changed files for this feature: HTML, CSS, browser JS, service worker, specification and this progress file.
- Validation: `npm run check:rocket` passed; all 5 UI mock tests passed, including the full-countdown-after-docking assertion. No actual browser visual verification was available.

## Responsive layout

The game uses a portrait container with `container-type: inline-size`, cqw typography and proportional positioning. Desktop/tablet width is constrained using viewport height, capped at 560px, with a 340px minimum where available. Stage minimum height is 640px; taller portrait geometry uses 177.778cqw. Short screens can scroll rather than clip controls. Journey results use natural flow; popups use dynamic viewport height and scroll.

These layouts were implemented and manually reviewed in source; actual browser/device rendering has not been verified by the assistant. User screenshots have guided iteration. Preserve the user's exact recent positioning overrides.

## Persistence and future database integration

- LocalStorage key: `aurobindo.rocketier.v1`.
- IndexedDB database: `aurobindo-rocketier`, version 1, object store `history`, key `state`.
- LocalStorage supports immediate resume; IndexedDB mirrors full snapshots and can recover them when no LocalStorage save was loaded.
- Schema version 1 includes player ID, latest unlocked mission, completed mission IDs, runs and update timestamp.
- Runs retain IDs, mission/configuration, timestamps, status, engine count, distance, total input time, question order, selections/events, awarded stars and unlocked mission ID on completion.
- Questions retain IDs, recipe ID/name/target and all attempts.
- Attempts retain IDs, rocket choice, timestamps, limit, events for every Fill/Undo with amounts and elapsed time, mixture, outcome, engine states, elapsed/remaining/saved time, bonus, calculated/applied/cumulative distance and speed.
- Reload marks unfinished runs/attempts interrupted. Resume starts the latest unlocked mission fresh, not an unfinished mixture. Historical data is retained rather than pruned.
- Export produces a `rocketier-history-<timestamp>.json` download. Its button is on mission completion.
- This is browser-local storage, not a connected DB. No server API or authentication linkage for this history has been implemented.
- Recipe video URLs are empty `video` fields in `rocket-game-core.js`. User will supply videos later. Keep the “Video coming soon” and retry path functional.

## Cache and launch commands

Current asset versions at this handoff:

```text
rocket-game.css?v=38
rocket-game.js?v=27
rocket-game-core.js?v=1
service worker cache: aurobindo-shell-v415
```

When changing CSS/JS, update references in BOTH `rocket-game.html` and `sw.js`, and increment the service worker cache. Verify the current versions first because subsequent turns may change them. Runtime artwork is already precached; reference images are generally not included.

```powershell
npm run dev
# Default server URL: http://localhost:4173/rocket-game.html
npm run check:rocket
npm run test:rocket
```

The Node test runner initially hit a sandbox `spawn EPERM` with isolated test child processes. Escalated runs worked. A later supported in-process command also worked without spawning children:

```powershell
node --test --test-isolation=none tests/rocket-game.test.cjs tests/rocket-game-ui.test.cjs
```

Follow the current session's permission instructions if a command is blocked; do not assume prior tool availability or approval rules remain unchanged.

## Verification record and limitations

- Initial syntax checks for the repo passed; Rocket'ier syntax has passed after all JS edits.
- Core rules tests passed, covering recipe cycling, exact recipe parity, increments, capacity, deadlines, failures/retries, speed penalties, bonuses, distance caps, unlocks, interruption and all seven missions through ten stars.
- UI mock tests cover correct launch/next question, timeout/video/retry, press-and-hold release, outgoing/incoming transition timing and latest docking sequence with a full countdown afterward.
- Latest commands: `npm run check:rocket` and `node --test --test-isolation=none tests/rocket-game.test.cjs tests/rocket-game-ui.test.cjs`; syntax passed and all 16 tests passed.
- Current files contain 10 core tests and 7 UI tests. The last full run was 16 tests before the variant/nozzle revision; the latest run passed syntax and all 7 UI tests, including all five nozzle geometries at two stage sizes.
- Earlier full repository run: 153 tests, 151 passed, 2 failed in untouched `tests/snake.test.cjs`: missing `beginTutorial` and missing `slitheringBody`. Do not fix unrelated Snake behavior without scope justification.
- Precache and HTML asset-existence checks previously found no missing files.
- Browser control was attempted via `cua.getBrowser({url: 'http://localhost:4173/rocket-game.html'})`; it returned “No browser is available”. No visual browser checks were completed. Playwright was not installed in the repo at that time.
- Mock-DOM tests verify behavior and timing, not CSS geometry, frame rate, rendering or actual Web Animations trajectories.

## Where to continue

There is no pending unanswered gameplay clarification. Follow the user's next requested refinement. If asked to verify or polish the newest sequence, prioritize a real browser check of the clicked rocket's initial coordinates, landing alignment, assembled rocket seams, zoom continuity, input lock and timer start. Check phone/tablet/desktop widths, reduced-motion behavior and whether the conveyor restarts properly for the next question.

Keep progress history intact while debugging. Avoid restoring the removed top bar, resume caption, extra brief card or custom mission popup. Update this file after meaningful changes so it remains useful for the next context window.

## Latest adjustment: attached rocket nose hinge

The user approved the movement sequence but reported that rocket-top was completely detached from rocket-bottom while open. Removed the nose's translate(32%, -16%) offset (and the earlier translated opening rule). Opening now rotates 28 degrees only, around a 92% / 94% origin near the right edge of the body's rim. Set the closed nose top to 1% for a small overlap at the joint. Both conveyor and pad use this same part alignment. Keep the opening animation and all movement timings unchanged.

This was a CSS-only geometry fix plus cache/spec updates; reviewed both opening rules and checked service-worker syntax. No additional gameplay tests were required; live visual confirmation of the hinge is still pending.

## Latest adjustment: fade unselected rockets on selection

On click, `.boarding .rocket-choice` fades opacity to zero over 450ms with linear timing. The selected conveyor copy is already hidden immediately when the continuous pad rocket takes over at its exact bounds. The belt fades separately over 1000ms after a 450ms delay. Removed the previous whole-conveyor 1400ms fade, which left the other rockets visible too long. No unselected rocket zooms or travels; only the chosen rocket performs the existing docking sequence. Explicit transition durations preserve this behavior under reduced-motion settings.

CSS-only change, plus cache/specification updates. Service-worker syntax checked; no new gameplay tests needed for opacity timing. Live visual verification remains pending.

## Latest feature: all variant seams, wider opening and nozzle insertion

The user requested correct top/bottom placement for every rocket, a much wider nose opening, and the mixing chamber tube entering the rocket rather than hanging above it.

- Inspected all ten source top/bottom images, including their actual rim/edge coordinates. The yellow and purple top images contain unequal transparent side space, so a shared percentage layout was incorrect.
- Each conveyor `.rocket-model` and the selected `#pad-rocket` now has `data-variant=1..5`. CSS assigns variant-specific model ratio, nose position/size and hinge coordinates. Body remains top 32%, height 68%; use the source CSS for exact per-variant percentages. These replace the previous common 1% / 22% / 56% / 34% nose geometry.
- Nose opens to 100 degrees, around the measured right-rim joint. This replaces the prior 28-degree rotation while preserving the 650ms opening duration.
- Fuel assembly stays 68% wide, starts at stage top 10%, and is centred on the actual mouth X coordinate (not a universal 50% assumption). The yellow rocket's mouth is slightly left of centre.
- `alignFuelSystem()` sizes the assembly height so the chamber outlet ends at the measured mouth Y plus 0.6% of stage height, visibly entering behind the rim. The chamber is anchored to the bottom of the assembly.
- Pipelines stretch from the tank outlets to the chamber inlet using untransformed layout offsets. Alignment runs when the tanks are revealed and on window resize; hidden scenes are ignored.
- Fuel-system descent uses backwards fill rather than forwards/both so its completed animation does not override the existing launch retraction transform.
- Existing source assets remain unchanged. Diagnostic closed/open composites of all five variants were rendered to a temporary file and visually inspected: seams align and noses pivot at the right rim. This was an asset-geometry preview, not a live browser screenshot.
- Validation: syntax passed; all 7 UI tests passed. The new geometry test checks all five variants at 320px and 560px stage widths, including nozzle centring, insertion depth and pipeline length. Live browser verification remains pending.
- Current cache: CSS v16, JS v10, core v1, service worker v392.

## Latest feature: engraved recipe/model name on the rocket

The user requested moving Column Cleaning / Strong Wash Solvent / etc. from the top of the screen into the rocket body panel between its four screws, with an embedded model-name effect.

- Moved the existing `#question-title` h1 into `#pad-rocket`; the hangar's accessible label still references it. The former top question container is hidden after selection.
- `.rocket-model-name` is centred on the body's existing metal panel, with per-variant adjustments for the blue, green and yellow body plates. No added card/background; dark slate uppercase lettering and fine light/dark bevel shadows suggest engraved metal. Font scales with the portrait container and long recipe names wrap.
- Hide the label whenever a new question is prepared. Reveal it only after the 1900ms travel and 200ms settle, fading in over 450ms as the nose starts opening. It is absent on the conveyor and during transit.
- Validation: syntax passed and all 7 UI tests passed. Docking test now also checks that the title remains hidden through travel and appears after settling. Actual browser typography/placement remains unverified.
- Cache: CSS v17, JS v11, core v1, service worker v393.

## Latest feature: larger tanks, natural tube proportions and fitted controls

The user reported excessively stretched tank-tubes and requested larger solvent tanks plus properly fitted Fill, Undo and Launch buttons.

- Fuel assembly width is now 84% of stage width (was 68%), still centred on the variant-specific rocket mouth and ending at the same insertion depth.
- Tube image dimensions are 636x186. `alignFuelSystem()` now derives tube height from its rendered width using that native aspect ratio. It positions the short tube set above the chamber, then increases the tank row height to fill the remaining upper space. Tank cylinders grow in both width and height instead of leaving long stretched pipes.
- Tank layout uses the calculated row height. Fill/Undo controls sit at top 74.5%, left/right 9%, height 13.7% of each tank, with equal-width buttons and a 2% gap. The image buttons fill their slots; transparent hit-area expansion remains.
- Launch button is centred inside the mixing chamber at left 25%, top 28%, width 50%, height 40%, with contain fitting to preserve its artwork proportions.
- Validation: syntax and all 7 UI tests passed. The geometry test now checks native tube aspect ratio, tank-row height and nozzle alignment for all five variants at 320px/560px stage widths. Live browser verification remains pending.
- Cache: CSS v18, JS v12, core v1, service worker v394.


## Latest feature: connected animated fuel station (supersedes earlier tank geometry)

- Source tanks now use their native 989:1591 aspect ratio, with a 94%-wide fuel assembly and 1.2% gaps. Width and height scale together. Assembly position is calculated upward from the measured rocket mouth; the chamber outlet still inserts 0.6% of stage height into that opening.
- Replaced the fixed tube bitmap with inline SVG curved metallic pipes. Each pipe starts at its tank outlet (97.2% of tank height) and ends at its corresponding chamber inlet. Geometry recalculates on resize for all five rocket variants; no stretched tube image or disconnected inlet gaps.
- Water, ACN and MeOH use the active liquid-sort colours #00cfff, #b627ed and #ffbf25. Source reservoirs begin at 100%; the digital display shows remaining percentage and a separate caption shows percentage added to the chamber.
- Persistent source/chamber liquid elements animate height over 600ms instead of being rebuilt. Glass overlays stay above the liquids; subtle surfaces/bubbles give the liquids motion. Fill runs coloured downward pipe flow; Undo reverses the same pipe and restores the source quantity while reducing the chamber layer.
- Transfers settle after 650ms from the last input. Launch remains disabled during transfer and activates with a pulsing glow/ring only at 100%. Existing hold cadence, recipe increments, capacity, answer validation and timing rules are retained. Timeout/retry/new question clear pending flow animations.
- Tank names now have larger high-contrast labels; source remaining and dispensed quantities are separate. Fill/Undo artwork uses contain fitting, and Launch remains centred within the chamber.
- Rocket question lettering is larger, darker and embossed with layered highlights/shadows, with per-variant placement. It still appears only after docking. Nose rotation increased from 100 to 168 degrees around the measured hinge to clear Launch.
- Validation: syntax check and all 18 tests passed (10 core, 8 UI). Coverage includes five variants at 320/560px widths, natural tank proportions, outlet/inlet path endpoints, source/chamber quantities, matching colours, reverse Undo flow and delayed Launch readiness. Source image transparency was checked. Live browser rendering could not be verified: the available computer tool returned no browser surfaces.
- Cache: CSS v19, JS v13, core v1, service worker v395.


## Latest refinement: dispensed displays and clearer fuel flow

- User correction: digital displays start at 0% and show the amount dispensed (including Undo reductions), while physical source liquid levels still begin full and drain. Removed the separate ?0% added? captions entirely.
- Water / ACN / MeOH labels are larger, bold white lettering with a fine dark shadow for contrast over all three colours. Removed the dark rectangular background.
- Fill/Undo slots expanded from 82% to 92% combined tank width and from 13.7% to 18% tank height, positioned at top 72%. Image proportions and expanded touch targets are retained.
- Active pipes now show a continuous coloured liquid core with bright moving highlights. Undo reverses the highlights; idle pipes return to dark interiors. Chamber layers have animated surface highlights and stronger mixing bubbles during transfer. Source/chamber height transitions remain continuous.
- Validation: syntax check plus all 18 core/UI tests passed; transfer test verifies dispensed counter changes and pipe core activation/reset. Live browser visual verification remains pending.
- Cache: CSS v20, JS v14, core v1, service worker v396.


## Latest refinement: unobstructed chamber, question reveal, fitted controls

- Launch uses the hidden attribute until the mixture is full and transfer has settled. It disappears immediately when unavailable, leaving the chamber visible during filling. Initial HTML also hides it.
- Inspected all five rocket body images together. Reduced the question box to the actual screw-panel interior (roughly 33% left, 48% top, 34% width, 16% height of the assembled rocket, with variant overrides). Previously its 25%-high box centred text too low, near the fin. Text retains embossed styling and uses a smaller responsive font to fit within the screws.
- After docking, the question rises/scales gently into place with two cyan outline pulses. The accessible announcement explicitly calls out the fuel formula at that point. Countdown/docking sequence unchanged.
- Fill/Undo visible artwork now occupies matched slots at tank top 73%, height 15%, left/right 8%, gap 4%. Compensated for different transparent asset margins: Fill bounds (17,38)-(387,245) in 400x280; Undo bounds (14,17)-(397,242) in 400x255. This aligns visible edges without letting Undo spill outside its metal panel. Added pressed feedback.
- Validation: syntax and all 18 tests pass, including hidden Launch before readiness, shown at readiness, and hidden after Undo. Asset geometry inspected; live browser rendering remains unverified.
- Cache: CSS v21, JS v15, core v1, service worker v397.


## Latest fix: Launch tap interception

- The pad rocket has z-index 6 above fuel-system z-index 3. Its transparent rectangular bounds overlap the chamber, intercepting pointer input before it reaches Launch.
- Added pointer-events:none to the decorative .pad-rocket layer (inherited by its artwork, title, flames and smoke). Conveyor selection remains interactive. Launch readiness and submit logic unchanged.
- Validation: syntax and all 18 tests pass, including correct submission and journey transition. Tests do not exercise browser hit-testing; live pointer verification remains pending.
- Cache: CSS v22, JS v15, core v1, service worker v398.


## Latest feature: docked fire and individual engine blowout

- Three independent exhausts use the supplied gifs/Fire Loop.gif. They fade in after docking and stay attached to the rocket during launch. Positions follow the left, centre and right nozzle mouths, including blue/yellow offsets. Flames render behind the rocket body and ignore pointer input.
- Inspected source GIF metadata: Fire Loop has 4 frames / 400ms, infinite loop. Engine Blown has 7 frames / 360ms, infinite loop, with the first six frames lasting only 10ms each.
- Decoded the original Engine Blown GIF frames without altering artwork into gifs/engine-blown-frames.webp (seven horizontal frames). CSS plays this sheet once over 700ms, avoiding uncontrolled GIF looping/restart behaviour. The blowout fades in as the failed flame shrinks, then smoke fades away by 880ms. Failure popup now waits 1000ms.
- engines(blownIndex) marks only the newly failed engine as blowing. Other working engines continue burning, and previously failed engines stay off across retries/questions. Existing engine indicators remain synchronized with the same index. Wrong answers and timeouts share this sequence; correct launch keeps surviving flames. Removed the old whole-rocket smoke effect.
- Validation: game/service-worker syntax passed; all 19 tests passed (10 core, 9 UI), including three successive engine losses, one-shot state cleanup, surviving fires and damage persistence on retry. Browser rendering/visual timing remains unverified in this session.
- Cache: CSS v23, JS v16, core v1, service worker v399. Fire GIF and derived blowout frames are precached for offline use. Original GIFs remain unchanged.


## Latest fix: exhaust coordinate space

- User screenshot exposed flames beside the rocket body. Root cause: the original .flames height:40% survived the newer inset:0 override. Thus exhaust top percentages were calculated against 40% of the rocket height.
- Explicitly set .pad-rocket .flames width and height to 100%. Nozzle offsets now use the full assembled rocket coordinate space.
- Centre each flame on its nozzle with translateX(-50%) and variant-specific left/centre/right and vertical anchors, including the yellow rocket's off-centre middle engine. The body remains above the flames to conceal their roots inside the outlets.
- Cache: CSS v24, JS v16, core v1, service worker v400. Live browser visual verification remains pending; this fix is based on the screenshot and source/CSS geometry.


## Latest adjustment: foreground fire layer

- Per user request, moved .pad-rocket .flames from z-index -1 to 3, above the body and nose artwork. Flame/nozzle coordinates and animation timing are unchanged; pointer input still passes through.
- Supersedes the earlier instruction to render flame roots behind the body.
- Cache: CSS v25, JS v16, core v1, service worker v401.


## Latest adjustment: variant-specific silver exhaust mouths

- Inspected the five body images side by side and anchored flames to the silver outlet centres, not the coloured fins/boosters. Converted body coordinates into assembled rocket coordinates (body top 32%, height 68%).
- Yellow side flames move substantially inward to 27% and 67.5% X; centre is 46% X. Side Y 89.51%, centre Y 95.92%.
- Green side flames move inward to 20.5% and 79.5% X and down to 91.26% Y; centre Y 96.31%.
- Red side mouths: 15%/84.5% X, 88.15% Y; centre Y 96.5%. Blue: 17.5%/82.5% X, 87.57% Y; centre Y 92.23%.
- Purple unchanged. Foreground layering, blowout sequence and interaction logic unchanged. Alignment based on source artwork and supplied screenshots; live rendering remains unverified.
- Cache: CSS v26, JS v16, core v1, service worker v402.


## Latest adjustment: centre Launch in chamber glass

- Inspected container.webp: the glass interior is centred near 41% of the full image height because the outlet extends below the vessel. Moved Launch from top 28% to 21% with its existing 40% height, centring it vertically at 41%. Horizontal centre remains 50%.
- Readiness visibility and pulse animation unchanged. Cache: CSS v27, JS v16, core v1, service worker v403.


## Latest feature: prominent aborted launch

- Wrong answers/timeouts now play a 3-second aborted launch: fuel system clears upward and nose closes, rocket lifts slightly, damaged engine blows at 1150ms with a larger plume and red failure effect, rocket wobbles and settles back onto the pad, then nose/fuel station return.
- Engine icon/fire loss is visually synchronized with the blowout; actual game outcome and engine count remain recorded immediately. Surviving flames keep burning. Failed launches still award no travel and consume no extra question time.
- Failure popup waits until 3100ms, after landing, rather than obscuring the animation. Screen-version guarded callbacks prevent stale scene actions.
- Validation: syntax and all 19 tests passed. Success launch unchanged; failure test checks pre-blowout lift state, delayed blowout, extinguished engines and completed landing across all three losses. Live visual verification remains pending.
- Cache: CSS v28, JS v17, core v1, service worker v404.


## Latest adjustment: artwork-only engine failure popup

- Engine failure panel now displays only popup-art and popup-action. Hidden title/text are reset for other dialogs, including video and retry. The dialog retains an accessible name.
- Cache: CSS v28, JS v18, core v1, service worker v405.


## Latest adjustment: purple rocket exhaust alignment and scale

- Inspected rocket-5-bottom.webp (507x468). Silver outlet centres are approximately (107,405), (253,440), (400,405). Converted these into assembled-rocket coordinates instead of using the old generic 13%/87% side positions.
- Purple side flames now centre at 21.1%/78.9% X, 90.85% Y; middle at 49.9% X, 95.93% Y. Side flames are 20% wide/30% tall; the larger central exhaust uses 25%/34%.
- Only purple geometry changed. Foreground layering and engine-loss sequencing retained. Source geometry inspected; live browser verification remains pending.
- Cache: CSS v29, JS v18, core v1, service worker v406.


## Latest feature: centred engine-failure overlay matching reference

- Inspected page-7-1-reference.webp, engine-failed-panel.webp and watch-video-button.webp. Engine failure now uses the red panel alone, with the supplied Watch Video artwork positioned inside its lower area. Removed outer blue dialog chrome for this popup only.
- Native modal dialog remains for focus/input handling; its fixed bounds track the live hangar rectangle on open, resize and scroll. The game remains visible behind a soft blur confined to the game screen; no separate scene is loaded.
- Panel uses a 650ms scale/slide settle entrance, backdrop fades in, and action fades in with a short delay. Title/text remain hidden. Other dialogs retain their existing presentation.
- Validation: syntax and all 19 tests pass. Live browser rendering remains unverified.
- Cache: CSS v30, JS v19, core v1, service worker v407.


## Latest feature: larger docked rockets and adjusted fuel station

- Reviewed page-5-reference.webp. Increased assembled docked rocket width/height by 20%: left 23.6%, top 47.2%, width 52.8%, height 40.8%. Bottom remains at 88% of stage height so it stays on the pad. Conveyor models retain their existing size; docking measures the larger destination automatically.
- Fuel assembly width reduced from 94% to 86% to maintain HUD clearance above the higher rocket opening. alignFuelSystem derives the chamber/nozzle insertion, proportional tank dimensions and curved inlet pipes from the larger body's measured mouth, including variant-specific offsets.
- Engine positions remain relative to the enlarged rocket, scaling the fire and blowout effects with it. Purple central flame height adjusted from 34% to 29% of rocket height to prevent clipping below the scene. Other nozzle anchors unchanged.
- Increased embossed question font proportionally to fit the larger body panel. Nose opening, fake-launch sequence and normal launch continue using the same assembled rocket.
- Validation: syntax plus all 19 tests passed. Nozzle/tank/pipe geometry now covered for all five variants at 320, 390 and 560px stage widths with the enlarged body bounds. Live browser rendering remains unverified.
- Cache: CSS v31, JS v20, core v1, service worker v408.


## Latest adjustment: slightly larger rockets

- Increased docked size another ~6% to width 56%, height 43.3%, left 22%, top 44.7%. Pad baseline remains 88%.
- Fuel assembly now 84% wide to preserve clearance above the higher mouth. Pipe/nozzle and exhaust positions continue scaling with the model. Updated geometry fixtures.
- Cache: CSS v32, JS v21, core v1, service worker v409.


## Latest feature: full upward successful launch

- Correct answers close the nose and retract the fuel station, with 900ms clearance before ascent. Surviving engine flames extend for thrust; failed engines remain extinguished.
- Rocket accelerates straight upward over 2.6 seconds to -330% of its own height, taking the entire rocket and exhaust beyond the top edge without shrinking or fading it away.
- Journey screen waits until 3700ms, after the rocket clears the scene. Scoped animation rules preserve the full ascent despite general reduced-motion overrides.
- Validation: syntax and all 9 UI tests pass. Success test verifies the launch class and that the hangar remains visible through ascent before the journey transition. Live visual verification pending.
- Cache: CSS v33, JS v22, core v1, service worker v410.


## Latest feature: blackout and intermediate flight cinematic

- After the successful hangar ascent, fade the scene to black over 800ms. Switch directly to the cinematic under full black, bypassing the usual screen sweep so no flash interrupts the blackout.
- Added a clean black cinematic screen with no HUD/text/controls. The same selected rocket variant enters from below, decelerates into screen centre, holds for about 2.6 seconds with mild 1px/.35-degree turbulence, then strengthens its exhaust and accelerates fully beyond the top edge.
- Preserves working/dead engine appearance. Uses nested movement/hover containers so vibration does not interfere with the continuous flight path. Cinematic duration is 8 seconds including empty lead-in and clear-screen pause; results follow only afterward.
- Existing time/distance/history calculations remain unchanged; animations happen after submission. All callbacks retain screen-version cancellation guards.
- Validation: syntax and all 9 UI tests passed. Success test checks blackout, cinematic visibility, hover, acceleration and delayed results. Live browser rendering remains unverified.
- Cache: CSS v34, JS v23, core v1, service worker v411.


## Latest refinement: vertical flight parallax and shorter hover

- Added two seamless downward-scrolling star layers to the intermediate flight scene: distant small stars move slowly; nearer elongated stars move faster. Layers fade in from black and brighten during the boost, while staying behind the rocket.
- Reduced centre hover from approximately 2.6 seconds to 1 second. Cinematic now lasts 6.5 seconds overall; entry and accelerated exit remain smooth. Updated timing assertions.
- Validation: syntax and all 9 UI tests passed. Live visual verification pending.
- Cache: CSS v35, JS v24, core v1, service worker v412.


## Latest feature: page-6 results reference layout

- Inspected Downloads/rocket-game-assets/page-6/page-6-reference.webp and existing local details-panel.webp. Results now use the reference's lower-left hovering rocket, lower-right heading/four-row panel, and supplied Continue Mission button artwork.
- Existing mission-specific page-6-bg-1.webp through page-6-bg-7.webp selection remains driven by mission.id + 1. Background fills the portrait stage without cover-cropping. Planet trail and planet names already in the background are no longer overlaid with duplicate visible route text.
- Four dynamic values populate the panel below its baked labels: distance this launch, overall distance remaining, time saved and rocket speed. Full elapsed/bonus/mission history remains in the data model. Progress/route elements remain accessible but visually hidden.
- Continue keeps the existing next-question / mission-results routing. Added subtle rocket hover and panel entrance animation. Responsive positions use percentages and container-relative type sizes.
- Validation: syntax and all 9 UI tests pass. Live browser visual verification remains pending.
- Cache: CSS v36, JS v25, core v1, service worker v413.


## Latest feature: readable results and distance-driven planet route

- Replaced tiny baked panel labels with responsive HTML label/value rows inside a taller cyan-framed panel. Reused the four supplied icons by cropping the details-panel artwork in CSS. Corrected heading/panel/button placement and spacing; values no longer sit on dividers or outside the panel.
- Added a curved dotted SVG route from origin planet (20%,83%) to destination (81%,23.5%). A glowing covered segment and rocket move together after screen entrance.
- Each launch starts at (mission distance already travelled minus this launch's applied distance) / total distance, ending at cumulative / total. A sampled arc-length lookup maps distance fractions along the curve. The rocket rotates along its tangent, moves for 2600ms after a 700ms entrance delay, and pulses gently on arrival. At 100%, it reaches the destination planet.
- Continue is disabled until route movement finishes. Screen-version guarded callbacks prevent stale updates. Distances, bonus and damage calculations unchanged.
- Validation: syntax and all 10 UI tests pass, including cumulative progression across questions, route timing and exact destination arrival on mission completion. Live browser visual verification pending.
- Cache: CSS v37, JS v26, core v1, service worker v414.


## Latest adjustment: artwork-only retry popup

- Retry now shows only the yellow retry artwork and Retry button. Removed duplicate title/description and outer blue card chrome. Dialog retains an accessible name; other popup modes reset correctly.
- Cache: CSS v38, JS v27, core v1, service worker v415.
