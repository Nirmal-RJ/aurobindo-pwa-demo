## Mandatory preservation rule for all future AI agents and contributors

This is an explicit, continuing user instruction. It applies across future sessions, context resets, refactors, fixes, and migrations.

- Do not remove existing features, content, assets, or effects, or disable, shorten, tone down, replace, or reduce an approved animation without explicit user permission for that specific change.
- A general request to improve smoothness, clean up code, optimize performance, improve accessibility, or fix another feature is NOT permission to remove or suppress existing effects. Explain any necessary collateral change and obtain permission before applying it. Continue independent authorized work meanwhile.
- Preserve approved timing, sequencing, intensity, movement, and continuity. In particular, preserve the question entrance/sweep/pulses, launch camera shake, launch smoke, docking, transitions, liquid flow, and directional percentage trails.
- Do not reintroduce global near-zero animation/transition durations (such as 0.01ms), hidden effects, stationary substitutions, or reduced-motion/browser/device branches that suppress approved motion. Any such behavioral change requires explicit permission first.
- Before editing Rocket'ier, read this rule and the current game details/progress. Older historical notes proposing reduced-motion suppression are superseded by this rule. A later explicit user request may authorize a specific exception; record it clearly.
- Review the diff for collateral animation changes and verify affected sequences before declaring completion. Use the existing browser checks, including ROCKET_REDUCED_MOTION=1 when motion handling changes. Report anything not visually verified; passing logic tests alone does not prove animation quality.
- Update rocket-game-progress.md after every feature/fix, recording exactly what changed and how it was checked. Never silently remove this rule or weaken it.

# Rocket'ier game details

## Current release snapshot - 26 October 2026

This snapshot supersedes conflicting historical entries below; mandatory preservation instructions remain in force.

- Runtime: assets/rocket-game-scripts/rocket-game.html; root rocket-game.html redirects here. Dedicated scoped worker; sibling rocket-game-assets holds media. Five recipes, including D Column Wash (Water 10%, ACN 45%, MeOH 45%), with matching WebM lessons.
- Fuel controls: enlarged tank displays, centered solvent labels, one Fill per tank and a shared last-fill Undo attached beside the chamber. Animated digit counting/highlights; five green rising Fill echoes and red falling Undo echoes. Preserve all approved attention, docking, shake, smoke and transition effects.
- Failure: randomly choose any of three sad astronauts for incorrect-answer, timeout or mission-failed popups, animated above/behind the banner.
- Journey results: supplied page-6/journey-success-1.webp above the stats card after EVERY successful launch once route travel finishes. It replaces the separate win astronaut and speech bubble. Preserve route motion, destination ring and stat counting.
- Completion: new page-8 artwork with current average response time and best average across all completed missions. Include resolved correct/wrong/timeout attempts; exclude animation/video time and incomplete attempts. Store run.pace and player bestMissionPaceSeconds, deriving legacy results from history.
- Current pace finishes counting, holds for 1.5 seconds, then best pace appears/counts. Bottom distance/time removed from this screen by explicit request; history preserved.
- Runtime versions: CSS 82, presentation JS 74, core 5, loader 4, cache helper 1, scoped shell 24. Asset manifest rebuilt for 95 runtime assets (~25 MB).
- Release validation: 44 Rocketier tests plus 2 root worker tests and syntax/whitespace checks pass. Browser checks and deployment evidence are recorded in progress notes; Windows WebKit is not a physical iPhone test.


Question readability revision: remove text shadows and the entrance's text drop-shadow. Increase text about 5%, keeping it centred within slightly wider variant-specific label bounds so all recipe names fit phone screens. Preserve the other entrance animation effects.

First-load artwork readiness: after asset downloads and service-worker activation, rebind initial page images to their verified content-revisioned cache URLs and await successful decoding before Start unlocks. Retry failed initial image loads; do not require closing/reopening the game to recover mission brief art.

