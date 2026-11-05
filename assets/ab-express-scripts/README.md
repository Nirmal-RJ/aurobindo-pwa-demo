# AB Express

Portrait game; scripts and documents are isolated here. Media lives in assets/ab-express-assets/.

- [Supplied flow](docs/AB%20Express%20Game%20Flow.docx)
- [Planning](ab-express-game-details.md)
- [Rules and animation standards](ab-express-game-rules.md)
- [Progress](ab-express-game-progress.md)

Open `ab-express.html`, or select the final card in the RC games gallery.

- `ab-express-config.js`: canonical shared step pool, icon mapping, timing and asset paths.
- `ab-express-core.js`: independent sequence validation and challenge progress rules.
- `ab-express.js`: screen flow, input, loading, persistence and train presentation.
- `ab-express-audio.js`: decoded music mixer, crossfades, wrong-answer cue and synthesized button tones.
- `ab-express-effects.js`: pausable crash impact, camera shake, sparks and layered smoke.
- `ab-express.css`: portrait composition and effects.
- `build-ab-express-assets.cjs` / `ab-express-assets.js`: generated required-image manifest.
- `sw.js`: AB Express-only offline cache.

Run `npm run assets:ab-express`, `npm run check:ab-express`, and `npm run test:ab-express`. Browser coverage is `npm run test:ab-express:browser`; set `AB_PLAYWRIGHT` to the installed Playwright module if necessary. Optional `AB_WEBKIT` selects a WebKit executable. Start the local server on port 4173, or set `AB_URL`.

Demo slides 4 and 5 temporarily use the supplied references, as approved. Each challenge round has a 90-second countdown; timeout uses the failed-round flow. Practice is untimed. Supplied menu/gameplay music and wrong-answer audio are integrated; button tones are synthesized locally.

Additional verification: `npm run test:ab-express:audit` runs the seven-size layout matrix; `test:ab-express:resilience` covers touch/offline/retry, and `test:ab-express:timer` covers the countdown. Set `AB_AUDIT_VIEWPORTS=1` for result-screen viewport checks in the full flow; `AB_REDUCED_MOTION=1` verifies preserved effects under that preference. Audit evidence is recorded in the progress document.

Crash/comparison verification: `node tests/ab-express-impact.browser.cjs` (supports `AB_PLAYWRIGHT`, `AB_WEBKIT`, `AB_URL`; default test server port 4174).

Current challenge target: three consecutive rounds per star, 90 seconds each. Practice remains five rounds.
