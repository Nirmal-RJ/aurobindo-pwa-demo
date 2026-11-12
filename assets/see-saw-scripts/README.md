# See Saw — Handoff & Startup Guide

## Overview

**See Saw** is a portrait (`9:16` / `1080x1920`) timed HPLC troubleshooting challenge game integrated into the `#/rc-games` gallery of the Aurobindo PWA (`assets/see-saw-scripts/see-saw.html?v=1&from=rc-games`). Players match each of the **5 HPLC Symptoms** on the Left Seat of the See Saw with its **Probable Cause** rock on the Right Seat before the configurable per-question countdown timer (`10` seconds) expires.

## Directory Layout

- `assets/see-saw-assets/`:
  - `page-1/` through `page-12/`: Supplied backgrounds, buttons, rock sprites, pop-up panels, and reference images.
  - `demo/`: `1.gif`, `2.gif`, `3.gif` (`1080x1920` animated How-to-Play demo slides).
  - `mascot/`: `idle.gif`, `correct-answer.gif`, `wrong-answer.gif`, `time-up.gif` (`350x600` animated mascot states).
  - `audio/`: `menu-bgm.mp3`, `game-bgm.mp3`.
- `assets/see-saw-scripts/`:
  - `see-saw.html`: Self-contained portrait game shell (`page-1` through `page-13`).
  - `see-saw.css`: Responsive `9:16` stage layout and animations matching `page-1-reference.webp` through `page-12-reference.webp`.
  - `see-saw-config.js`: Central configuration (`questionSeconds: 10`, `maxStars: 3`, audio volumes/crossfades, and the 5 Symptom–Cause pairs with `youtube` and `video` fields ready for video links).
  - `see-saw-core.js`: Pure, deterministic state machine for onboarding, round shuffling, streak tracking, per-question `timeToBeatMs`, `Too slow!` detection, mandatory video completion locks, retry-same-question then restart from `1/5`, and `localStorage` persistence (`see-saw-progress-v1`).
  - `see-saw-audio.js`: Web Audio API + HTML5 Audio fallback controller with `1.1s` crossfading between menu and gameplay BGM and synthesized SFX cues.
  - `see-saw-video.js`: YouTube IFrame API player with local `<video>` fallback and interactive placeholder player while video links are pending.
  - `see-saw.js`: UI controller, preload gate, pointer drag-and-drop + tap-to-place + keyboard interaction, and high-resolution timer.
  - `sw.js`: Scoped service worker (`see-saw-cache-v1`).
  - `docs/SEE SAW.docx`: Original flow specification document.

## Running Tests

```powershell
node --test tests/see-saw.test.cjs tests/sw.test.cjs
```