Mobile compatibility: preserve essential motion through CSS keyframe fallback when Web Animations is absent; provide measured cqw/viewport-unit fallback before Play unlocks. Support legacy touch input, handle lost/failed pointer capture, and stop Fill on global release/cancellation. Include Safari-prefixed visual effects, visualViewport modal sizing and explicit inline video playback. Browser-engine QA is documented in artifacts/rocket-mobile-qa/verification.md; distinguish it from physical-device video/audio/performance verification. Shared deployments require HTTPS for asset caching.

Background music removed: no BGM playback or soundtrack preload. Retain gameplay sound effects. This supersedes all earlier background music creation/playback/mix instructions.

Music mix revision: make BGM very mild in gameplay and dotted-route results (2.5% media volume), and barely audible under lesson videos (0.8%), replacing the previous video pause. Keep fades and background-tab pausing.

Music style/control revision: remove the toggle and play music automatically after Start. Use the new 16-second, 120 BPM playful major-key arcade soundtrack with bouncy bass, cheeky synth melody and light percussion, replacing the slow atmospheric version. Preserve lesson/background pausing and automatic gesture recovery; ignore the obsolete toggle preference.

Background music playback: start the preloaded loop on Start at quiet volume, fade smoothly, and provide a music toggle that remembers its preference separately from game history. Pause during lesson videos and when backgrounded; resume from the same position when appropriate. This supersedes the earlier pending-playback status.

Background music asset: generated/space-background-loop.wav is an original 24-second, 80 BPM stereo space soundtrack with wrapped tails for continuous looping. Included in home preload; playback integration and music controls are pending.

Penalty badge frequency: frontend-only, show the red penalty badge once on the first successful flight after each new engine loss. Hide it on subsequent flights with unchanged damage. Preserve all engine/speed/distance rules and parallax speed.

Docking/route audio revision: play generated/rocket-zoom.wav during the 1900ms docking zoom and stop at arrival. Replace the dotted-route low hum with a lighter space arpeggio and arrival chime; preload both through the asset manifest.

Retry/video button revision: use page-7-3/retry-mission-button.webp on the Try Again popup while preserving its existing retry behavior. Label the video-page action “Continue”.

Original animation cues: use the short generated formula chime, nose-open/nose-close servo swishes, number-count ticks and dotted-route glide from rocketier-audio/generated. Synchronize with their animations, stop counting/travel cues at completion, and include them in home preloading. Preserve supplied MP3 artwork/audio.

Failed-launch return revision: use more prominent localized black smoke. On landing keep the nose closed and fuel station retracted through failure, lesson and retry dialogs. Only after Retry, reopen the nose for 650ms and lower the station for 900ms, then create the fresh attempt and start its full timer. Do not restore equipment automatically at the end of the failed liftoff.

Engine failure smoke: show a short blackish plume at only the newly broken engine, synchronized with its explosion for wrong answers/timeouts. Keep it localized and fade before the popup. Use lightweight relative-size gradient puffs with transform/opacity animation; reduced motion uses a stationary fade.

Smoke behavior correction: keep the light plume at the bottom throughout launch. Remove the upward/full-screen takeover after the rocket exits; proceed to the existing blackout transition.

Smoke intensity correction: use only three smaller, low-opacity launch clouds with restrained expansion and a very light final haze. Supersedes the earlier dense full-screen smoke appearance; preserve ascent visibility and transition timing.

Smoke visibility revision: keep smoke in the bottom 35% during liftoff. Once the rocket exits at 3500ms, let smoke cover the full screen over 1000ms, then black out and transition to flight (5300ms after correct launch). Preserve a clear view of ascent before takeover.

Successful launch drama: release rolling exhaust clouds from the pad that expand to fill the hangar before blackout. Add a short camera shake that builds during liftoff and settles before blackout. Keep existing launch/cinematic timing; reduced motion suppresses shake and uses a gentle smoke fade.

Button sound exception: Fill, Undo and rocket selection must not play the UI click audio. Keep liquid-transfer sounds for Fill/Undo and click audio for other UI buttons.

