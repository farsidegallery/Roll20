# GM Utilities — API Scripts

Published scripts installed in the Roll20 game. High-level notes only; see changelogs or file headers for detail.

| File | Notes |
|------|--------|
| `Modified SmartAoE.js` | **v0.30.8-farside** — Production SmartAoE mod: fix global save mod not applying when paired with `#` Dex label; readable 5e save tooltips; active global save mods on PC saves; hide unset secondary damage; 5e PC save roll fix |
| `5eActionMenuModified.scard` | **v3.2.1** — Fix config gear icon and per-character settings fall-through (rest-button toggle persists); wrap settings-init early returns in code blocks; Warlock multiclass3 pact-slot level; v3.2.0: reject AoEControlToken, empty spell-hash foreach guard, rest-button conditional split |
| `Lazy Experience.js` | **v0.1.15** — Session XP tracking; `!xp npcdeath` for ScriptCards triggers (no GM player required); deduped NPC death prompts |
| `Corpse Cart.js` | **v0.07** — Auto-buries uncontrolled NPC corpses on dead marker via Concentration path (ScriptCards/TokenMod observers + native `change:graphic`); not tied to Combat Master |
| `One Tint One Aura.js` | **v1.6.3.DJM** (HealthColors) — NPC/PC health tint and Show Dead NPC; dependency in the death pipeline (no Farside code changes) |
