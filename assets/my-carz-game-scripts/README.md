# My Carz

Keep these folders beside each other:

- assets/my-carz-game-scripts/: runtime, config, tracking documents, builder and scoped offline worker.
- assets/my-carz-game-assets/: page artwork, temporary inherited car/scenery images, fonts, icon and audio.

Open assets/my-carz-game-scripts/my-carz.html through HTTPS or localhost. Root my-carz.html redirects here; Back to games targets ../../index.html#/games. A dedicated worker controls this game and caches all production media before Next unlocks. The root worker only retains the compatibility redirect.

Read my-carz-game-details.md and my-carz-game-progress.md before changes. Storage key my-carz-progress-v2 keeps schema-versioned local checkpoints and archives. Legacy my-carz-colors-v1 is read for paint migration without deleting its data. My Carz owns media copies; original Good Bad Ugly assets are untouched.

Edit my-carz-config.js for questions, nine car records, colors, timing, help GIFs, rotation frames and audio volumes. The async repository adapter in my-carz-store.js is the integration boundary for a future backend.

Commands from repository root:

- npm run assets:my-carz regenerates production media sizes/revisions; also runs before dev/start.
- npm run check:my-carz checks runtime syntax.
- npm run test:my-carz checks rules, checkpoints, resets and caching.
- npm run test:my-carz:browser runs optional Edge browser QA. Set CARZ_PLAYWRIGHT to an installed Playwright package and CARZ_URL to the game URL if the server is not localhost:4187.

When changing runtime files, synchronize URL versions in HTML/scoped sw.js, then bump the dedicated shell version. Reference/old media is excluded from production preload. See details/progress for approved behavior and verification limits.

## Continue from another PC

1. Clone this repository, or run `git pull --ff-only origin main` in your existing clean checkout on main.
2. Use Node.js 24 (this handoff was validated with Node v24.14.1). Runtime has no npm dependencies to install.
3. Run `npm start` from the repository root. Asset manifests rebuild automatically.
4. Open http://localhost:4173/assets/my-carz-game-scripts/my-carz.html or select My Carz in the games gallery.
5. Before changes, read AGENTS.md, my-carz-game-details.md and my-carz-game-progress.md. Pending inputs are listed in the details document.
6. Run `npm run check:my-carz` and `npm run test:my-carz` after changes. Browser QA is optional and needs a separately installed Playwright package; no absolute path from this development PC is required by runtime.

The agreed source flow is retained in [docs/Carz Game Flow.docx](docs/Carz%20Game%20Flow.docx). The details document records the later approved clarifications and takes precedence where the source flow was refined. Browser verification reports/screenshots are in `artifacts/my-carz-flow/` at repository root. The older `artifacts/my-carz-opening/` captures are historical opening-page evidence.

Game saves and media caches are local to the browser/device and are not transferred by Git. Source, media, configuration, documentation and QA evidence are included in the repository. A home PC starts with its own local player progress.

Handoff test status (27 October 2026): targeted My Carz/Good Bad Ugly/root-worker checks pass (48 tests). Full repository suite has two existing Snake failures (beginTutorial/slitheringBody undefined); see progress notes.