Gameplay audio: use rocketier-audio/Correct Question.mp3 on correct answers, Liquid Flowing.mp3 continuously during Fill/Undo transfers, Engine Blast 1.mp3 at the visible engine explosion, Wrong Question.mp3 on failure/timeout popup appearance, and Button Click 2.mp3 on UI presses. Include all supplied audio in the home loading manifest; stop playback when backgrounded and avoid stacking repeated liquid loops.

Home asset-loading requirement: lock Start until all production images, videos and audio are completely downloaded into the reusable browser media cache. Show real byte progress with retry handling; reuse unchanged files and limit parallel downloads on poor connections. Generate the asset manifest with npm run assets:rocket (also automatic before dev/start), including future assets placed under assets/rocket-game-assets; exclude reference/old artwork. Service worker serves cached media and video byte ranges so playback/seek works offline after setup.

Lesson player layout revision: use almost the full visible portrait game area like a reel, with a compact recipe topic at the top and dedicated Continue to retry row below. Remove oversized card padding and redundant description. Preserve full video content, controls and aspect ratio.

Lesson videos supplied: use the matching column-cleaning.mp4, strong-wash.mp4, needle-wash.mp4 and column-storage.mp4 from cleaning-solution-videos in the existing failure lesson popup. Restart playback for each lesson opening and preserve the retry flow.

Flight feedback revision: reflect surviving engine factors in star scrolling speed. Reveal red engine-count/speed-penalty badge followed by gold time-saved/bonus-distance badge with counting numbers, smooth settle entrances and light sweeps. Sweep both away at final boost with gold star streaks for earned bonus. Keep existing cinematic duration and gameplay calculations.

Tank display attention revision: larger centred percentage digits in each artwork window, solvent-coloured glow and a brief scale/settle on Fill/Undo. Show the actual signed transfer amount temporarily below the window without overlapping solvent names. Held filling maintains glow; reduced motion suppresses movement.

Reading pause adjustment: use 1500ms instead of three seconds for the question-first pause. Total preparation is now 5150ms; all other sequencing stays the same.

Question-first sequence revision: reveal the recipe after travel/settle, with dim scenery and the attention effect; hold three seconds with fuel station, HUD and flames hidden and nose closed. Then open the nose and lower equipment before enabling filling and starting the countdown. Total preparation is 6650ms, superseding the earlier post-equipment reveal.

Formula entrance revision: after docking/tank preparation, dim scenery and announce the recipe with a cyan sweep, slight scale/settle and two outline pulses. Hold for 1800ms before enabling filling and starting the full countdown (5450ms total preparation). Reduced motion uses a simple fade and retains reading time. Supersedes the earlier title reveal during nose opening and 3650ms countdown start.

Journey rocket fire revision: remove the added fire GIF from the journey-results route rocket. This supersedes the earlier request to show fire on that screen.

Liquid continuity revision: show coloured jets inside the chamber from each pipe inlet to the moving liquid surface, with impact ripples, flowing highlights and gentle waves. Chamber rise follows a short arrival delay and settles within the existing transfer window; held fills remain continuous and Undo reverses flow.

Completion values and navigation revision: align distance/time in the artwork's right-hand value column and animate both from zero after screen entrance. Next Mission opens the next numbered mission popup directly (for example, after Mercury, Mission 4), skipping the mission brief and starting that mission's fresh run.

Page-8 completion revision: follow page-8/page-8-reference.webp using page-8-bg.webp and next-mission-button.webp. Fill only the reference's destination message, distance and time areas. Remove extra cards, stars, attempt totals, history export and back link from this screen. This supersedes the earlier completion-screen history-download requirement; retain stored history.

Journey animation sequence revision: move the route rocket first with the supplied fire GIF behind it, then reveal and count up all results values smoothly before enabling Continue. Show “Yay! Journey complete!” only after reaching the destination planet, with a prominent celebratory entrance and planet pulse. Intermediate launches have no completion heading.

Mission-failed popup revision: show page-7-3/mission-failed-panel.webp itself as a popup over the current game screen, with retry-mission-button.webp inside its lower area. Remove the blue surrounding card and duplicate title/description. Preserve the accessible dialog name and existing retry-mission behavior.

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


