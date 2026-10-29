# Solvent Master

Status: approved landing, demo, five-recipe practice, timed challenge, results, streak and replay flow implemented. Happy/sad image sequences await user assets; Rocketier unlocking is deferred.

## Start here

| Document | Purpose |
| --- | --- |
| [Game rules](solvent-master-game-rules.md) | Continuing animation, sequencing, configuration and verification expectations |
| [Game details](solvent-master-game-details.md) | Confirmed requirements and outstanding game-brief decisions |
| [Progress](solvent-master-game-progress.md) | Dated authorization, changes and verification record |
| [Contributor instructions](AGENTS.md) | Entry instructions for future contributors |

## Folder ownership

- `assets/solvent-master-game-scripts/`: this documentation and future game-owned HTML, CSS, JavaScript, configuration, builders and scoped worker.
- `assets/solvent-master-game-assets/`: game-owned images, animation frames, audio and video.

Keep runtime and media separate from Rocketier and My Carz. Reusing question content does not authorize importing another game's runtime or depending on its asset folder.

Open [solvent-master.html](solvent-master.html) through HTTPS or localhost, or use the last Games card. In landscape the stage fills the entire available viewport. Landing artwork uses proportional cover fitting with cropped background edges and no distortion; loading/Next remains inside the viewport. Other screens currently retain stretched artwork. Portrait windows retain the fitted 16:9 preview pending rotation guidance.

The lower-right loading panel occupies the Next area until all production media is downloaded and verified, the dedicated worker controls the page, and landing/button images decode. Failed loading offers Retry and reuses verified cached files. Next reveals with a 420ms settle entrance.

Next opens the four-slide demo on first play. Previous/Next navigation ends with Finish, which saves `solvent-master-demo-complete-v1`. Interrupted demos start again from slide one. Landing Next routes to mixing until practice is completed, then to challenge introduction. Mixing Play opens practice; its Demo button reopens the viewer. Practice completion, completed challenge rounds, streak and stars persist separately in `solvent-master-progress-v1`, without daily resets or a backend. See the details document for checkpoint/error behavior.

The user approved four reference WebP images as temporary demo slides. Replace `demoSlides` in config with supplied GIF paths later, regenerate the manifest and synchronize versions. Other reference images remain excluded. Screen exits take 260ms and entrances 380ms; each slide has a 220ms exit followed by a 220ms entrance. Input is locked through transitions and incoming artwork decodes before exit begins.

Run `npm run assets:solvent-master` after media changes (also runs before dev/start). The generated manifest includes production media and the four explicitly approved temporary demo references; all other reference/old files are excluded. Rebuild before publishing; synchronize manifest query versions in HTML and worker and bump the dedicated shell version after changes. No runtime code imports Rocketier or My Carz.

Run `npm run check:solvent-master` for syntax and `npm run test:solvent-master:browser` for Edge loading/retry/offline/layout checks. The browser command needs an installed Playwright package via `SOLVENT_PLAYWRIGHT`; `SOLVENT_URL` can override the default localhost:4173 URL. Runtime has no external package dependency.

Modules: config owns questions and timing; core owns rules; store owns local checkpoints; loader owns readiness/retry; solvent-master.js owns screen/demo navigation; play owns practice/challenge presentation; audio owns local synthesis. CSS owns layout, sw.js owns scoped caching/video ranges and solvent-master-assets.js is generated. Current CSS v10, config/manifest v3, flow v2, loader/core/store/audio v1, play v5, scoped shell v10 and media cache v1.

The original [game flow](docs/Solvent%20Master%20Game%20Flow.docx) is checked in unchanged. Approved clarifications in the details document take precedence.

## Reading order and precedence

Read the rules, then details, then the latest progress entries before work. Later explicit user decisions override older conflicting decisions within their stated scope. Keep details current; keep dated history in progress rather than duplicating historical snapshots across documents.
