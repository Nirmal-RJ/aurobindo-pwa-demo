# Rocket’ier

Keep these two folders beside each other:

```text
assets/
  rocket-game-assets/    Images, animation frames, audio and lesson videos
  rocket-game-scripts/   HTML, CSS, JavaScript, configuration and offline worker
```

Open `rocket-game-scripts/rocket-game.html` through HTTPS or localhost. It uses its own scoped service worker and needs no shared app scripts. Both folders can be copied together to another hosted directory. The Back to Games link targets the parent application's `../../index.html#/games`; adjust it if embedding elsewhere.

- Questions, mixtures and video mappings: `rocket-game-core.js`
- Screen behavior and animation sequences: `rocket-game.js`
- Layout and artwork placement: `rocket-game.css`
- Asset loading and cached media: `rocket-game-loader.js`, `rocket-asset-cache.js`
- Generated asset list: `rocket-game-assets.js`
- Offline installation: `sw.js`
- Requirements and implementation history: `rocket-game-details.md`, `rocket-game-progress.md`

After replacing assets, run `node build-rocket-assets.cjs` from this folder, or `npm run assets:rocket` from the repository root. The build updates the generated manifest and its references in the game HTML and local service worker. After changing versioned scripts/styles, update their version strings in the game HTML and local worker, and increment the local worker's shell version.

The original root `rocket-game.html` redirects here for existing links. Shared application code and the repository test suite remain outside these folders.


## Publish and verify

Production repository: `Nirmal-RJ/aurobindo-pwa-demo`, branch `main`, hosted by GitHub Pages at https://nirmal-rj.github.io/aurobindo-pwa-demo/.
Game entry: https://nirmal-rj.github.io/aurobindo-pwa-demo/assets/rocket-game-scripts/rocket-game.html.

Before release, run `npm run assets:rocket`, `npm run check:rocket`, `npm run test:rocket` and `node --test --test-isolation=none tests/sw.test.cjs` from the repository root. Browser checks use an external Playwright install through `ROCKET_PLAYWRIGHT`; see tests/rocket-mobile.browser.cjs and tests/rocket-folders.browser.cjs. Push the reviewed release to main, then verify the Pages deployment and live HTML/worker/manifest versions. Do not assume that a successful Git push means deployment has finished.

Read AGENTS.md and the mandatory preservation rules before changing the game. Current behavior and verification are summarized at the top of rocket-game-details.md and rocket-game-progress.md.
