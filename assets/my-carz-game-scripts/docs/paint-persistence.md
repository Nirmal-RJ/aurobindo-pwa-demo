# My Carz paint persistence contract

Current storage is local only, as confirmed by the user on 28 October 2026. No network endpoint is enabled.

The existing Repository adapter saves/loads a complete version-2 player profile. Per-model preferences are stored outside the daily progress record:

```json
{
  "version": 2,
  "preferences": {
    "carColors": { "car-1": "pink", "car-2": "red" }
  }
}
```

- Keys are stable `my-carz-config.js` car IDs; values are configured paint IDs. Preserve IDs when renaming/reordering models.
- `day.colors` remains a compatibility projection in current car order. Old daily/legacy colors migrate without deleting old storage. Invalid preference values fall back to validated daily color/default.
- Midnight resets unlocks, selected-car eligibility, attempts and daily statistics, while retaining every model's color, including currently locked models. Unlocking a model again restores its paint.
- `checkpoint()` includes preferences immediately but excludes unfinished-level answers/statistics. Existing adapter save failures still propagate; repository serialization retains ordering.
- A future authenticated backend adapter must round-trip `preferences.carColors` with the profile and preserve it when resetting/archiving daily gameplay. User identity, authorization, endpoint and cross-device conflict resolution belong to that integration; none are invented here.

After an upgrade, continuation opens My Cars. Players can select any unlocked model and paint before explicitly starting the next drive. Back returns home. The collection page opened normally retains its reference Back flow.
