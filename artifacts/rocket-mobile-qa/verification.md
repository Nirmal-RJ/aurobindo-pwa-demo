# Rocket’ier mobile compatibility checks

Checked 24 October 2026 using automated browsers on Windows. These are browser-engine/device-viewport checks, not tests on physical phones.

| Configuration | Result |
|---|---|
| Chromium, touch enabled, 393 × 851 | Animated gameplay flow passed; MP4 decoded with readyState 4 |
| WebKit, touch enabled, 390 × 844 | Animated gameplay flow passed |
| WebKit, touch enabled, 320 × 568, native element.animate disabled and container units disabled | CSS animation and proportional-layout fallbacks passed |
| Chromium and WebKit, 320px portrait ↔ landscape, reduced motion | Preparation, readable formula and finite pipe geometry passed |

The full flows exercised moving conveyor, continuous docking (measured changing position), formula-first reveal, nose/tank preparation, a physical touch Fill tap adding exactly one increment, Undo, successful launch smoke, flight cinematic, dotted-route motion (measured changing position), statistics, failure smoke, failure dialog, lesson layout and retry with a fresh timer. No JavaScript page errors were recorded. Screenshots are in this directory.

All 36 core/UI/loader/service-worker tests and syntax checks passed. Added regression coverage for failed pointer capture, global release and legacy touch cancellation.

First-load follow-up: all 38 targeted tests passed after adding image readiness checks. A separate cold-context Chromium/WebKit regression deliberately aborted the initial mission-brief request, verified Start remained locked during decoding, and confirmed recovered artwork appeared immediately on the first visit without reopening. Run with `npm run test:rocket:first-load` using the same Playwright environment.

## Compatibility changes

- CSS keyframes preserve essential docking/route movement if native Web Animations is absent or rejects an animation.
- Older container/viewport units receive a dynamically measured equivalent stylesheet before Play unlocks.
- Touch/mouse fallback handles browsers without Pointer Events. Global release/cancellation prevents a stuck Fill hold; pointer-capture exceptions no longer abort input.
- Safari-prefixed blur/masking and touch-selection suppression are included.
- Lesson sizing follows visual viewport changes; inline video attributes are explicit and backgrounding pauses lesson playback.

## Remaining physical-device checks

Windows WebKit reported MP4 readyState 0 in both the game and a separate uncached video probe. Its video decode result cannot verify iPhone playback. Source lessons use AVC/H.264 video with MP4 audio tracks. Chromium decoded and played a lesson successfully. Real iPhone/Android video playback, audio autoplay/volume, GIF frame pacing, low-power modes, thermal load and hardware frame rate remain unverified.

Use an HTTPS share URL: the initial download gate requires service workers and persistent browser caching. Some in-app browsers may restrict those capabilities.

## Re-run

Install Playwright outside the project or as a development dependency. Set ROCKET_PLAYWRIGHT to its module location if it is not resolvable normally; install the WebKit browser, set PLAYWRIGHT_BROWSERS_PATH if using a custom location, run the local server, then run `npm run test:rocket:browser`. Chromium uses the installed Windows Edge binary; ROCKET_URL can select another local deployment.
