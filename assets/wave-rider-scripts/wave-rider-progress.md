# Wave Rider implementation progress

10 November 2026: copied all supplied assets and both source documents into isolated assets/wave-rider-assets and assets/wave-rider-scripts/docs. Added separate config/question bank, testable timing/progression core, rendering controller, CSS and locally generated animated ocean. RC-only last banner now uses the supplied landing artwork and game link. Existing games, review authentication and cloud data untouched.

Implemented landing load gate, first-visit four-slide demo, boat home/selection, True/False lane changes, countdown/penalty, auto correct feedback with flying flag, wrong/sink explanation, lighthouse crash/shake/smoke, seven-flag upgrade, final-star/cycle reset, daily cap, exit confirmation, reopen and IST reset. No audio files were supplied; audio integration is pending. Demo GIF replacement pending. Simulation uses low-resolution procedural texture and a capped animation rate, with independent image object-fit sizing.

Core tests: all five pass, including exact My Carz copy, all nine boats, lane penalties/zero-points exhaustion, 56-correct progression, three-star cap, score retention and midnight IST/reopen. Edge and WebKit first browser pass: loading/demo/home, 320/390/768 fit, correct/wrong/no-input crash, retry/guidance, exit/reopen and selection lock pass. Screenshots exposed icon encoding and counter padding; corrected before repeat checks. Final ocean/rule visual pass recorded below. Physical iPhone/Android verification remains pending. No deployment or push.

Final checks: all 64 supplied source files copied byte-for-byte (SHA-256 compared); both browser engines pass the main flow and accelerated upgrade/final-star continuation presentation tests. All prompts fit 320x568 without shortening. Final ocean simulation, home and reward screenshots inspected. Reused supplied boat-name frame and reward-panel text slots; adjusted HUD to the supplied panel's natural aspect ratio. Demo label overlays follow approved right=True rather than inverse baked labels. No supplied artwork modified. Audio and real demo GIFs remain pending. Test artifacts under artifacts/wave-rider; local testing at http://localhost:4174/assets/wave-rider-scripts/wave-rider.html. No deployment/push.


## 10 November — UI alignment and eight-second line arrival

Authorized scope: fix UI/alignment across pages, remove unwanted copy, and make the boat take eight seconds to reach the answer lines. Removed generated home/day-score and bottom gameplay total-score labels; saved scoring is unchanged. Boat-name text now sits inside the supplied frame with functional transparent previous/next hit areas. Collection uses intrinsic frame proportions, five complete rows and supplied up/down controls; selected item scrolls into view. Timer is aligned in the free top HUD region. Failure/exit artwork uses its natural aspect ratio and guidance remains inside the supplied panel. Correct-answer points value overlays the existing artwork slot without duplicating its label.

Replaced fixed 85-to-41-percent boat-centre travel with measured geometry: actual rendered line and each boat's visible bow/transparent bounds. Countdown begins after the preserved entrance, interpolates over eight seconds, and reaches bow contact at expiry. Existing later-swipe time penalties still reduce remaining travel time; input, score, flag and reward rules unchanged. Geometry is recomputed on resize, not read every frame. Boat bobbing ends only on arrival before existing feedback motion.

