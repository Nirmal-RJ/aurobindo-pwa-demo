# Rocket'ier game details

Agreed specification, 24 October 2026. The updated Rocket'ier Game Flow (2).docx and subsequent user clarifications govern this implementation; clarifications override conflicting document text.

## Screens and presentation

Add a Rocket'ier card to the Games page. Use assets/rocket-game-assets. Present a responsive portrait game on phones, tablets and desktops, with scrolling when needed rather than clipped controls. Animate every screen: ambient stars, popup entrances, moving conveyor, rocket selection, zoom, descending tanks, opening rocket nose, liquid/pipelines, failures, launch flames, parallax journey and completion. Respect reduced-motion preferences. Use supported-device haptics for buttons, launch and failure.

Opening-screen revision: remove the top navigation/title/history bar and bottom Resume Mission/stars caption. Keep automatic progress resume. History download is available on the mission completion screen. Fit the portrait stage to desktop/tablet viewport height; use proportional gameplay positions and allow scrolling on short screens. Journey results flow naturally so their action button cannot be clipped.

Mission-brief revision: show only the supplied mission brief artwork and Start Mission button over the background, matching the page-2 reference. Remove the additional mission route, distance, timer, stars and input-instructions card. The following mission popup still identifies the current mission and route.

Mission popup uses page-3/mission-1.webp as its panel artwork, matching page-3-reference.webp, with dynamic mission number, planet route, distance and destination overlaid in the blank artwork areas. Position the Play asset inside the panel's bottom area. Remove the custom star and glass card; softly blur the space background behind the panel.

Screen transitions: fade and zoom the outgoing screen for 220ms, sweep a soft cyan light across the stage, then fade/slide the incoming screen into place. Lock interaction during the 700ms transition to prevent duplicate navigation. Filling countdowns begin only after rocket preparation, never during page transitions. Reduced-motion mode switches screens immediately and suppresses decorative motion.

Conveyor selection follows page-4-reference.webp: one cyan inset-glow prompt at the top reads “Choose your rocket for this journey!”; question details and engine/timer HUD appear after selection. Position rockets on the foreground belt near the bottom. Two identical five-rocket groups and the repeating conveyer-belt.webp surface move left to right at the same speed (one stage width every 14 seconds), looping seamlessly against stationary hangar scenery. Keep both layers moving on hover and focus. In reduced-motion mode, retain this gameplay motion at a gentler synchronized speed of one stage width every 24 seconds; decorative effects remain suppressed.

Rocket selection transition (revised after reviewing the user recording): use identical assembled page-5 top/bottom rocket parts on the conveyor and on the pad. On selection, freeze the belt and move/grow the rocket from its measured conveyor bounds straight to its final pad bounds over 1900ms with linear interpolation. Simultaneously zoom the same page-4 scenery to 1.22x around its top centre; never replace the background or rocket art mid-sequence. Settle for 200ms, open the nose over 650ms, then lower the tanks over 900ms. Only then start a fresh full countdown (3650ms preparation total). This essential gameplay motion stays visible even under reduced-motion settings, per the user request for a continuous sequence. Decorative effects can still be reduced.

Filling scene revision: follow page-5/page-5-reference.webp. Use the supplied timer.webp and engine-panel.webp at the top. Remove the large question-card styling, route/question number, input instructions, per-step captions and visible chamber-total caption. Keep a compact recipe name, solvent names, digital contributions, countdown and engine indicators so the challenge remains understandable. The chamber total remains available to assistive technology. Tanks start at 10% of the stage; the fuel system occupies 68% of its width and 42% of its height. Enlarge the rocket to left 28%, top 54%, width 44%, height 34%, and match the boarding zoom's endpoint to that placement.

Maintenance requirement: update rocket-game-progress.md after each feature/change, including validation results and cache versions.

Opening → Start → mission brief image and dynamic mission details → Start Mission → mission-number popup → Play → conveyor selection → launch pad preparation → filling → Launch. Each subsequent successful question returns to the conveyor until the destination is reached.

## Recipes and input

Use liquid-sort's four recipes and exact percentage validation:

