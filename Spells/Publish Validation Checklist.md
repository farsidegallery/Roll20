# Publish Validation Checklist

Track Roll20 publish and in-game validation for scripts updated **Aug 13–15, 2026**.

**Legend — Update batch**
- **HB** — Hexblade's Curse pattern (`CurseCaster`, `[Hexblade Curse]`, crit on 19, removed old HexHeal-on-kill)
- **HB+** — Hexblade pattern **plus** spell-specific fixes (see Notes)
- **HP** — Hold Person rework (saves, twin, wild magic, mixed PC/NPC)
- **DM** — Detect Magic-only fixes

**Deferred — AuraTrigger (removed from this checklist)**  
After the mistakenly published HB batch is validated, these move to AuraTrigger scripts instead of standalone spell/token validation: Cloudkill, Blade Barrier, Evard's Black Tentacles, Guardian of Faith, Maddening Darkness, Spirit Guardians.

**Standard smoke test (attack / save spells)**
- [ ] Script runs without ScriptCards error
- [ ] Version in chat/card header matches **Ver** column
- [ ] Hit or save resolves; damage/healing applies to correct bar
- [ ] Resistance / immunity checked for correct damage type
- [ ] Hexblade curse: +PB damage when `[*T:CurseCaster]` = caster token
- [ ] Crit on natural 19 when target is cursed by caster (attack spells)

**Standard smoke test (Detect Magic)**
- [ ] Non-Sorcerer reaches Choose Function menu
- [ ] New Cast deducts slot; Ritual does not
- [ ] Refresh runs radar without extra slot
- [ ] Concentration attribute shows `Detect Magic`

---

## Per-spell validation table

| Spell | File | Ver | Batch | Syntax | Posted | Tested | Pass | Notes |
|-------|------|-----|-------|:------:|:------:|:------:|:----:|-------|
| Acid Splash | `Acid Splash.scard` | 1.1.4 | HB | [x] | [x] | [x] | [x] | Save spell; HB on failed save damage |
| Armor of Agathys | `Armor of Agathys.scard` | 1.0.3 | HB | [ ] | [ ] | [ ] | [ ] | |
| Blight | `Blight.scard` | 1.1.2 | HB | [x] | [x] | [x] | [x] | |
| Chain Lightning | `Chain Lightning.scard` | 2.1.1 | HB | [x] | [x] | [x] | [x] | Multi-target save |
| Chaos Bolt | `Chaos Bolt.scard` | 1.0.6 | HB+ | [x] | [x] | [x] | [x] | Jump dup guard; crit `$DamageRoll`; resistance after type pick |
| Chill Touch | `Chill Touch.scard` | 1.2.2 | HB+ | [x] | [x] | [x] | [x] | `DisadvantageMarker` on undead hit; twin dup guard |
| Chromatic Orb | `Chromatic Orb.scard` | 1.3.3 | HB | [x] | [x] | [x] | [x] | |
| Create Bonfire | `Create Bonfire.scard` | 1.1.1 | HB | [ ] | [ ] | [ ] | [ ] | |
| Detect Magic | `Detect Magic.scard` | 2.1.3 | DM | [x] | [x] | [x] | [x] | `>ChooseFunction`; `[&SpellName]` concentration; Dismiss clears marker + concentration |
| Disintegrate | `Disintigrate.scard` | 2.1.3 | HB | [x] | [x] | [x] | [x] | |
| Dissonant Whispers | `Dissonant Whispers.scard` | 1.0.2 | HB+ | [x] | [x] | [x] | [x] | WIS save; Pass/Crit dmg; deafened guard; Thought Shield; `DisWhispers*` death labels; save `--X|` |
| Eldritch Blast | `Eldritch Blast.scard` | 2.0.6 | HB+ | [x] | [x] | [x] | [x] | Warlock beam count; VFX before `--w1` Repelling Blast; crit 19; `EBDead`/`EBHexHeal`; reentrant |
| Feeblemind | `Feeblemind.scard` | 1.1.3 | HB+ | [x] | [x] | [x] | [x] | INT save; half dmg on pass; fail → INT/CHA 1; `FeeblemindBy` dismiss; save `--X|`; `:Died|` |
| Finger of Death | `Finger of Death.scard` | 1.1.3 | HB | [x] | [x] | [x] | [x] | CON save; 7d8+30 necrotic; `FinalHP` death check; `:Died|` cleanup; humanoid zombie msg; no spell HexHeal (trigger only); reentrant |
| Fire Bolt | `Fire Bolt.scard` | 1.0.6 | HB | [x] | [x] | [x] | [x] | TwinFeat gate; `:Died` cleanup; no FailTable/`$Shot`; Empower Hit label; reentrant |
| Frostbite | `Frostbite.scard` | 2.0.0 | HB | [x] | [x] | [x] | [x] | CON save rewrite; half dmg on pass; fail → `DisadvantageMarker`; block `ResultText2` + `[&loop]` output; twin dup guard; `:Died` cleanup; reentrant |
| Guiding Bolt | `Guiding Bolt.scard` | 1.0.0 | HB | [x] | [x] | [x] | [x] | Level+target cast; `far_LoadTokenMarkers`; crit 19; `:Died` cleanup; advantage text only (no marker); global whisper for slot pick; reentrant |
| Hellish Rebuke | `Hellish Rebuke.scard` | 1.0.0 | HB | [x] | [x] | [x] | [x] | Reaction; DEX save half/full; block `ResultText`; `:Died` cleanup (no HexHeal); slot deduct on kill; `far_LoadTokenMarkers`; reentrant |
| Hold Person | `Hold Person.scard` | 2.3.0 | HP | [x] | [x] | [x] | [x] | v2.3.0 rework (external review); save loops, twin, wild magic, mixed PC/NPC; XGtE non-humanoid invalid target |
| Ice Knife | `Ice Knife` | 1.0.2 | HB | [ ] | [ ] | [ ] | [ ] | |
| Inflict Wounds | `Inflict Wounds` | 1.0.1 | HB | [ ] | [ ] | [ ] | [ ] | |
| Melf's Acid Arrow | `Melf's Acid Arrow` | 1.0.2 | HB | [ ] | [ ] | [ ] | [ ] | |
| Mental Prison | `Mental Prison` | 1.0.1 | HB | [ ] | [ ] | [ ] | [ ] | |
| Mind Sliver | `Mind Sliver.scard` | 1.0.5 | HB | [ ] | [ ] | [ ] | [ ] | Renamed to `.scard` |
| Poison Spray | `Poison Spray.scard` | 1.0.4 | HB | [ ] | [ ] | [ ] | [ ] | Renamed to `.scard` |
| Prismatic Spray | `Prismatic Spray.scard` | 2.1.1 | HB | [ ] | [ ] | [ ] | [ ] | |
| Raulothim's Psychic Lance | `Raulothim's Psychic Lance` | 1.0.1 | HB | [ ] | [ ] | [ ] | [ ] | |
| Ray of Frost | `Ray of Frost.scard` | 1.1.6 | HB | [ ] | [ ] | [ ] | [ ] | Renamed to `.scard` |
| Ray of Sickness | `Ray of Sickness.scard` | 1.1.2 | HB | [ ] | [ ] | [ ] | [ ] | |
| Sacred Flame | `Sacred Flame` | 1.0.1 | HB | [ ] | [ ] | [ ] | [ ] | |
| Scorching Ray | `Scorching Ray` | 1.0.2 | HB | [ ] | [ ] | [ ] | [ ] | Multi-ray attack |
| Shocking Grasp | `Shocking Grasp.scard` | 1.1.7 | HB | [ ] | [ ] | [ ] | [ ] | Renamed to `.scard` |
| Spiritual Weapon | `Spiritual Weapon.scard` | 2.1.1 | HB | [ ] | [ ] | [ ] | [ ] | |
| Sunbeam | `Sunbeam.scard` | 1.0.3 | HB | [ ] | [ ] | [ ] | [ ] | |
| Time Ravage | `Time Ravage` | 1.0.1 | HB | [ ] | [ ] | [ ] | [ ] | |
| Toll the Dead | `Toll the Dead` | 1.0.1 | HB | [ ] | [ ] | [ ] | [ ] | |
| Vampiric Touch | `Vampiric Touch` | 2.0.2 | HB | [ ] | [ ] | [ ] | [ ] | |
| Vicious Mockery | `Vicious Mockery` | 1.0.1 | HB | [ ] | [ ] | [ ] | [ ] | |
| Witch Bolt | `Witch Bolt.scard` | 1.1.3 | HB | [ ] | [ ] | [ ] | [ ] | |

