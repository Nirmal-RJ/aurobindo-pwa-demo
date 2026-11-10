# Wave Rider

Portrait game, isolated from all existing games. Start locally at `/assets/wave-rider-scripts/wave-rider.html`; the last RC Games banner links here. No deployment or push is authorized by this implementation request.

Read wave-rider-rules.md and wave-rider-progress.md before changes. Flow documents are in docs/. Media is owned under ../wave-rider-assets/. Config, independent question bank, core progression, rendering, ocean simulation and styles live here. My Carz is read-only reference; do not import its runtime or mutate its data.

Checks: `node --test --test-isolation=none tests/wave-rider.test.cjs`; `node tests/wave-rider.browser.cjs` from the repository root with local frontend on port 4174. Browser tests require the existing machine Playwright engines. Physical-device audio/motion verification remains separate.