| Recipe | Water | ACN | MeOH | Fill/Undo increments respectively |
|---|---:|---:|---:|---|
| Column Cleaning | 90 | 5 | 5 | 30 / 5 / 5 |
| Strong Wash Solvent | 20 | 80 | 0 | 10 / 20 / 10 |
| Needle Wash Solvent | 50 | 0 | 50 | 25 / 10 / 25 |
| Column Storage (C18) | 30 | 70 | 0 | 15 / 35 / 10 |

Shuffle a bag of all four recipes; exhaust each bag before another loop. Prevent immediate repetition across bag boundaries. Wrong answers and timeouts repeat the same recipe. Rockets are cosmetic choices only.

Hold Fill to repeatedly dispense that solvent's liquid-sort increment; release stops. A tap adds one increment. Undo subtracts the same solvent's increment, bounded at zero. Never exceed chamber capacity of 100%. Display each solvent contribution digitally. Launch is enabled only at 100%; answers require exact ratios using two or three solvents.

Implementation cadence: one Fill step immediately on press, then one step every 350ms while held. Pointer release, cancellation, focus loss and screen changes stop filling. Keyboard activation adds one step.

## Missions and travel

| Mission | Origin → destination | Distance | Base rocket speed/progress | Baseline rockets | Stars | Seconds per attempt |
|---|---|---:|---:|---:|---:|---:|
| 1 | Earth → Venus | 25800000 | 7000000 | 4 | 1 | 40 |
| 2 | Venus → Mars | 74400000 | 16000000 | 5 | 1 | 36 |
| 3 | Mars → Mercury | 105600000 | 20000000 | 5 | 1 | 32 |
| 4 | Mercury → Jupiter | 447800000 | 70000000 | 6 | 1 | 28 |
| 5 | Jupiter → Saturn | 407000000 | 70000000 | 6 | 2 | 24 |
| 6 | Saturn → Uranus | 893200000 | 120000000 | 7 | 2 | 20 |
| 7 | Uranus → Neptune | 1009000000 | 140000000 | 7 | 2 | 16 |

Preserve document values without unit conversion. Document MILLION KMS means mission distance; IN MILLION MILES means rocket speed/base distance per correct launch. These are game values, not physical simulation units. Baseline rockets are not question limits.

Time saved = max(0, attempt limit − filling time until Launch). Each saved second gives one percentage point of bonus distance. Preserve fractional seconds internally. Engine factor is 1 with three engines, 0.67 with two, 0.34 with one. Launch distance = base progress × engine factor × (1 + time saved / 100). Cap applied distance at remaining mission distance and record both calculated and applied distance. Reach destination to finish, potentially in fewer questions with bonuses or more with damage. Journey displays launch distance, cumulative distance, remaining distance, speed, time taken and time saved. Time taken means actual accumulated attempt input time, excluding animations/videos.

## Timing and failure

Countdown starts only after the selected rocket is placed and tanks are ready for input. Ends at Launch; preparation, launch/journey animations and videos do not consume it. Deadline is strict; timeout equals wrong answer. Retry empties the chamber and gives the same question its full countdown.

Each wrong answer/timeout destroys one engine. Show smoke, extinguished flame, red edge glow and a grey engine indicator. Wrong answers never launch. First and second failures → failure popup → Watch Video → video or Video coming soon provision → Retry popup → same question. Video configuration is per recipe and can be supplied later. Third failure → mission failed → Retry Mission → mission brief; reset distance and restore three engines. Damage persists across questions in a mission. Correct answers launch with surviving engines. New missions also start with three engines.

## Completion and persistence

Award each mission's fixed stars once, ten total. Completion shows distance, time and Next Mission; update mission number, origin/destination and background. After Neptune show final completion. Resume from the latest unlocked mission brief with a fresh mission run, not a partially filled attempt. Keep previous history on restart and completion.

Version storage for future database integration. Track stable run/question/attempt identifiers, mission configuration, recipe order, timestamps, selected rockets, every Fill/Undo event including actual amounts and elapsed time, mixture submitted/target, outcome, timeout, engines before/after, elapsed/remaining/saved time, calculated/applied travel, mission distance, run status, stars and unlocks. Record interrupted attempts/runs on returning. Provide JSON export and report persistence errors visibly; never intentionally prune history. Local browser storage is the initial persistence layer, not a connected database.

## Implementation and verification

Game rules live in rocket-game-core.js; browser presentation in rocket-game.js and rocket-game.css. Tests cover recipe bags, solvent increments, capacity, exact answers, deadlines, retry/reset, engine factors, bonus/capped distance, unlocks and history. The page is rocket-game.html. Service worker caches game code and supplied runtime artwork.

