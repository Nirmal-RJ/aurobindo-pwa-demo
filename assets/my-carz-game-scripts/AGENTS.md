# My Carz contributor instructions

Read `my-carz-game-details.md` and `my-carz-game-progress.md` before changes. Follow the mandatory approval and preservation rule at the top of both documents and the root AGENTS.md. Update progress after every authorized feature/fix. Preserve smooth animation sequencing, timing, continuity and sound synchronization; report browser/device verification limits.

Runtime and tracking documents live here. All My Carz media lives in sibling `../my-carz-game-assets/`. Root `my-carz.html` is a compatibility redirect. This folder's dedicated sw.js controls runtime/media caching. The root worker keeps only the compatibility redirect. Keep HTML/runtime versions, the scoped worker and generated media manifest synchronized.

The checked-in source flow is `docs/Carz Game Flow.docx`; later approved clarifications live in the details/progress documents. README.md contains home-PC setup and validation commands. Do not depend on a Downloads-folder document or a machine-specific QA installation path.