**Counts:** 38 spells · **HB+ tested in session:** Chaos Bolt, Chill Touch, Detect Magic, Dissonant Whispers, Eldritch Blast, Feeblemind · **HB tested:** Finger of Death, Fire Bolt, Frostbite, Guiding Bolt, Hellish Rebuke · **HP tested:** Hold Person

---

## Related non-spell updates (same push)

| Item | File | Ver | Syntax | Posted | Tested | Pass | Notes |
|------|------|-----|:------:|:------:|:------:|:----:|-------|
| Evard's Black Tentacles AuraTrigger | `In Progress/Evard's Black Tentacles AuraTrigger.scard` | — | [ ] | [ ] | [ ] | [ ] | In Progress |
| Lightning Javelin | `Magic Items/Lightning Javelin.scard` | — | [ ] | [ ] | [ ] | [ ] | |
| Flurry of Blows | `PC Abilities/Flurry of Blows.scard` | — | [ ] | [ ] | [ ] | [ ] | Renamed to `.scard` |
| Psychic Blades | `PC Abilities/Psychic Blades.scard` | — | [ ] | [ ] | [ ] | [ ] | |
| Thunder Guantlets | `PC Abilities/Thunder Guantlets` | — | [ ] | [ ] | [ ] | [ ] | |
| Wild Magic Radiant Bolt | `PC Abilities/Wild Magic Radiant Bolt` | — | [ ] | [ ] | [ ] | [ ] | |
| Farsidelib | `Library/Farsidelib.scard` | 1.4.0 | [ ] | [ ] | [ ] | [ ] | `far_EndHexbladeCurse`, HexHeal |
| Hexblade's Curse | `PC Abilities/Hexblade's Curse.scard` | — | [ ] | [ ] | [ ] | [ ] | |
| Hexblade's Curse Trigger | `Triggers/Hexblade's Curse.scard` | — | [ ] | [ ] | [ ] | [ ] | |

---

## Git reference (Aug 14 bulk commit)

Bulk HexBlade batch: commit `63c1b28` — *v1.0.1 - Minor - code tweaked for HexBlade's Curse*

Individual commits before bulk: Acid Splash `d1fc613`, Armor of Agathys `fd5ecc9`, Blade Barrier Token `a5e48b8`, Blight `1b85bf5`, Chain Lightning `034d25a`, Chaos Bolt `8e95450`, Chill Touch `c7ea18a`, Chromatic Orb `70342ad`, Create Bonfire `d2ab281`, Detect Magic `6eec065`, Disintegrate `342540e`

Hold Person `a13f665` (Aug 13): *v2.3.0*

---

## Completion summary

| Status | Count |
|--------|------:|
| Syntax OK | 17 / 38 |
| Posted to Roll20 | 17 / 38 |
| Game tested | 17 / 38 |
| Pass | 17 / 38 |

*Update counts as you check boxes.*