### Five-question configuration ? 26 October 2026 (supersedes original four-question list)

| Question | Water | ACN | MeOH | Video |
|---|---:|---:|---:|---|
| C Column Wash (formerly Column Cleaning) | 90% | 5% | 5% | c-column-wash.webm |
| Strong Wash Solvent | 20% | 80% | 0% | strong-wash.webm |
| Needle Wash Solvent | 50% | 0% | 50% | needle-wash.webm |
| Column Storage (C18) | 30% | 70% | 0% | column-storage.webm |
| D Column Wash | 10% | 45% | 45% | d-column-wash.webm |

Videos are in assets/rocket-game-assets/cleaning-solution-videos/. All five appear once per shuffled bag, without immediate boundary repeats. D Column Wash fill/undo increments are 5/15/15 using the existing algorithm.


### File organisation ? 26 October 2026

All game runtime files, builders and notes now live in `assets/rocket-game-scripts/`, next to `assets/rocket-game-assets/`. The entry page and dedicated service worker are inside the scripts folder. Use `README.md` in that folder for build and hosting instructions. Existing root game links redirect to the new entry point.


### Updated fuel controls (26 October 2026)
Each solvent tank has one hold-to-fill button and a large digital display of its dispensed percentage (initially 0%). Physical reservoirs begin full and drain as dispensed. A single common Undo beside the mixing chamber returns the most recent dispensed portion to its source tank, in reverse fill order, with reverse pipe-flow animation. Undo is unavailable when no fills remain or input is closed. The original individual solvent Undo controls are superseded.

### Percentage trail refinement (26 October 2026)
Each transfer shows its actual signed amount with one leading number and four softer echoes. Fill travels from the bottom to the top of the tank glass; Undo travels downward. Both shrink smoothly, fade at the endpoint and use transform/opacity animation without changing layout. Keep the trail coordinated and restrained during held filling; preserve reduced-motion fades and immediate input response.

Percentage trail motion correction: preserve the gentle directional percentage travel even with reduced motion enabled, consistent with essential docking motion. This supersedes the stationary reduced-motion fade for percentage echoes only.

Digital readout feedback: animate dispensed percentage values up/down over 288ms, retaining the existing bounce. Highlight Fill in the solvent color and Undo in warm gold for the transfer window. Rapid input continues from the visible number while gameplay and floating-trail amounts use exact model/event values. Preserve all other approved effects.

Sad astronaut feedback: show astronaut-hero-lose-1 above the timeout popup and astronaut-hero-lose-2 above mission failed. Animate their entrance with slide/scale/tilt settling and gentle idle movement. Preserve existing artwork/actions and hide the hero on lessons/retry. Both win images are stored/preloaded for future placement.

Astronaut visibility correction: show lose-1 for ALL engine-failure popups (incorrect mixtures and timeouts), not timeouts alone. Mission failure uses lose-2. Preserve the animated entrance and idle motion.

Sad astronaut randomization: all engine-failure, timeout and mission-failed popups randomly choose lose-1, lose-2 or lose-3 with equal probability on each appearance. This supersedes the earlier fixed per-page mapping. Keep the existing entrance and idle animations.

Astronaut placement: position the character above the banner with its lower body overlapping behind the artwork, so the banner hides the cropped image base. Keep the action above both layers and preserve entrance/idle movement.

Shared Undo placement: use the metallic yellow housing artwork at 24% fuel assembly width, left 75%, bottom 7%, aligned beside the chamber body as an attached control. Preserve its behavior and existing animations.

### Mission pace results (26 October 2026)
Completion uses the new page-8 background/reference, with animated cyan current pace and gold all-time best pace (seconds per answer, one decimal). Current pace averages all resolved attempts in that mission run, including wrong answers and timeouts; only active answer-input time counts. All-time best is the lowest average among completed runs across ALL missions, as explicitly confirmed by the user. Failed/interrupted runs do not qualify for the best.
Store each run's pace attempt count, total response seconds and average, plus the player's bestMissionPaceSeconds. Derive averages from preserved attempts for older saves. Animate entrance, count-up and final sheen; retain counting sound and all other existing effects. Keep distance/time as a compact lower summary and existing Next Mission behavior.

