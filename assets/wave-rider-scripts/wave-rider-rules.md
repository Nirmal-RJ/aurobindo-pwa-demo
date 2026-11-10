# Wave Rider approved rules

Source: both supplied flow documents in docs/ plus user clarifications, 10 November 2026. Later user decisions override document conflicts.

- Portrait. Full mobile viewport; desktop centered portrait stage. Artwork remains proportionate. Last card in RC Games only.
- Load all runtime images before Next. Four first-visit demo pages; How to Play reopens them. Supplied WebP slides used temporarily: GIFs/audio not supplied.
- Nine boats: Bamboo Raft default, then Round River Boat, Explorer Rowboat, Pedal Cruiser, Coastal Voyager, River Runner, Race Champion, Grand Yacht, Luxury Voyager. Final unlock takes eight seven-flag streaks (56 correct answers without failures).
- Each question starts centered, eight seconds. Right=True, left=False (this overrides the inverse reference labels). After first lane selection, only left/right swaps; never center again. Each subsequent actual lane change removes two seconds. Same-lane input does not count as a change. No fixed swipe-count cap: latest explicit user instruction is to swipe until zero.
- Evaluate final lane at zero/obstacle. No lane causes lighthouse crash/blast; incorrect lane sinks boat. Penalty exhaustion still grades final lane: correct grants a flag with zero points. No separate score deduction per extra swipe.
- Correct question score: maximum eight minus actual elapsed seconds at the final accepted lane selection, rounded to nearest whole point; no score for wrong/unanswered/penalty-exhausted answers. Score persists for the IST day. This rounding is an implementation convention; content itself is unchanged.
- One flag per correct answer, seven in a row upgrades next boat; reset flags. Correct feedback flows automatically to next question or upgrade. Failure resets flags and shows guidance/Try Again. User clicks Continue on upgrade.
- Selection is available on reopening the game and whenever Exit returns to boat selection; selected unlocked boat does not affect progression. Selection is locked while sailing. Exit goes to game home, restores selection of unlocked boats and resets only current flags, not score or unlocked boats. External close from home returns to RC Games.
- Final boat unlock grants one star. Continue after a star restarts the progression from scratch until three stars earned that IST day; daily score is retained. After three, sailing remains available without extra stars. Midnight IST resets all daily progression, boats, score and stars; completed onboarding remains remembered.
- Backgrounding does not pause the logical timer. Reopening discards only the current flag streak. Native/mobile browser storage is local only and does not sync across devices.
- Supplied water-bg.webp is flat cyan. User explicitly authorized simulated ocean water. Isolated canvas layers render directional ripples/crests with no new network dependency.
- Never alter My Carz. Its approved question prompt/rightAction text is copied exactly into this game's config; Good maps to True and Bad maps to False. The independent deck shuffles and exhausts before repeating.