Checks: five core tests pass; Edge and WebKit alignment test verifies five full cards, title/control bounds and no extra score labels at 320x568 / 390x844 / 768x1024. Real eight-second countdown measurement verifies bow-to-line contact within two CSS pixels in both engines (pass animation disabled only within the measurement fixture). Every question and explanation fits 320x568 unchanged. Reward/star presentation regression passes both engines. Full gameplay regression recorded below. Screenshots inspected under artifacts/wave-rider/*aligned*. Isolated shell/config version2 and RC link updated. No deployment, push, shared-auth changes or other-game modifications. Physical iPhone/Android validation remains pending.


Final full-flow regression PASS in Edge and WebKit: preload, four demos, responsive home, correct/wrong/no-input crash, explanation/retry, exit and reopen selection. Local build ready for review.


## 10 November — Home spacing refinement

User requested Start Sailing slightly higher and boat cards separated from their collection banner. Moved Start Sailing from 84% to 81% stage height; increased boat-scroll inset from 10%/12% to 12%/18% (vertical/horizontal). No other screen, timing, progression or content changes. Edge and WebKit checked 320x568, 390x844 and 768x1024; measured inner gaps and button separation pass, screenshots reviewed under artifacts/wave-rider/*home-inset*. Local only; no deployment or push.


## 10 November — Water, hull response and collision effects

Authorized scope: more lively directional water, convincing hull foam/wake and steering, supplied timer artwork, readable seven-flag HUD, lighthouse explosion/shake/red corners/dark smoke, and a gradual wrong-lane sink. Copied Downloads/timer-panel.webp unchanged into page-4 and added it to preload. HUD uses proportional panel artwork and seven explicit SVG pennants rather than clipped CSS outlines. Existing right=True mapping is retained despite inverse reference artwork.

Replaced the flat triangular wake with capped world-space foam particles emitted along the rendered hull, bow split and stern. Lane movement banks the boat; foam follows its actual interpolated screen position. Ocean combines a precomputed distorted ripple texture with moving current layers/filaments. Canvas resolution is capped at 1.5 DPR, drawing at approximately 30fps, particle count capped at 320; hidden documents skip drawing without pausing logical question time.

Lighthouse collision is anchored to the visible bow at arrival, with a fire bloom/embers, coherent stage shake, red edge flash and expanding dark smoke. Wrong answers tilt, darken and progressively submerge the hull with surface rings/bubbles. Feedback holds extended to 2.8s for sinking and 3.2s for crash so effects finish before the explanation page. Eight-second question travel, penalties, scoring, question copy and progression remain unchanged. Isolated runtime version bumped to 3.

Validation: five core tests PASS; Edge/WebKit full flow and real eight-second arrival checks PASS. New effects browser check verifies seven flags and nonoverlapping timer at 320/390/768, crash/sink completion and no JS errors. All question/explanation copy fits 320x568. Mid-animation screenshots reviewed in artifacts/wave-rider. Physical iPhone/Android performance and visual review remain pending. No audio supplied; no added audio. No push/deployment or other-game changes.

## 10 November — Upgrade label alignment
Anchored level and boat name to the intrinsic 1920x819 banner rather than independent stage positions. Level is gold (#ffdc65), each label centered in its respective blue slot. Artwork and labels enter together. Edge/WebKit reward-cycle checks pass and upgrade screenshot inspected. Local only; no push/deployment.


## 10 November — Boat title arrow clearance
Reserved the middle 45% of the name banner for text, clear of both arrow hit areas; slightly reduced font and balanced wrapping for longer names. All nine exact names fit without text overflow or arrow overlap at 320/390/768 in Edge and WebKit. Local only; no push/deployment.


## 10 November — Reference boat collection styling
Compared supplied page-3 reference directly. Collection now spans 7–69% of stage height, with five larger cards, cyan beveled borders, dark navy interiors, green selected glow/badge, lock icons and clear-level labels derived from each boat's existing unlock level. Preserved actual nine boat names/art, selection rules and other home elements. Decorative frame fills its responsive collection bounds; individual boat images retain their proportions. Five complete cards and contained controls verified at 320/390/768 in Edge/WebKit; screenshots reviewed. Local only, no push/deployment.


## 10 November — Lighthouse boat sinks after impact
User approved retaining every impact effect and replacing boat disappearance with sinking. Changed only wreck CSS: a 450ms recoil settles into the existing 2.65s progressive submerge, completing at 3.1s before the unchanged 3.2s crash handoff. Explosion, smoke, shake, red edges, timer and gameplay logic unchanged. Local only; no push/deployment.

Validation: Edge and WebKit effects checks pass; mid-crash screenshot confirms boat remains visible while beginning to submerge. Physical-device testing remains pending.

## 10 November — Recording-led steering continuity
Inspected supplied 23.5-second MP4 via sampled frames. Enlarged gameplay boat from 16% width/height to 23% width and 18% height, preserving image proportions. Replaced restarting CSS turn animations with one frame-driven smoothstep lane interpolation and bank angle. Later-swipe penalty changes retain immediate logical deductions but reconcile forward position across up to 380ms instead of teleporting; bow still arrives at expiry. Final interrupted lane travel settles in 180ms. Shortened and softened foam lifetimes to avoid lingering ghost trails. Existing impact/sink presentation retained.
Validation: core tests pass; Edge/WebKit real eight-second arrival passes. Steering sampling confirms constant hull box dimensions and maximum sampled vertical increments under 7px during a penalty lane change at 390x844. Screenshot reviewed. Physical-phone motion review pending; local only, no push/deployment.


## 10 November — Larger boat-name typography
Increased banner label from 3cqw to 4.5cqw (50% larger), with tight 1.04 line height and balanced wrapping. Preserved safe inset between both arrows. All nine names pass width/height and arrow-clearance checks at 320/390/768 in Edge/WebKit; Round River Boat screenshot inspected. No other layout or gameplay changes; local only.


## 10 November — Anchored water on UI screens
Approved calm menu/reward water: current phase now advances only on gameplay screens. Other UI screens retain the stationary texture with gentle highlight shimmer; home/upgrade/star boats retain their existing bob and receive soft expanding hull ripples drawn behind them. No trailing menu wake. Gameplay current, steering foam, collision and sink effects unchanged. Edge/WebKit reward-cycle checks pass; screenshot inspected. Local only, no push/deployment. Physical-device motion verification remains pending.


## 10 November — Home boat clears collection
Reduced only home-boat display bounds to left 2%, width 57% (previously left 1%, width 68%). Collection begins at 63%, leaving breathing room even at maximum bob/rotation. Boat artwork remains proportional. All nine boats checked at 320/390/768 in Edge/WebKit with positive clearance above 5px. Gameplay and reward boat sizes unchanged; local only.


## 10 November — Subtle UI water motion
User requested visible but gentle movement after stationary UI water felt too still. Added slow bounded horizontal/vertical sway to both ocean texture layers at different phases, retaining shimmer and hull ripples. UI water moves back and forth without continuous forward scrolling; gameplay current and all boat/effect logic are unchanged. Extended tile coverage prevents edge gaps during sway. JavaScript syntax check passed; Edge/WebKit home, upgrade and star presentation regression passed. Physical-device motion review remains pending. Local only, no push/deployment.


## 10 November — More visible UI water movement
Increased UI texture sway amplitude approximately threefold and speed approximately 1.6x, with a brighter counter-moving highlight layer. Motion remains bounded around the stationary boat instead of a scrolling sailing current. Gameplay movement, layouts and boat animations unchanged. Syntax and Edge/WebKit home/upgrade/star presentation checks passed; physical-phone visual review pending. Local only, no push/deployment.


## 10 November — Exit restores boat selection
Latest user rule overrides reopen-only selection: Exit to home now restores selectionAvailable before rendering boat selection. Unlocked cards and title arrows work immediately; locked boats remain unavailable. Current flag streak still resets; progression, unlocked boats, score and stars remain intact. Updated rules and old browser assertion, added targeted Edge/WebKit regression covering card selection, arrows, locked boats, retained progress and sailing with the chosen boat. Both engines passed. Local only, no push/deployment.


## 10 November — Continuous steering outcomes and water celebration
Last-moment lane movement now finishes before outcome effects begin; sinking bubbles are measured from the settled boat rather than its old lane. Later swipes use eased forward reconciliation and a smooth one-second water-camera pullback/current acceleration envelope, without scaling the hull or HUD. Correct answers launch paired arcing water streams/spray from the screen sides. The earned flag grows, holds, shrinks into the actual next HUD slot, then updates/pulses that slot before advancing. Existing logical timer, penalty, score and progression rules retained; interrupted visual arrival adds up to 300ms before feedback. Generation checks prevent old arrival/flag callbacks modifying a new page.
Validation: five core tests, syntax checks, Edge/WebKit effects regression and targeted last-moment wrong-lane/flag-landing regression passed. Celebration screenshot inspected. Physical iPhone/Android motion verification pending. Local only, no push/deployment.


## 10 November — Sailing entrance, hull waves and buoy response
Boat now enters from 112% stage height below the viewport into its starting position during the existing entry interval; the eight-second timer still begins after entry. Steering has a stronger eased heading with gentle wave heave, without scaling the hull. Added layered curved bow foam following heading, larger rotating hull-side spray and a brighter short stern wake. Buoy artwork now occupies 40% stage width per lane with its natural 548:196 ratio, matching the wider reference composition; contact triggers a damped line bob and localized splash. Approved right=True/left=False mapping retained.
Validation: Edge/WebKit 320/390/768 alignment and real eight-second bow contact passed. Steering tests passed with stable dimensions and sampled forward increments below 9px; last-moment sink alignment and HUD flag delivery passed in both engines. Rendered steering screenshot and supplied reference inspected. Physical-device motion review pending. No push/deployment or other-game changes.


## 10 November — Full-volume water salute
Replaced narrow water jets with overlapping broad cyan/white spray fans and more than doubled droplet emission, retaining the capped particle budget. Water droplets now draw short moving streaks. Added 520ms damped success shake and increased background dimming to 55%; water canvas, earned flag and result banner stay above the dim layer. Existing success timing, flag landing and gameplay rules unchanged. Edge/WebKit outcome regression passed and celebration screenshot inspected; final fan overlap softened to reduce visible individual strands. Physical-phone review pending. Local only, no push/deployment.


## 10 November — Fluid steering foam
Removed rigid hull-attached bow curves. Soft cached foam stamps now spawn along interpolated travelled positions and headings, fade in, spread and dissipate independently. Short lifetimes avoid ghost trails. Water effects follow display refresh while the ocean texture stays at 30fps; existing celebration/smoke emission cadence remains capped at 30fps to retain intensity. Particle cap retained. Edge/WebKit steering checks pass with stable hull dimensions and no penalty teleport; syntax check passed. Physical-phone visual/performance review remains pending. Local only, no push/deployment.


## 10 November — Gameplay HUD padding and alignment
Aligned exit, timer and flag artwork on a shared optical centre with clear gaps and stage-edge padding. Timer copy is centered within its blue slot; seven flags now use equal grid cells with a separate count column, smaller count typography and protected inner padding. Changes scoped to gameplay HUD. Edge 320/390/768 geometry checks passed and screenshot inspected; WebKit check recorded below. Local only, no push/deployment.

WebKit also passed at 320/390/768 with no HUD overlap or runtime errors. Physical-phone review remains pending.

## 10 November — Camera-facing splash celebration
Replaced the rejected side-fountain salute entirely with three irregular expanding water sheets rushing toward the camera, a brief translucent lens wash, radial spray and 42 individually timed glass droplets that slide down and fade. Droplets use rounded asymmetric water-bead shapes rather than circular bubbles. Existing dimming, success shake, readable overlay layering, growing/flying flag and 2.3-second outcome flow retained. All effect state clears on page change. No gameplay-rule changes.
Validation: Edge/WebKit outcome regression passed; impact and clearing-stage screenshots inspected. Final sheet timing and droplet shape refined after inspection; syntax passed. Physical-phone visual/performance review pending. Local only, no push/deployment.

## 10 November — Heavy salute followed by lens splash
Restored a substantial bilateral water salute as the first celebration stage: three broad irregular cyan/white water ribbons per side, broken foam edges and dense moving spray. After 1.1 seconds, expanding water sheets hit the camera with sliding lens droplets and a brief background blur peaking below 4px. The flag and result artwork remain sharp. Impact shake now coincides with the splash. Correct-result duration is 3.6 seconds so the salute, splash and clearing finish before the next question; flag flight remains synchronized. Particle cap and cached foam stamps retained; reset clears lens blur on navigation. Gameplay scoring and rules unchanged.
Validation: Edge and WebKit outcome/flag regression passed and celebration screenshot inspected at 390px. Added a blur-clear assertion for the subsequent gameplay handoff. Physical iPhone/Android appearance and performance remain unverified. Local only; no push or deployment.
## 10 November — Remove artificial celebration water shapes
Boss feedback identified the celebration water as artificial. Removed solid polygon ribbons, outlined expanding splash rings and long spray dashes. Replaced them with 560 bounded, once-sampled ballistic spray trajectories, soft cached foam/mist and small water glints. Lens splash uses depth-dependent dispersed spray rather than a uniform ring; lens wash and bead highlights softened. Existing 3.6-second continuous sequence, impact shake, background blur, flag delivery and gameplay rules retained. This supersedes the prior ribbon implementation.
Validation: JavaScript syntax and Edge/WebKit outcome checks passed, including blur cleanup before subsequent play and flag landing. Inspected rendered Edge celebration screenshot. Visual realism remains a design review judgment; physical-phone appearance/performance is not yet verified. No push/deployment.
## 10 November — Restore visible bilateral salute
User correctly identified that dispersed spray had removed the recognizable water salute. Restored a sustained broad plume on each side, built from overlapping soft foam patches with pressure ramp, moving irregular edges and ballistic travel. Retained dispersed spray, subsequent camera splash, blur clearing, impact shake and flag sequence. No gameplay/timing changes. Edge celebration screenshot inspected; both plumes visibly converge above the earned flag. Syntax passed; outcome browser checks cover flag landing and blur cleanup. Physical-phone review remains pending. Local only, no push/deployment.
## 10 November — Ocean swells and separate lens-splash redesign
Preserved the approved bilateral salute. Removed the camera-facing spray cloud and replaced its splash stage with a short translucent water film plus 18 refractive lens beads sampling the actual ocean canvas; reduced and shortened background blur. Replaced dominant scrolling caustic tiles with a continuously shaded four-component wave-height surface, travelling swells, directional lighting and restrained specular highlights. Fine texture remains a low-opacity ripple layer. Gameplay hull bob uses the same large-wave phases; hull dimensions, lane path, eight-second timing and collision endpoints remain unchanged. Surface uses a bounded 192x320 buffer at existing 30fps with precomputed separable phase arrays, effects retain their separate canvas.
Validation: syntax passed. Edge/WebKit outcome tests passed (flag delivery and blur cleanup); steering tests passed again after shading refinement, stable dimensions and sampled forward increments below 7px. Gameplay and celebration screenshots inspected. These are procedural stylized waves, not photoreal fluid simulation. Physical-device appearance/frame rate and client visual approval remain pending. Local only; no push/deployment.
## 10 November — Remove patterned caustic water
User rejected the bright tiled-looking surface. Removed the caustic tile generator and repeated texture layer completely. Reoriented the continuously shaded surface into six irregular, predominantly horizontal wave bands with non-uniform phases and softer narrow sky reflections. Reduced menu displacement to gentle bounded motion and slowed gameplay current to suit the finer waves. Existing boat bob follows the same wave data. Salute, lens splash, UI artwork, dimensions, timers and progression untouched.
Validation: syntax passed; Edge/WebKit steering checks passed with stable hull dimensions and sampled forward increments below 7px. Inspected Edge gameplay and boat-selection screenshots; bright closed cell patterns are no longer present. Physical-device motion/performance remains pending. Local only, no push/deployment.
## 10 November — Approved ocean recolored to reference cyan-blue
Color-only adjustment: raised cyan/blue water channels and softened the edge tint to match the brighter ocean in the supplied Wave Rider landing artwork. Approved wave structure, motion, boat movement and celebration unchanged. Syntax check passed and local Edge boat-selection screenshot inspected. No push/deployment.
## 10 November — Individual gameplay hull waterlines
Added normalized waterline contours for all nine front-view boats in config, matching round, raft, rowing and motor/yacht hull shapes while excluding paddles and transparent margins. Foam samples the corresponding contour rather than a shared long-boat curve, and its particle size scales to the visible artwork. Emitter now applies the image's actual transform matrix and transform origin, so bank/bob and object-fit positioning match the visible hull during steering. Existing deposited wake motion remains continuous. No hull-size, scoring, timer, selection, salute or ocean changes.
Validation: inspected all nine source artworks and the nine-boat Edge steering contact sheet at 390px. All five core tests and syntax checks passed. Nine-boat WebKit 320px check also run; physical-device visual review remains pending. No push/deployment.
## 10 November — Victory Surf correct-answer sequence
Implemented approved continuous choreography: reactive buoy/gold gate glow, a stable-size 2-second forward surf with damped hull bank and hull-following foam, bilateral salute delayed 650ms, reward panel delayed 900ms, flag reveal at 1s followed by a curved shrinking flight landing at 2.8s, then lighting recovery and a 250ms scene fade before the 3.6s next-question/upgrade handoff. Surf position is committed to layout so the boat does not return to its original position on animation completion. Existing generation guards/input gating retained; scene animations are cancelled on mount to prevent delayed fades affecting a new screen. Removed success lens splash/blur and its renderer; kept approved ocean, individual hull profiles, failure effects and game rules. Success wake emission stops after the surf rather than continuing from a stationary boat.
Validation: Edge/WebKit outcome flag/cleanup checks and upgrade/star-cycle tests pass. Reward test uses a 2-second question window instead of .8s for reliable input in WebKit; shortened feedback only in that existing test. Recorded round-boat and race-boat preview WebMs under artifacts/wave-rider/victory and inspected sequence frames. Physical iPhone/Android motion/performance and client aesthetic approval remain pending; no photorealism claim. Local only, no push/deployment.
## 10 November — Recognizable arching water salute
Replaced the converging foam-plume silhouette with sustained bilateral ballistic streams. Streams rise from opposite screen edges, crest near the centre and fall under gravity, with moving narrow water filaments and detached spray. Pressure ramps up and down; the emission lasts 1.65 seconds within the existing 3.6-second success choreography. Reduced strand/sample counts to bound rendering work. Approved ocean, hull contours, flag flight, reward panel and gameplay rules preserved.
Validation: Edge and WebKit outcome tests pass, including flag delivery and failure-lane anchoring. Recorded round/race-boat sequences and inspected the revised arch frame. This is a stylized procedural effect; physical iPhone/Android performance and user visual approval remain pending. Local only; no push/deployment.
## 10 November — Fuller lower-screen water salute
Preserved the approved arch and increased jet thickness near its base. Added 420 bounded, once-seeded low ballistic spray particles from both bottom corners, spreading across the foreground with foam and falling droplets. Existing celebration duration, reward visibility, flag delivery, ocean and gameplay unchanged.
Validation: syntax passed; Edge/WebKit outcome checks passed. Recorded and inspected the first foreground pass, then increased its density and spread. Physical-phone performance and final visual approval remain pending. No push/deployment.
## 10 November — Prominent time-penalty flight
Subsequent lane changes show a larger red −2s badge above the boat, briefly emphasize it, then fly it toward the timer over one second. Timer receives a thick red glow pulse and red enlarged digits immediately and on badge arrival. Deduction remains immediate; the logical timer is never delayed for the animation. Stage-relative coordinates prevent steering from dragging the badge. Generation/connectivity guards prevent old flights from flashing a new screen. First free swipe unchanged.
Validation: JavaScript syntax passed; Edge/WebKit outcome regression run. Physical-device visual review remains pending. Local only, no push/deployment.
## 10 November — Separate success celebration stages
User requested salute, then flag, then points without concurrent reveals. Salute retains its existing motion starting at 650ms and clears before flag reveal at 3800ms. Flag flight completes at 5300ms; points panel appears at 5500ms for 1600ms. Correct-answer handoff extended to 7400ms with matching lighting duration and final fade. Timer/scoring rules unchanged; next question starts only after celebration.
Validation: Edge/WebKit outcome checks passed. Added browser assertions that both reward elements remain invisible during salute and points are visible after flag landing. Physical phone review pending. No push/deployment.
## 10 November — Remove added reward points copy
Removed the generated +N Points text from correct-answer artwork at user request. Supplied reward image, scoring and sequential celebration unchanged. JavaScript syntax passed. No push/deployment.
## 10 November — Reward artwork accompanies flag
Supplied right-answer artwork now begins at 3800ms with the flag reveal, after the water salute. Removed separate late artwork delay; handoff is 6200ms with matching lighting duration. No generated points text. Syntax passed; physical-device visual review pending. Local only, no push/deployment.
## 10 November — Flag and rays during salute, growth and delivery afterwards
Flag reveals at 650ms with rotating, softly masked golden rays and holds at centre throughout the salute. At 3800ms the supplied reward artwork appears, flag grows to 1.22 scale then flies into its HUD slot, shrinking to slot size by 5300ms. Rays fade as flight begins. Artwork holds through delivery and next question remains at 6200ms. No extra text or scoring changes. Updated browser visibility checks for the new ordering; inspected Edge salute frame. Physical-phone verification pending. No push/deployment.
## 10 November — Gameplay water rendering and shimmer
Removed per-frame Intl.DateTimeFormat construction (reuse formatter), cache the IST day until the next second or exact midnight boundary, and only rewrite timer text when the visible tenth changes. Moved the foam emission throttle ahead of layout/style reads. Replaced per-pixel exponentiation with equivalent integer multiplications and removed the inactive full-stage blur(0px) filter. During gameplay only, high-frequency ripples travel more slowly than large swells to reduce temporal shimmer at boosted current speed. Preserved ocean palette/resolution, UI water motion, boat travel, scoring, penalties and celebration volume/sequencing. HTML asset revision v5.
Measured local Edge 390x844: surface mean 4.50ms to 3.42ms (~24% reduction), p95 5.20ms to 3.90ms; overall sampled frame p95 stayed 16.8ms. Desktop measurements do not establish physical-phone frame rate. Five core tests passed and Edge/WebKit steering checks passed with stable hull size and no penalty teleport; outcome checks also run. Physical iPhone/Android confirmation pending. Local changes only; not pushed/deployed.

## 10 November — Performance update deployed
User authorized Firebase deployment. Hosting-only release ad001fa02570de72 to apl-qc-core-app-f5a3e completed. Five core tests and syntax checks passed; 924 staged file hashes and publish exclusions verified. Public HTML, runtime, core, water and CSS SHA256 hashes match local v5 files. Backend/database unchanged; no Git push. Physical-phone flicker/performance confirmation remains pending.

## 10 November — Continuous boat heave and composited sailing
User requested smoother boat movement and mobile optimization. Found bob phase depended on rapidly changing position/current, producing rapid oscillation during lane changes. Replaced with continuous 3.4s/5.7s low-amplitude heave independent of lane/boost. Sailing now updates CSS translate with stationary top/left layout; commits coordinates before existing outcome animations. Heading smoothing uses elapsed time instead of a per-frame coefficient. Entry underlying position now matches its endpoint to prevent a transient snap outside the screen. HTML revision v6. Eight-second question, penalties, hull size, foam and celebrations preserved.
Validation: five core tests and JS syntax passed. Edge/WebKit steering tests assert fixed layout coordinates, stable dimensions, no penalty teleport, no lane-dependent bob phase jump and less than 0.1px bob change per 16.67ms. Both outcome tests passed for wrong-lane bubble alignment and flag delivery. Inspected Edge steering screenshot. Physical iPhone/Android performance remains unverified. Local only; no deployment or push.

## 10 November — Supplied Wave Rider music and effects
Copied six supplied MP3s into isolated wave-rider-assets/audio with versioned filenames. Added wave-rider-audio.js and config volumes/files/1.1s crossfade. Gesture-unlocked Web Audio loops crossfade from current gain on rapid navigation; game music continues through outcome animation, menu music takes over on UI/failure/reward pages. Correct/wrong/crash cues fire at showOutcome, buttons play the supplied click. Background/pagehide suspends audio and cancels effects; foreground resumes unlocked context. Deferred cues are guarded against stale screens and late playback. HTML revision v7. No added UI and no other game modifications.
Validation: five core tests and syntax checks passed. Edge decoded all six real MP3s and verified unlock, cues, music crossfade, rapid reversal without duplicate loops and background suspend/resume. Windows Playwright WebKit exposes neither AudioContext nor webkitAudioContext; audio test explicitly skips that unsupported runtime. Physical iPhone/Android listening and relative-volume checks pending. Local only; no deployment/push. Earlier missing-audio notes are superseded by these supplied tracks; demo GIFs remain unavailable.

## 10 November — Menu-style water during gameplay
User requested no downward gameplay current. All screens now share the existing menu surface motion; removed accumulated gameplay drift and lane-change ocean zoom/boost. Boat travel, heave, steering, penalty badge, foam, salute and audio preserved. Removed obsolete water boost hook. HTML revision v8. Syntax checks passed; physical-device motion review pending. Local only, no deployment/push.

## 10 November — Stronger hull foam and stern trail
Increased hull foam size, opacity and persistence. Added paired spreading stern foam emitted from each boat's configured rear waterline; longer-lived particles leave a visible trail following turns. Retained emission throttle, interpolation and 320-particle cap to bound mobile work. Menu-style ocean, boat movement, gameplay and celebrations unchanged. HTML v9. Syntax passed; visual/device review pending. Local only, no deployment/push.

## 10 November — v9 Hosting release
User authorized deployment. Firebase Hosting deployment to apl-qc-core-app-f5a3e succeeded. Five core tests and runtime syntax checks passed; all 931 publish files verified. Seven public runtime files and six MP3s hash-match local files. Includes composited movement, menu-style water, stronger hull/stern foam and supplied audio. Backend/database untouched; no Git push. Physical-device visual/audio verification remains pending.

## 10 November — Foam below boat artwork
Moved only hull foam and stern trail rendering into a dedicated transparent boat-wake canvas above ocean and below scene. Hull artwork now naturally occludes foam, including during turning and bobbing. Foreground salute, crash smoke and sinking effects remain on existing effects canvas. Intensity, particle cap and timing unchanged. HTML v10. Syntax and Edge/WebKit steering checks passed. Physical phone review pending. Local only, no deployment/push.

## 10 November — Entrance handoff flicker
Found competing entrance top animation and timer-triggered translate sailing could overlap for a frame, summing vertical positions and moving the boat offscreen. Entrance now uses the same translate property and sailing starts on animation.finished, cancelling the completed animation before taking control. Generation guard retained and geometry refreshed at handoff. HTML v11. Edge/WebKit frame sampling through entry and first sailing frames passed with zero downward position jump. Syntax passed. Physical phone confirmation pending. Local only; no deployment/push.

## 10 November — Lane-change wake rendering overhead
User reported lag on lane changes. Sailing now publishes its numerical hull pose to the water renderer; wake placement uses the same rotation/heave origin without querying bounding rectangles, computed style or constructing DOMMatrix during sailing. Existing measured geometry fallback retained for entrance/outcome animations. Pose clears at reset/arrival. Preserved steering duration, penalty acceleration, foam intensity/cap and all outcomes. HTML v12. Syntax and Edge/WebKit steering checks passed; outcome checks verify bubble anchoring and flag delivery. Physical phone lag resolution not yet verified. Local only; no deployment/push.

## 10 November — Penalty and celebration sound accents
Added generated Web Audio accents: descending two-note penalty at -2s reveal; filtered water swell and ascending major notes at 650ms salute/flag reveal; rising flight tone at 3800ms; landing chord on flag animation completion. Existing supplied correct-answer MP3 retained. Volumes configurable independently. All scheduled sound nodes share scene/background cancellation; no extra downloads or timer changes. HTML v13. Syntax and Edge audio checks passed including ten synthesized tone nodes, MP3 decoding and crossfades. Windows WebKit audio unsupported; physical-device listening/volume balance pending. Local only, no deployment/push.

## 10 November — Public Games gallery
Added Wave Rider as the last card in Games using existing RC poster artwork/markup. Both links now identify origin; external close returns to Games or RC Games accordingly (default RC). Gameplay exit-to-selection unchanged. HTML v14, shell cache v488. Syntax checks passed. Local only, no deployment/push.

## 10 November — Hidden correct-lane entry timing
Records correctLaneEnteredSeconds as actual elapsed seconds from the question start on accepted correct-lane selection. Leaving clears it; returning replaces it; same-lane/rejected input does not change it. Penalty deductions do not affect this value. Settlement appends question ID, outcome, points and timing to saved.questionResults, persisted by the existing save path. No UI added. Records are local to this browser and current IST day, following existing daily progress reset; no backend/account synchronization. Old progress without records remains compatible. HTML revision v15.
Validation: seven core tests passed, covering fractional timing, leave/re-entry, penalties, duplicate settlement, reload persistence, wrong/unanswered questions and legacy saves. Syntax passed. No visual changes; physical-device testing not performed. No deployment or push.

## 10 November — v15 Hosting release
User authorized deployment. Firebase Hosting-only release to apl-qc-core-app-f5a3e completed. Seven core tests passed; 931 staged files verified. Public index, service worker and seven Wave Rider runtime files SHA256-match local files. Includes Games card, hidden correct-lane elapsed timing and pending movement/audio fixes since v9. Backend/database unchanged; no Git push. Physical-device verification remains pending.

## 10 November — Supplied animated How to Play slides
Copied three supplied GIFs unchanged to page-2/demo-1-v1.gif through demo-3-v1.gif and replaced first three demo images/preloads. Fourth existing slide retained. Removed overlay lane artwork from GIF slides to preserve supplied animation. Previous and Next use identical gold pill styling, sizing and opposing arrows. HTML v16. Inspected Edge mobile demo frame: controls fit and align. Supplied GIF shows True left/False right while approved live gameplay remains True right/False left; artwork was not edited and gameplay unchanged. Browser regression results recorded below. Local only; no push/deployment.
Validation completed: seven core tests and Edge/WebKit full flow checks passed (four demos, responsive layout, outcomes, retry and exit). Physical-device review pending.

## 10 November — Demo arrow alignment
Replaced baseline-dependent text arrow glyphs with fixed CSS chevrons centered by flex alignment. Preserved gold button layout and navigation. HTML v17. Syntax passed; inspected Edge 390x844 screenshot after transition. Local only; not deployed/pushed.

## 10 November — Client Wave Rider spreadsheet question bank
Replaced the copied My Carz bank with all 87 populated rows from docs/Wave Rider Question.xlsx (44 True, 43 False). Questions and explanation text preserved exactly, boolean cells mapped to game answers. Supplied Correct-answer pop-up column maps to existing rightAction explanation field, preserving feedback flow. Namespaced IDs wr-sheet-v1-N prevent historical timing records from colliding with old question IDs. Source workbook retained unchanged; empty formatted rows excluded. HTML v18. Seven core tests passed including exact extracted-content hash. Scoring, timer, lanes, shuffle and progression unchanged. Source row/question 59 uses beaker in prompt but vial in explanation; retained as supplied. No push/deployment.
Browser validation: Edge and WebKit confirmed all 87 question prompts and explanations fit 320x568 containers; actual wrong-answer flow passed. Physical-device review pending.

## 10 November — v18 Hosting release
User authorized deployment. Hosting-only deployment to apl-qc-core-app-f5a3e completed. Seven tests passed; 934 staged files verified. Live HTML, config, runtime, CSS and three demo GIFs hash-match local files. Includes 87 supplied questions (question 59 unchanged), animated demos and aligned navigation arrows. Backend/database unchanged; no Git push. Physical-device verification pending.

## 10 November — Faster correct-answer celebration
User requested a faster salute/flag/reward handoff. Compressed the approved choreography to 55% of its duration: 3.41 seconds instead of 6.2. Salute/flag reveal starts at 358ms, reward artwork and flag growth/flight at 2090ms, flag lands at 2915ms, then next question/upgrade at 3410ms. Canvas salute advances on the same scaled clock, retaining all spray and arch volume. Ship surge, rays, dimming and generated sound accents synchronized; supplied correct-answer audio unchanged. Config celebrationScale owns pacing. HTML v19. Seven core tests and Edge/WebKit outcome checks passed; inspected salute screenshot. Physical-device pacing/listening review pending. Local only; not deployed or pushed.

## 10 November — v19 Hosting release
User authorized deployment. Hosting-only deploy to apl-qc-core-app-f5a3e completed. 934 staged files verified; live HTML, config, runtime, water, audio and CSS SHA256-match local v19 files. Includes 3.41-second celebration sequence. Backend/database unchanged; no Git push. Physical-device confirmation pending.

## 10 November — Upward fast finish
Upward swipe or ArrowUp during active sailing commits the current lane, freezes remaining time, blocks further lane changes and accelerates the boat from its current position to the finish over configurable 650ms. Existing lateral turn continues smoothly; correct/wrong/centre arrival uses existing feedback. Repeated commitment and expired-time commitment rejected; next question resets commitment. Correct-entry elapsed time/scoring unchanged. No UI text/controls added. HTML v20.
Validation: eight core tests passed including timer freeze, input lock, unchanged entry-based score and centre crash. Edge/WebKit fast-finish checks cover upward pointer swipe and ArrowUp, frozen displayed timer, lane lock and correct/wrong/centre outcomes. Physical-device swipe/motion verification pending. Local only; no deployment/push.

## 10 November — v20 Hosting release
User authorized deployment. Firebase Hosting-only deployment to apl-qc-core-app-f5a3e completed. 934 staged files verified. Live HTML, config, core and runtime SHA256-match tested local v20 files. Includes swipe-up/ArrowUp lane commitment, frozen timer and accelerated arrival with correct-entry scoring. Backend/database unchanged; no Git push. Physical-device verification pending.

## 10 November — Themed landing loader
Reworked loader to match the established heading/percentage/track pattern with Wave Rider gold outline, navy panel and aqua fill. Text sits above the track instead of inside it, with readable aligned percentage; scaled fill remains clipped to rounded track. Existing asset-count progress and Next gating retained. Retry styled consistently. HTML v21. Edge and WebKit 320x568 checks passed for containment, live percentage and completion gate; inspected Edge screenshot. WebKit screenshot font-wait timed out, so its layout/gating were checked without a screenshot. Physical-device review pending. Local only; no deployment/push.

## 10 November — Reduced-motion compatibility audit
User explicitly requested full animations regardless of reduced-motion settings. Wave Rider has no prefers-reduced-motion media overrides or JavaScript preference checks, so its CSS/Web Animations/canvas sequences remain active. Ran Edge/WebKit outcome checks with reducedMotion=reduce: success salute/flag/rays/HUD delivery and failure anchoring passed. No runtime changes needed. This is browser-engine validation, not a guarantee across every physical iPhone/Android or power-saving mode. No deployment/push.