Rocket nose alignment: top at 1% of the assembled model, left 22%, width 56%, height 34%; body starts at 32%. Open the nose by rotating 28 degrees around a 92% / 94% hinge point, without translating it away from the body. Preserve a slight overlap at the rim so the parts remain visibly connected.

Selection emphasis: when a rocket is clicked, fade all remaining conveyor rockets out linearly over 450ms. Only the selected rocket grows and moves to the pad. Its original belt copy is hidden immediately to avoid duplication. Fade the belt separately over 1000ms after a 450ms delay.

Variant/nozzle revision (supersedes earlier shared nose percentages and 28-degree opening): assign measured nose position, size, aspect ratio and hinge coordinates separately for all five variants using data-variant. Open each cap 100 degrees to clear the fuel nozzle. Anchor the chamber at the fuel assembly bottom; dynamically position the 68%-wide fuel assembly over the actual rocket mouth and extend it until the nozzle inserts by 0.6% of stage height. Stretch the three pipelines to join tanks and chamber. Recalculate when the tanks appear and on resize. Preserve all boarding and countdown timings.

Recipe display revision: place the question/recipe name on the rocket body metal panel between the four screws, styled like an engraved model name. Remove the former title at the top of the filling screen. Keep the body label hidden during selection and movement; fade it in after the rocket settles on the pad. Adjust text placement for variant-specific panel shapes.

Fuel assembly sizing revision: use 84% of stage width, retain nozzle alignment to each rocket mouth, and preserve tank-tubes.webp at its native 636:186 aspect ratio. Increase tank-row height to fill the space above the short tube section. Fit equal Fill/Undo controls inside each tank base; centre Launch within the chamber and preserve its image proportions.


### Fuel station refinement ? 24 October 2026

Source reservoirs start full and animate down as their liquid is added to the chamber. Digital counters show source remaining percentage; captions show dispensed percentage. Water is cyan (#00cfff), ACN purple (#b627ed), MeOH amber (#ffbf25), matching active liquid-sort styling. Undo reverses the transfer and returns one recipe increment to the source. Continuous liquid-height transitions and directional pipe flow last 600?650ms; Launch becomes active with a pulsing highlight when the chamber is 100% full and the final transfer has settled. Tanks preserve their native proportions, pipes connect measured tank outlets to chamber inlets, labels remain high contrast, and the rocket cap opens to 168 degrees to clear Launch. Question lettering stays embossed on the rocket body and appears after docking. See rocket-game-progress.md for implementation and verification details.


### Tank display correction and visual refinement

Digital displays show dispensed percentages starting at 0%, not source remaining percentages. Remove the separate added-percentage captions. Physical tanks still start full and drain/refill on Fill/Undo. Solvent labels use prominent lettering without background boxes; controls are enlarged within their panels. Pipe interiors show continuous coloured streams with directional moving highlights, accompanied by animated chamber surfaces and mixing bubbles.


### Docked engine animation

After docking, each working nozzle shows the supplied Fire Loop GIF. A wrong answer or timeout transitions only the newly failed engine from fire into a single Engine Blown sequence, then extinguishes it. Surviving engines continue burning; failed engines remain off through retries. The failure popup waits for the blowout to finish. Source blowout frames are played once at a readable pace using a derived sprite sheet; original GIF artwork is unchanged.


### Attention-grabbing failed launch

Wrong answers and timeouts trigger a short fake liftoff: fuel assembly clears, nose closes, rocket rises slightly, the failed engine blows out, then the rocket returns to the pad. Show the failure popup only after landing. This is visual feedback only; failed answers still produce no distance progress.


### Successful launch cinematic

After the rocket exits the hangar, smoothly black out the game. On an empty black flight scene, bring the selected rocket from below into the centre, hold with mild turbulence for a few seconds, then accelerate it out above the screen. Show the successful-launch/results page only after this flight completes. Preserve engine damage and exclude animation time from answer timing.


### Results route progression

Draw a dotted curved route between origin and destination. Animate each successful launch from its previous cumulative-distance position to its new position, with a highlighted travelled segment. Reach the destination at 100% mission distance. Show readable live statistics beside the route; enable Continue after the movement finishes.
