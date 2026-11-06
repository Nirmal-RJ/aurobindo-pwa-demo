# Match It, Blast It

Portrait game, isolated in this folder. Supplied artwork lives in `../match-it-blast-it-assets/`, with the original page folders and filenames preserved.

Open `match-it-blast-it.html` or the last card in the RC games gallery.

- `match-it-blast-it-config.js`: asset version, theme, pair mapping, timer and animation timings.
- `match-it-blast-it.js`: preload, input, demo, timer, checking, feedback and effects.
- `match-it-blast-it.css`: responsive composition and animations.
- `sw.js`: versioned, game-scoped cache; online navigation refreshes the shell.
- [Rules](match-it-blast-it-rules.md) and [progress](match-it-blast-it-progress.md).

Syntax: `node --check assets/match-it-blast-it-scripts/match-it-blast-it.js`

Browser tests: `node tests/match-it-blast-it.browser.cjs`, with `AB_PLAYWRIGHT` pointing to Playwright and `AB_WEBKIT` to the installed WebKit executable. Test server uses port 4174.

The approved developer handoff is now connected, including three demos, saved three-diya streaks, adaptive best-average targets, Gold Stars and wrong-pair feedback routing. The round remains 60 seconds; the initial qualifying target is strictly under 20 seconds. The three supplied demo slides are connected in numerical order. All five supplied feedback WebM videos are mapped by pair and loaded only on demand. Correct cracker bursts use the supplied Blast 2 MP3. Supplied menu/game music and looping sparkle audio are integrated, with the AB Express timer tick copied into this game. A persistent top-right Exit returns to game Home and cancels active playback/round activity.

`match-it-blast-it-logic.js` owns pure progression rules and storage validation. Run `node tests/match-it-blast-it.logic.cjs` for strict boundary, reset and award tests. Persistence uses the local browser key `match-it-blast-it-progress-v1` and is independent of asset cache versions. Future pair video paths can be supplied as `video` on the corresponding config pair, relative to the game's asset folder.

`match-it-blast-it-audio.js` preloads/decodes audio, unlocks on user gestures, crossfades menu/game loops, synchronizes the sparkle loop and pauses with the game. Audio paths, volumes and crossfade duration are in config. Run `node tests/match-it-blast-it.audio.cjs` with the same browser environment variables for audio lifecycle checks.

Animation pacing is centralized in `BlastConfig.timing`. Scene crossfades and geometric motion use the same pause-aware clock as game sequencing. Run `node tests/match-it-blast-it.sequence.cjs` for DOM continuity, ignition ordering, pause/resume and frozen submission time checks.

Feedback uses the configured YouTube ID through the lazily loaded IFrame API. Local WebM files are fallback-only: no local video element or source is created until YouTube fails or initialization times out. Autoplay restrictions show Tap to play instead of downloading a fallback. `match-it-blast-it-video.js` owns player cleanup.