Completion results timing update: finish counting this mission's pace, hold the final value for 1.5 seconds, then reveal and count the all-time best pace. Preserve both animated entrances and highlights. Remove bottom distance/time from this screen as explicitly requested; keep those values in history and other existing statistics.

Journey destination celebration: randomly show either winning astronaut above/behind the stats card when the destination is reached. Present the existing completion announcement as a speech bubble saying This journey completed! Preserve its attention animation, route motion, destination ring and stats counting. Animate the astronaut entrance and gentle idle motion, with its cropped base masked behind the card.

Percentage trail color: Fill's rising signed amount echoes use green text/glow; Undo's falling echoes use red text/glow. Preserve all existing motion, five-echo sequencing, chemical liquid colors and digital readout feedback.

Journey speech bubble wording: use 'Yay! Journey complete!' (supersedes 'This journey completed!').

Journey success artwork revision: replace the separate winning astronaut and speech-bubble text with page-6/journey-success-1.webp. Show the supplied combined image above the stats card after EVERY successful launch, once route travel finishes (not only at destination). Retain entrance/idle animation, route progression, destination ring and stats counting.

### Engine chances belong to each rocket (supersedes mission-wide damage)
Every newly selected rocket starts with three working engines/chances, even when selecting the same visual variant again. Wrong answers/timeouts and retries on that rocket retain its damage. Successful launches with two/one engines retain the existing 0.67/0.34 speed and distance factors. After continuing to the next question and selecting a rocket, reset to three engines without resetting mission distance, question history or elapsed-time totals. Losing all three on one rocket still triggers mission failure and Retry Mission. Track the reset in the rocket-selected event; retain previous attempt engine snapshots. Penalty-badge tracking is per rocket/question.

Mission brief responsive placement: artwork and Start Mission share a proportional floating wrapper. Anchor the button to artwork coordinates (top 82%, left 16.667%, width 66.666%), never viewport/screen height. Preserve their shared float and button interactions so the action remains inside the box at all screen proportions.

Rocket-selection prompt: center it in the hangar, repeatedly pulse its cyan glow/scale and softly blink the text until a rocket is selected. Stop attention loops on boarding and retain the existing fade-out and docking sequence.

Tank interaction: the entire solvent tank is a tap/hold-to-fill target in addition to the visible Fill button. Use the same increments, timing, feedback and capacity/input locks. A button press must never count twice through event bubbling. Release/cancel stops the hold; retain keyboard access through the original button.

Rocket selection spotlight: dim hangar scenery while awaiting selection, illuminate the conveyor with a gentle cyan pulse, and highlight each rocket. End selection highlights when boarding begins, preserving the existing smooth background transition, prompt fade, moving belt and docking sequence.

Selection spotlight frequency: show the dimmed scenery, highlighted belt and glowing rockets only before the first rocket pickup of each mission run. Subsequent pickups use normal lighting. The centered animated prompt and conveyor movement remain unchanged. A new/retried mission restarts the first-pickup spotlight.

Selection prompt artwork: use page-4/pick-your-rocket1.png and pick-your-rocket2.png in place of the visible text panel. Center and enlarge the sign, alternate the frames and animate gentle downward pointing until selection. Keep accessible instructions, boarding fade and first-pickup-only lighting behavior.

Pick Your Rocket placement/speed: anchor the sign near the bottom directly above the rockets (bottom 20.5%, centered 40% width). Alternate artwork every 300ms while keeping the gentle 1.8s downward-pointing animation and existing fade on selection.

Selection sign pointing motion: smoothly dip downward and return, travelling from -6px to +10px over 1.8 seconds. Preserve the independently adjustable artwork-alternation speed (currently user-set 0.4s full cycle).

Selection artwork filenames updated: current supplied frames are page-4/pick-your-rocket1-black.png and pick-your-rocket2-black.png. Regenerate the asset manifest after renaming/replacing files.
