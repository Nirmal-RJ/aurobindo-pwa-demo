# Discussion directory

The entry flow is **Global / RC → choose a game or General Discussion → chat**. Changing spaces returns to that space's directory. Discuss in RC remains a contextual shortcut to the matching game's (or General Discussion's) RC conversation.

## UI decisions

- Six predictable cards: General Discussion pinned first, then the five public Games-page titles from newest to oldest. No version picker or duplicate builds in navigation.
- One clickable/focusable target per card, with a small game image above its name and a navigation chevron. Repeated descriptions and action footer rows are omitted. Entire poster images retain their proportions; the image never becomes the only source of the game's name.
- General Discussion uses a distinct speech-bubble illustration and independent conversation scope, rather than a fake game/build. It has no release-voting panel or game-feedback controls.
- Global and RC names stay visible as the space context. Chat headers show the selected topic, and a back arrow plus All discussions return to the directory. Browser Back/Forward and deep links work.
- Unread badges come from the local adapter, not invented online/activity counts. Viewing a directory does not mark its messages read. Card previews request only existing local images, never game scripts/packages.
- Desktop automatically fills compact columns; phones use two. Directory scrolling is separate from chat scrolling; returning preserves the directory scroll position. Strong focus states, real links, descriptive accessible names and native keyboard navigation remain.
- Game messages retain their original build association and independent voting state. A game card opens the latest available demo build; navigating to an original reference can restore its precise stored build context.

## References consulted

- [Material Design: Cards](https://m1.material.io/components/cards.html): clear entry points, hierarchy, restrained actions and readable captions.
- [Slack: Conversation topics and descriptions](https://slack.com/help/articles/201654083-Set-a-conversation-topic-or-channel-description): visible conversation context and purpose.

These are design references only. The implementation uses this app's branding, existing local game images and plain frontend modules. No UI dependency or design-service integration was added.

## Space identity in directories and chats

- Global uses teal/mint surfaces, circular room symbols and a Shared team review label. RC uses amber/warm surfaces, diamond symbols and a Ghost testers only label. Identification does not depend on color alone.
- The top bar, sidebar selection, directory accents, chat header, own-message bubbles, composer and Send action share the current space palette. Desktop has an additional persistent space badge; mobile keeps a compact badge directly above the conversation title.
- Chat headers include the same game image and name used by directory cards. General Discussion has a speech-bubble thumbnail. Global reference cards retain teal source styling when embedded inside RC, alongside their explicit FROM GLOBAL label.

## Finished interaction pass

Visible message actions work with mouse, keyboard and touch. Shared action sheets avoid separate conflicting menus. Optional swipe-to-reply and long press complement visible controls; vertical scrolling, text selection and system edge gestures take precedence. Native modal dialogs contain focus and support Escape; dismissing actions returns focus to the source. Mobile review panels become bottom sheets. Composer drafts are isolated by account, room and topic.

Desktop Enter sends while touch Return inserts a line. Screenshot inspection includes a gallery, zoom, Fit, panning and download. Attachment preparation and send states disable conflicting actions and guard against late completion after navigation. Small-screen layouts account for reduced keyboard viewport height; touch controls have expanded hit areas. Reduced-motion preferences are respected.

Additional primary references consulted:

- [Slack keyboard shortcuts](https://slack.com/help/articles/201374536-slack-keyboard-shortcuts): message navigation and contextual actions.
- [Microsoft Teams messaging](https://support.microsoft.com/en-us/teams/chat/send-and-read-messages-in-microsoft-teams): familiar reply, reaction and message-action hierarchy.
- [Apple gesture guidance](https://developer.apple.com/design/human-interface-guidelines/gestures): familiar optional gestures alongside discoverable controls.
- [Apple Messages replies](https://support.apple.com/en-ie/guide/iphone/iph82fb73ba3/27/ios/27): swipe-right reply convention.
- [Android touch target guidance](https://support.google.com/accessibility/android/answer/7101858): generous interactive bounds on touch screens.

These patterns inform this app's own UI; this is not a complete clone of any messenger. Login/Profile use the copied review-session API through the local same-origin proxy. Production deployment/routing are pending. Chat remains a labeled local preview; multi-user delivery and chat membership enforcement require separately approved backend integration.
