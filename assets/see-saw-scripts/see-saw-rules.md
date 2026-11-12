# See Saw — Game Rules & Specification

## 1. Orientation & Stage Geometry
- **Portrait Game**: Reference resolution `1080x1920` (`9:16` aspect ratio).
- **Responsive Viewport**: Full safe-area viewport on mobile portrait (`320x568`, `390x844`), centered `9:16` portrait stage on tablets/desktop (`768x1024`), and a portrait-lock overlay on mobile landscape that pauses timers and audio.
- **Persistent Top Close Button**: Every page (`page-1` through `page-13`) displays a top-right Close (`×`) button returning to `#/rc-games` (or `#/games` when opened with `?from=games`).

## 2. 5 Symptom ↔ Probable Cause Pairs
1. **High Pressure** (`1-high-pressure.webp`) ↔ **Column Blockage** (`11-column-blockage.webp`)
2. **Pressure Fluctuation** (`22-pressure-fluctuation.webp`) ↔ **Air Bubble** (`22-air-bubble.webp`)
3. **Peak Tailing** (`33-peak-tailing.webp`) ↔ **Column Deterioration** (`33-column-deterioration.webp`)
4. **Low Pressure** (`44-low-pressure.webp`) ↔ **Leakage** (`44-leakage.webp`)
5. **Retention Time Shift** (`55-retention-time-shift.webp`) ↔ **Mobile Phase Variation** (`55-mobile-phase-variation.webp`)

## 3. Page-by-Page Flow (`SEE SAW.docx` + Confirmed Clarifications)
- **Page 1 (Landing & Preload Gate)**:
  - Displays `page-1/page-1-bg.webp`.
  - Preloads and decodes all production images and both BGM audio tracks (`menu-bgm.mp3`, `game-bgm.mp3`) with live percentage progress and retry support before revealing `next-button.webp`.
  - Clicking `Next`:
    - First-time player (`!onboardingComplete`): opens **Page 2** (`Demo 2.1–2.3`).
    - Returning player (`onboardingComplete === true`): opens **Page 4** (Home Page).
- **Page 2 (Demo Page — 2.1, 2.2, 2.3)**:
  - Displays `demo/1.gif`, `demo/2.gif`, and `demo/3.gif` with an immediately clickable `Next` button (`next-button.webp`) to advance/skip.
  - When entered during first-time onboarding, finishing `2.3` advances to **Page 3**.
  - When entered from Page 4 (`Demo` button), finishing `2.3` returns directly to **Page 4**.
- **Page 3 (First-Time 5 Videos)**:
  - Shows all 5 Symptom–Cause videos in shuffled order (`Video 1 of 5` .. `Video 5 of 5`) with the current Symptom title in `title-and-question-panel.webp`.
  - `Next` (`next-button.webp`) remains disabled until the current video finishes playing.
  - Completing all 5 videos sets `onboardingComplete = true` in `localStorage` (`see-saw-progress-v1`) and opens **Page 4**.
- **Page 4 (Home Page — Timed Challenge)**:
  - Displays `page-4/page-4-bg.webp` with `"5 questions · 10 seconds each"` (driven by `SeeSawConfig.questionSeconds`).
  - `Start Challenge` (`start-challenge-button.webp`) starts a new 5-question round on **Page 5**.
  - `Watch Videos` (`watch-videos-button.webp`) opens **Page 13**.
  - `Demo` (`demo-button.webp`) opens **Page 2** (`2.1–2.3`) and returns to **Page 4**.
- **Page 5 (Main Gameplay Stage)**:
  - Displays question counter (`1/5` .. `5/5`), prompt (`Match the Symptom with its Probable Cause`), countdown timer (`00:10` .. `00:00`), Mascot GIF (`mascot/idle.gif`), See Saw with Left Seat Symptom Rock and Right Seat `?` drop target, and Answers Tray with all 5 Probable Cause rocks.
  - Supports both **drag-and-drop** and **tap-to-place** (plus keyboard `Enter`/`Space`), evaluating immediately on placement.
- **Page 6 (`Correct!` Pop-up)**:
  - Shows `page-6/correct-pop-up.webp`, Mascot `mascot/correct-answer.gif` (plays once and holds pose), balanced See Saw (`0deg`) with golden aura, elapsed time (`e.g. 5.2 s`), `1..5` streak dots with pop animation, and full celebration confetti (ribbons, stars, sparkles).
  - Holds for `3.8s` (giving ample time to celebrate and recognize the answer), or auto-advances earlier upon user tap to the next question (or **Page 10** when `5/5` streak is completed).
- **Page 7 (`Wrong!` Pop-up), Page 8 (`Time Up!` Pop-up), and Page 12 (`Too slow!` Pop-up)**:
  - Resets streak to `0`.
  - **Page 7**: Triggered on wrong cause rock (`mascot/wrong-answer.gif`, plays once).
  - **Page 8**: Triggered when countdown reaches `00:00` (`mascot/time-up.gif`, plays once).
  - **Page 12**: Triggered when pursuing Star 2 or Star 3 and the player selects the correct cause rock, but `elapsedMs >= timeToBeatMs[questionId]` from the previous star-winning round (`Your time` vs `Time to beat`).
  - Clicking `Watch video | try again` (`watch-video-and-try-again-button.webp`) opens **Page 9**.
- **Page 9 (`Watch and try again` Modal)**:
  - Plays the failed question's video (`Try again` button `page-9/try-again-button.webp` is available immediately; watching the full video is optional).
  - Clicking `Try again` returns to **Page 5** for the **same question** until the player answers it right; once answered right, a fresh 5-question round restarts from **Question `1/5`**.
- **Page 10 (`New Star!`) & Page 11 (`Star Earned`)**:
  - **Round Definition**: All 5 questions make one complete round. Questions within the same round are never compared against each other.
  - **Star 1**: "5 in a row = first star". Answer 5 questions in a row within the 10s countdown timer per question (no time-to-beat pressure). When won, the round average time (e.g. `3.4 s`) becomes the single, easy-to-understand benchmark time (`timeToBeatMs`) for every question in the next star round.
  - **Star 2 & Star 3**: "Beat previous round average = next star". For each question, the player simply needs to answer faster than the winning round average benchmark. If all 5 questions beat the benchmark, the next star is earned and the new, faster round average becomes the new benchmark for Star 3.
  - **Star Persistence**: Player can win up to 5 lifetime stars, with at most 3 earned per IST day. Earned stars and benchmark times are permanent and never reset at midnight.
  - Shows **Page 10** (`This Round` average time and `Previous best` average time).
  - Clicking the bottom button on Page 10 opens **Page 11** (`1 of 3 stars earned` .. `3 of 3 stars earned`), where `Play Again` starts the next round on **Page 5**.
- **Page 13 (`Watch Videos` Page)**:
  - Lists all 5 Symptom–Cause pairs so players can watch any training video on demand and return to **Page 4** (`Home`).



## 12 November ? Approved star limits and non-star completion (supersedes earlier three-star summaries)
- Maximum 5 lifetime stars and 3 new stars per IST day. Lifetime stars/benchmark persist; daily count alone resets at midnight IST.
- A completed five-match round awards a star only when both limits allow it. Practice remains available after either cap.
- New-star rounds preserve the existing page-10 background, star and animated rays; summary shows progress out of 5 lifetime stars.
- Non-star rounds use round-complete-bg-v1.webp and Well Played artwork, with no New Star heading/star/rays. Times remain visible and Play Again directly starts another round without a star-earned screen or star sound.
- Earlier home star badge notes are obsolete: that badge was removed at user request.

## 12 November � Drag-only input override
Answer selection is drag-and-drop only, with touch or mouse. Tap-to-answer and direct Enter/Space answer submission are removed; earlier tap/keyboard placement descriptions are obsolete.

## 12 November � Fixed countdown override
Every attempt and retry counts down from configured questionSeconds (10 seconds), independently of saved average. A correct drop above the previous star-round average shows Too slow; equal/below shows Correct. No response by 10 seconds shows Time Up. This supersedes earlier benchmark-as-countdown and strict-less-than/retry-exemption descriptions.

- Latest equality clarification: a correct match at or above the saved average is Too slow; only strictly faster is Correct. Fixed 10-second countdown remains unchanged.


## 12 November - First-time video checklist (supersedes sequential Page 3)
After the three demo slides, show the Watch Videos list with supplied watch-to-unlock.webp heading. Videos may be watched in any order. Mark each fully completed video with a green tick and save watchedVideoIds immediately. Closing/reopening retains partial ticks and returns to the list. Start Game remains disabled until all five are completed, then opens home and saves onboardingComplete. Existing fully onboarded players retain access. Ordinary Watch Videos stays available from home. Retry videos remain optional to finish.
