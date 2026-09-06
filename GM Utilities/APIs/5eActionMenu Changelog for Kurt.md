# 5E Action Menu — Changelog for Kurt

Modified fork of Kurt Jaegers' **5E Action Menu**, maintained by Farsidegallery.

| File | Notes |
|------|--------|
| `5eActionMenuModified.scard` | **v3.0.0** — publication release (single distribution file) |

**Baseline for comparison:** your published script on GitHub — [5e_Character_Action_Menu.scard](https://raw.githubusercontent.com/kjaegers/ScriptCards/refs/heads/main/ScriptCards_Examples/dnd5e/5e_Character_Action_Menu.scard) (**v2.7.9**).

---

## Executive summary — v3.0.0 vs your published v2.7.9

This fork (**v3.0.0**, `5eActionMenuModified.scard`) is what we run in a live 5e campaign. It keeps your core Action Menu design and adds fixes and features developed since **v2.7.9**. The detailed version history follows below.

### Restored functionality

- **Shared Macro Mule / Custom Actions** — Your published script notes this is *“currently broken due to API issues”* and skips the block entirely (`--^DONE_SHARED_MULE_BUTTONS|`). **v3.0.0 restores it.** Each PC lists allowed mule macros in either an **`AMLIST` ability** (semicolon-separated names in the action field) **or** a **`5ECAM_AMLIST` text attribute** (attribute wins if both are set). Buttons call the shared mule character (default `General_Macro_Mule`) via sheet buttons. Per-character **`AM-*` abilities** still work as before.

### Bug fixes (high impact)

- **PC attacks after cache clear** — Cached attack buttons store `Name###RowSectionId`. Your **v2.7.9** `EXEC_PC_ATTACK` still uses `Rfind` by name only, which breaks after **Clear cache**. **v3.0.0** parses the row id and uses `Rbysectionid` (same pattern already applied to NPC actions in the fork).
- **NPC Bonus Actions, Reactions, and Legendary Actions** — Fixed “Action Not Found” / empty action name, row-id reentry, stale cache on those sections, non-attack actions incorrectly prompting for a target (Detect, Parry, etc.), and ScriptCards pipe parsing on `@{target|token_id}` button suffixes.
- **PC Bonus Actions and Reactions** — Trait buttons rewritten: hashtable scan, separate Bonus vs Reaction lists (reactions exclude “bonus action” text), row-id reentry via `Rbysectionid` (fixes wrong trait text and special characters in names). Optional **`PCAbility_Mule`** routing: if a matching mule ability exists, the button fires the macro; otherwise falls back to trait description or `OPP_ATTACK`. Two-Weapon Fighting appears only when on the sheet; Opportunity Attack can also route through the mule.
- **Resistance / Immunity / Vulnerability** — Your **v2.7.9** skips damage-mod checks unless the **target** is an NPC (`[*T:npc] -ne 1` guard on PC attacks, cantrips, and spells). **v3.0.0** applies them whenever **`UseResistances|1`** for any target (PC or NPC), using the same `CheckDamageModifiersNPC` logic everywhere.
- **PC attack emote** — Set from `[*R:atkname]` after the row loads, not from the button payload (fixes wrong or generic emote text).
- **`Get_Ability_Modifier`** — Early return when the attribute string is blank (blank `dmgattr` no longer clears the modifier).

### Enhancements

- **Temporary HP before regular HP** — Your **v2.7.9** damage routines only adjust the main HP bar. **v3.0.0** adds **`tempHPBar`** (default bar 4) and depletes temp HP first on automatic damage paths when using **Token-Mod** (default). The Token-Mod logic follows **`far_DamageTokenmod`** in `Library/Farsidelib.scard` (**v1.5.1**, Aug 2026 — authoritative; reads token bars only, batched `@token-mod` calls). Action Menu `ApplyDamageTokenmod` is kept in sync with that library routine so attacks and AuraTrigger auras hit the same bars the same way.
- **Global Skill Modifier (GSKM) on skill checks** — Your **v2.7.9** shows GSKM toggle buttons but **`SKILL_CHECK` never adds active modifiers to the roll** (no `Find_Active_Global_Skill_Modifiers`). **v3.0.0** appends active GSKM values to skill checks; NPC skill checks skip GSKM (and global save mods) so Guidance does not bleed onto NPC sheets.

### New optional feature

- **Critical-fail Roll20 tables on natural 1** — Configurable via `UseFailTables`, `FailTableMelee`, `FailTableRanged`, and `FailTableSpell`. Includes NPC fail handling and PC weapon/cantrip/spell attack fail paths. Set **`UseFailTables|0`** (or leave table names blank) to keep message-only critical fails with no table roll.

### Settings defaults changed (review before paste)

| Setting | Your v2.7.9 | v3.0.0 |
|--------|-------------|--------|
| `skipPreppedSpellsCheck` | `0` | `1` |
| `sendGmInfo` | `0` | `1` |
| `damageApplyScript` | `damagebuttons` | `token-mod` |
| `sharedmacromulename` | `Macro_Mule` | `General_Macro_Mule` |
| `ConcentrationMarkerName` | (empty) | `Concentrating::7409928` |
| `tempHPBar` | *(not present)* | `4` |
| `UseFailTables` / fail table names | *(not present)* | enabled with sample table names |

All remain editable in the settings block at the top of the script.

### After upgrading

1. Paste **`5eActionMenuModified.scard`** into the Roll20 macro (external editor recommended; same as your header note).
2. Run **Clear cache** once per character (Action Menu button or `CLEAR_CHARACTER_CACHE`) so NPC Bonus/Reactions/Legendary lists and PC attack buttons rebuild with the new format.
3. For Custom Actions: create a **`General_Macro_Mule`** (or rename in settings) and give each PC an **`AMLIST` ability** listing mule ability names, e.g. `Gather Information; AFK; Shopping`.

### Note on upstream

Your **v2.7.9** `EXEC_NPC_LEGENDARY_ACTION` has a typo `--#righsub|` (missing **t**). The fork’s rewritten NPC handlers use `#rightsub` consistently. Several fixes above (row-id parsing, cache skip for NPC sections, fail tables) are candidates for selective merge into upstream if you want them.

---

## v3.0.0 — Publication release

**Distribution:** One file — `5eActionMenuModified.scard` (includes optional critical-fail tables; disable with `UseFailTables|0`).

See **Executive summary** above for the full comparison to your published **v2.7.9**. This section is the install pointer; detailed fix history is in the entries below.

**Install:** Paste the `.scard` into the Roll20 macro (external editor recommended). After upgrade, run **Clear cache** once per character (or `CLEAR_CHARACTER_CACHE`).

**Custom Actions setup:** Shared mule character + per-PC `AMLIST` ability (or `5ECAM_AMLIST` attribute). See settings comments lines 57–59 in the script.

**Maintainer note (AMLIST):** ScriptCards cannot expand raw semicolon text on script lines. List parsing sanitizes internally; button build runs in a silent gosub. `AmListDebug|0` by default.

---

## v2.10.23 — Custom Actions confirmed (Modified only)

**Confirmed:** AMLIST → `General_Macro_Mule` Custom Actions buttons work (`parse=3`, three mule macros fire correctly).

**Cleanup:** `AmListDebug` default `0`. Fix `dacaBtnCount` numeric increment (was string concat `0111` in debug).

---

## v2.10.22 — Silent build gosub (Modified only)

**Problem:** v2.10.21 still stopped after `parse names=3` — no loop debug, no buttons. Execution died immediately after the second `--+` debug line inside the build gosub.

**Fix:** No `--+` or `--#whisper` inside `DACA_BUILD_MULE_BUTTONS` (card output there aborts the gosub). Build buttons silently; store `dacaParseCount`, `dacaBtnCount`, `dacaBuildHint`. Single debug line after gosub returns. Mule lookup uses character name (spell-mule pattern), not ID.

---

## v2.10.21 — Build buttons inside parse gosub (Modified only)

**Problem:** v2.10.20 restored `parse names=3` but still no loop debug, header, or buttons — same as v2.10.17. Parse ran inside gosub; loop ran after return where `MuleNameList` did not persist.

**Fix:** Single gosub `DACA_BUILD_MULE_BUTTONS` — read, parse, findability, and button build all before `--<|`. Caller only sets up AMLIST source then gosubs once.

---

## v2.10.20 — Unconditional gosub (Modified only)

**Problem:** v2.10.19 only showed first AMLIST debug line. `--&amListSafe|` pre-defined the variable as empty, so `X[&amListSafe]" -eq "X"` was false — gosub skipped, `fromstring` on empty string silently aborted.

**Fix:** Do not pre-init `amListSafe`. Unconditional `-->DACA_PARSE_MULE_LIST|` (v2.10.17 pattern). Gosub skips `*O` read when attribute already populated `amListSafe`. Safe empty checks after gosub before rebuild loop.

---

## v2.10.19 — Gosub parse restored, semicolon-safe empty checks (Modified only)

**Problem:** v2.10.18 regressed to only the first AMLIST debug line (no `parse names=`). Inline `*O` read then `[&amListSource]" -eq ""` expanded semicolons into the script line and silently aborted.

**Fix:** Restore v2.10.17 `DACA_PARSE_MULE_LIST` gosub for `*O` read. Sanitize to `&&&` and clear `amListSource` before any empty test. Rebuild `MuleNameList` from `amListSafe` in caller scope (indexed loop). Use `X[&var]" -eq "X"` for empty checks on raw text. Attribute path also sanitizes immediately.

---

## v2.10.18 — Inline parse, indexed loop (Modified only)

**Problem:** v2.10.17 parsed correctly (`names=3 first=Gather Information`) but no loop debug, no Custom Actions header, no errors — execution died after gosub return before the mule foreach ran.

**Fix:** Removed `DACA_PARSE_MULE_LIST` gosub; parse inline in `DACA_SHARED_MULE`. Indexed `0..maxindex` loop instead of `foreach`. Resolve mule via `GET_CHARACTER_ID_BY_NAME` for `findability` and sheet buttons. Safe debug uses `btnCount=` not raw button markup. Jump to shared mule after AM-* loop (avoid fall-through into old parse label).

---

## v2.10.17 — *O read path restored (Modified only)

**Problem:** v2.10.16 `Pread` + `array;define` gave `names=1 first=` (empty). v2.10.16 removed the `*O` read that had worked in earlier debug.

**Fix:** Parse via `[*O:…:action]` bracket assignment → `&&&` sanitize → `array;fromstring`. No debug lines expand raw semicolon text. No `Pread` for list text.

---

## v2.10.16 — Pread pointer parse (Modified only)

**Problem:** v2.10.15 had no log errors but still stopped after `splitting list` — expanding `[&amListSource]` into `string;split` silently aborted.

**Fix:** Parse via **`Pread` + `array;define;MuleNameList;[&AmListPtr]`** (Kurt copier pattern) — semicolon list never enters a string variable on a script line. Fallback `fromstring` with `&&&` only when needed. Debug: `parse names=` / `first=`.

---

## v2.10.15 — Fix !a label error (Modified only)

**Problem:** Log error `Label 5ECAM_AMLIST: is not defined` — line used conditional goto `|!a:[%1%]|5ECAM_AMLIST:` which SC parsed as a label. `!a` save with semicolon list also broke the script line.

**Fix:** Create empty attribute in `[` `]` block. Removed mid-flow `!a` save. Inline sanitize (§§§) immediately after ability read. Kept `string;split` loop.

---

## v2.10.14 — string;split for AMLIST (Modified only)

**Problem:** v2.10.13 still stopped after `splitting list`. `array;fromstring` with expanded `[&amListSource]` aborts ScriptCards even with `#~#` delimiter.

**Fix:** Use `string;split;§§§;[&amListSource]` + indexed loop (`AmListParts1`…). Internal delimiter `§§§` avoids SC syntax chars (`;`, `|`, `!$!`). Debug: `split count=` and `first=`.

---

## v2.10.13 — #~# delimiter instead of !$! (Modified only)

**Problem:** v2.10.12 stopped after `splitting on !$!` — no `after fromstring`. Literal `!$!` in debug and in expanded `fromstring` lines is a ScriptCards special token that aborts parsing.

**Fix:** Internal list delimiter changed from `!$!` to `#~#`. Debug says `splitting list` only.

---

## v2.10.12 — Fix debug lines breaking parse (Modified only)

**Problem:** v2.10.11 showed `source=Gather Information; AFK; Shopping` then stopped — no `after fromstring`. Debug line used `(replaceall,!$!,;)` which put a literal semicolon in the script line, breaking execution after the debug output.

**Fix:** Display source with `|` not `;`. Added `splitting on !$!` debug before fromstring. Trim mule names in loop.

---

## v2.10.11 — Semicolon-safe AMLIST (Modified only)

**Problem:** Debug showed `source=Gather Information; AFK; Shopping` then `pre-parse source=` empty. Ability read worked but semicolons in the string broke ScriptCards when expanded into debug/script lines (parsed as command separators).

**Fix:** `DACA_AMLIST_SANITIZE` converts `;` → `!$!` immediately after any read, before debug or parse. Debug lines use safe `(replaceall,;,|)` display. Removed scratch Pset block (never worked, could overwrite). Auto-saves sanitized list to `5ECAM_AMLIST` after ability read.

---

## v2.10.10 — 5ECAM_AMLIST attribute (Modified only)

**Proved by debug:** AMLIST ability obj found, text visible in Roll20 UI (`Gather Information; AFK; Shopping`), but `oDesc=`, `oAct=`, `scratch=` all empty. ScriptCards cannot read plain text from ability macro fields.

**Fix:** Read semicolon list from **`5ECAM_AMLIST` text attribute** (Attributes tab). Auto-creates empty attribute on first run. Ability `*O`/Pset fallbacks kept but only when attribute empty. Fixed bug where empty ability read could overwrite attribute value.

**Setup:** Abrindere → Attributes → Add `5ECAM_AMLIST` (text) → `Gather-Information; AFK; Shopping`

---

## v2.10.9 — Pset scratch extract on v2.10.8 baseline (Modified only)

**Debug proved:** `abilObjs=1 obj=-P0nxb…` but `oDesc=` and `oAct=` empty — AMLIST ability exists but ScriptCards `*O` cannot read its text. Script exited before `fromstring` (no `after fromstring` line).

**Fix (minimal, on v2.10.8 flow):** When obj found but source still empty, `Pread` AMLIST action/description → `Pset` to scratch ability `5ECAM_AMLIST_SCRATCH` → read `*O` description. Split list with `!$!` + `array;fromstring` (not empty delimiter). Debug: `scratch=`, `pre-parse source=`.

---

## v2.10.8 — Custom Actions baseline + AMLIST debug (Modified only)

**Change:** Reverted AMLIST / shared mule logic from v2.10.9–v2.10.16 back to **v2.10.8** inline flow (ability prefix lookup, `*O` description/action read, `array;fromstring` with empty delimiter). Added `AmListDebug` whispers at each step.

**Debug lines:** `abilObjs`, `oDesc`/`oAct`, `char/attr/source/obj`, `after fromstring`, per-name findability, final `buttons`.

**Test:** Republish → fresh Action Menu on PC with `AmListDebug|1`. Compare debug to Custom Actions buttons shown.

---

## v2.10.16 — AMLIST read fixes + 5ECAM_AMLIST + AM-MULE-* (Modified only)

**Problem:** v2.10.15 debug showed `names=undefined` — extract never ran (conditional `|>SUB|` gosub), and empty `array;define` left `MuleNameList` invalid.

**Cause:** ScriptCards `Pread` pointers cannot be copied into strings for semicolon splitting. Direct `*O` action reads also fail for macro-body text. OGL may also expose an empty checkbox attribute named `AMLIST` separate from the ability body.

**Fix:**
- Extract gosub called from a `[` `]` block (`-->DACA_EXTRACT...`); array initialized with `_init_` placeholder.
- Extract tries `*O` description/action, then **Pset AMLIST action → scratch ability `5ECAM_AMLIST_SCRATCH`** and reads description from scratch (Kurt copier pattern).
- Step debug: `oDesc`, `oAct`, `scratchAct`, `scratchDesc`, `extract`.
- **New text attribute `5ECAM_AMLIST`** on PC (Attributes & Abilities → Add attribute, type text) — paste semicolon list here; avoids checkbox conflict.
- **New `AM-MULE-*` abilities** on PC (e.g. `AM-MULE-Gather-Information`) — one per allowed mule macro; no list parsing needed.

**Quick test on Abrindere:** Add attribute `5ECAM_AMLIST` = `Gather-Information; AFK; Shopping` → republish → fresh Action Menu.

---

## v2.10.15 — AMLIST Pset extract + fromstring split (Modified only)

**Problem:** Debug showed `obj=-P0nxbllOOhpZiVS0E_s` but `source=` empty and `after parse names=1 first=` — AMLIST ability found but text unreadable.

**Cause:** ScriptCards cannot copy ability action/macro text into string variables (`[*O:…:action]` and `Pread` + `array;define` both fail). `array;define;MuleNameList;[&AmListPtr]` kept one empty element instead of splitting on semicolons.

**Fix:**
- New `DACA_EXTRACT_AMLIST_TEXT` — tries `*O` reads, then bidirectional `Pread`/`Pset` (description↔action) to surface text, then reads via `*O`.
- `DACA_PARSE_AMLIST_NAMES` always splits `amListSource` with `!$!` + `array;fromstring` (not pointer define).
- Skip Custom Actions when parsed list is empty or single blank entry.
- Debug line `extract=[&amListSource]` shows which read path succeeded.

**Test:** Republish script → fresh Action Menu on PC → expect `extract=Gather Information; AFK; Shopping` (or similar) and Custom Actions buttons for each mule ability.

---

## v2.10.9 — Custom Actions / AMLIST fixes (Modified only)

**Problems:** `^DACA_MULE_NEXT` label errors; spurious `false` button; `No ability was found for %{Character|}`.

**Causes:** ScriptCards conditionals must use `|LABEL` not `|^LABEL|`. Reading `[*char:AMLIST]` sheet attribute returned checkbox value `false` instead of the AMLIST ability description.

**Fix:** Correct conditional goto syntax; read list from AMLIST **ability description** first; reject `false`/`0`/`1` attribute values; build mule buttons directly.

---

## v2.10.7 — Shared Macro Mule restored (Modified only)

**Problem:** Custom Actions shared macro mule (`Macro_Mule` + per-PC `AMLIST`) was disabled with a hard skip; old code used invalid API calls and never built buttons from the list.

**Fix:**
- Removed skip; reads semicolon-separated ability names from PC `AMLIST` (or legacy `AM_SHARED_LIST` attribute/ability).
- Each name is verified on `Macro_Mule` via `system;findability` (same as spell/PC/NPC mules).
- Matching entries become `[button]…::~Macro_Mule|ability[/button]` in Custom Actions alongside existing `AM-*` character abilities.
- Set `sharedmacromulename` to `none` to disable.

**Roll20 setup:** `Macro_Mule` character with shared macros; each PC needs an `AMLIST` ability whose description lists names, e.g. `Short-Rest;Long-Rest;DealDamage`.

---

## v2.10.6 — NPC button reentry fix (Modified only)

**Problem:** Legendary / Reaction / Bonus buttons showed `Action Not Found` with an empty action name (`""`).

**Cause:** NPC `EXEC_*` handlers declared a label parameter `|action_name`, which conflicts with ScriptCards rbutton reentry (`reentryval` was empty after parsing). Row IDs in `Name###RowId` payloads also failed when `###` split left `action_rowid` empty for row-only values.

**Fix:**
- Removed `|action_name` label parameters from all NPC `EXEC_*` handlers (matches working PC handlers like `EXEC_PC_TRAIT`).
- Added `PARSE_NPC_REENTRY` — row ID only by default; still accepts legacy `Name###RowId` for repeat-attack buttons.
- Buttons now pass `[RowSectionId]|NONE` or `[RowSectionId]|@{target|token_id}` instead of `Name###RowId`.

**Test:** Fresh Action Menu → Blue Dragon Legendary → Detect (description, no target prompt). Gladiator → Parry. Bite still prompts for target.

---

## v2.10.5 — ScriptCards pipe parsing fix (Modified only)

**Problem:** Opening Action Menu threw repeated errors: `Label token_id} is not defined` on the attack-flag target suffix lines.

**Cause:** ScriptCards treats `|` as a label separator inside conditional assignments (`|&var;value`). The value `@{target|token_id}` was split at the inner pipe.

**Fix:** Use goto labels (`AM_LIST_ATTACK_TARGET`) and a direct `--&actionTargetSuffix|[&TB]target|token_id}` assignment (same pattern as spell buttons).

---

## v2.10.4 — NPC non-attack buttons — no target prompt (Modified only)

**Problem:** Legendary Actions (Detect, etc.) and non-attack Reactions (Parry) still prompted for a target token before showing the description.

**Cause:** `BUILD_BUTTON_LIST` always appended `|@{target|token_id}` to every NPC button. Roll20 requires target selection for that suffix even when the action is not an attack.

**Fix:**
- When building buttons, read `[DisplayName]_attack_flag` from the row hash. If not `on`, use `|NONE` instead of a target prompt (same pattern as non-attack spells).
- `EXEC_NPC_BONUS_ACTION`, `EXEC_NPC_REACTION`, and `EXEC_NPC_LEGENDARY_ACTION` skip `#targettoken` when reentry is `NONE` or empty, and use emote text without “against [target]”.

**Test:** Fresh Action Menu on Blue Dragon → Legendary → Detect (no target prompt, description only). Gladiator → Parry (same). Wing Attack (if attack flag on) still prompts for target.

---

## v2.10.3 — Summary (Modified only)

| Fix | Kurt copy | Farside copy |
|-----|-----------|--------------|
| NPC Bonus / Reaction / Legendary — row load & description display | Pending | Yes |
| NPC button lists — skip cache (Actions, BA, Reactions, Legendary) | Pending | Yes |
| `CLEAR_CHARACTER_CACHE` — Bonus Actions & Reactions | Pending | Yes |
| Skip building buttons when row section id is empty | Pending | Yes |

---

## NPC Bonus Actions, Reactions, Legendary Actions — “Action Not Found”

**Problem:** Clicking NPC Legendary Actions (e.g. Detect) or Reactions (e.g. Parry) showed `NoRepeatingAttributeLoaded` and `Action Not Found — The action "" could not be loaded…`.

**Cause (two issues):**
1. **Stale cached button lists** for Legendary / Reactions / Bonus Actions. Only “Actions” skipped cache rebuild; other NPC sections could serve old buttons after mule or `###RowSectionId` changes.
2. **`EXEC_NPC_BONUS_ACTION`, `EXEC_NPC_REACTION`, `EXEC_NPC_LEGENDARY_ACTION`** jumped to `NPCA_NOT_ATTACK` inside `EXEC_NPC_ACTION` when the row failed to load, then fell through to the “Action Not Found” block with an empty action name.

**Fix (Modified):**
- Rebuilt handlers: load row first; show “Action Not Found” and exit if load fails; otherwise show `[*R:description]` or call `>NPCA_MAKE_AN_ATTACK` for attack-flag rows.
- `Rfind` fallback uses `$$$` delimiter (same as main NPC Actions).
- `BUILD_BUTTON_LIST` always rebuilds NPC Actions, Bonus Actions, Reactions, and Legendary Actions (no cache).
- `CLEAR_CHARACTER_CACHE` clears `5ECAM_CACHE_Bonus Actions` and `5ECAM_CACHE_Reactions`.
- Skip button creation when `RowSectionId` is empty.

**Test:** Blue Dragon → Legendary → Detect → description card. Gladiator → Reactions → Parry → description card. Clear cache once after updating.

---

## v2.10.2 — Mule linking scope (Modified only)

**Change:** Ability mule lookup applies **only** to Bonus Actions and Reactions — not Attacks/Actions or Legendary Actions.

| Section | Mule |
|---------|------|
| PC Attacks and Actions | Sheet only (`none`) |
| PC Bonus Actions / Reactions (traits) | `PCAbility_Mule` |
| NPC Actions | Sheet only |
| NPC Legendary Actions | Sheet only |
| NPC Bonus Actions / Reactions | `NPCAbility_Mule` |

Spells unchanged (`Spell_Mule`).

---

## v2.10.1 — PC trait mule buttons (Modified only)

**Change:** PC Bonus Action and Reaction trait buttons check `PCAbility_Mule` via `system;findability` (same pattern as spells). If a matching ability exists (spaces → hyphens in name), the button runs the mule macro; otherwise falls back to `EXEC_PC_TRAIT` or `OPP_ATTACK`.

Opportunity Attack also checks the mule for `Opportunity-Attack`.

---

## v2.10.0 — NPC skill checks — Guidance bleed (Modified only)

**Problem:** Some NPC skill checks incorrectly included Guidance (or other global skill mods) even though NPC sheets have no global skill mod repeating section.

**Cause:** `SKILL_CHECK` always called `Find_Active_Global_Skill_Modifiers`; missing `repeating_skillmod` could leave stale R-row data.

**Fix:** Skip global skill and save modifiers when `[*S:npc] -eq 1`. Early exit in Find functions when `NoRepeatingAttributeLoaded`.

---

## v2.9.2 – v2.9.9 — PC Bonus Actions & Reactions (Modified only)

**Problem:** Bonus Action / Reaction trait buttons duplicated sections, showed wrong content (e.g. Bardic Inspiration → Opportunity Attack), malformed `[rbutton]` labels, missing Two-Weapon Fighting, or “Attack Not Found” with empty name.

**Fixes (iterative):**
- Trait loop rewritten: hashtable + row-id payloads (`EXEC_PC_TRAIT` via `Rbysectionid`).
- ScriptCards conditional gotos corrected (`\|LABEL` not `\|^LABEL` in `?` branches).
- Each trait button output on its own line during debugging; restored inline `BA_BUTTON_LIST` / `RA_BUTTON_LIST` layout in v2.9.8.
- Removed hardcoded Two-Weapon Fighting for all PCs (v2.9.9); still listed when trait name or “bonus action” description matches sheet.
- Fixed “Opportunity Attack” title typo.
- Removed broken label sanitization that caused `Substring reference error.,( )]`.

**Test:** Danton (Bard) — one Bonus Actions block, Bardic Inspiration shows trait description, Two-Weapon Fighting absent unless on sheet.

---

## v2.9.1 — Summary

| Fix | Kurt copy | Farside copy |
|-----|-----------|--------------|
| PC attack emote — weapon name from loaded row | Yes | Yes |
| `Get_Ability_Modifier` — preserve values when attribute blank | Yes | Yes |
| PC weapon nat 1 — fail table selection (`attack_type` / `atkrange`) | **No** (no fail tables) | Yes |

---

## PC attack emote — weapon name

**Problem:** After cache rebuild (`ActionName###RowSectionId` buttons), PC attack emotes showed `uses  against Target` with no weapon name.

**Cause:** Emote text was set from parsed button payload before the attack row was loaded.

**Fix (both files):** After `Rbysectionid` / `Rfind`, set `#emotetext` from `[*R:atkname]` via `emoteActionName` (parentheses → brackets, same as NPC actions).

**Test:** Clear cache → PC attack → emote reads e.g. `Bob uses Dagger against Goblin`.

---

## `Get_Ability_Modifier` — blank attribute string

**Problem:** When a repeating attack row leaves `dmgattr` (or `dmg2attr`) blank — common when damage uses the same ability as the attack — the subroutine cleared the modifier name and numeric value before checking, breaking downstream logic.

**Fix (both files):** Return immediately when the attribute string is empty, preserving caller values.

**Test:** Weapon with blank `dmgattr` still applies the attack ability mod to damage rolls.

---

## PC critical fail — fail table not rolling (Farside only)

**Applies to:** `5eActionMenuModified.scard` only.

**Problem:** Natural 1 showed `Critical Fail! You rolled a 1…` but did not roll the configured Roll20 fail table.

**Cause:** PC `ATTACK_FAIL` picked melee vs ranged tables using `dmgAttrName` (STR/DEX). Blank `dmgattr` left that empty after `Get_Ability_Modifier`, so the script fell through to message-only `ATTACK_FAIL_SIMPLE`.

**Fix:** PC fail-table selection now matches NPC logic: `attack_type` when present, then `atkrange` containing `/` → ranged, otherwise melee default.

**Test:** Dagger nat 1 → `Damage-Melee-Fail` table entry. Longbow nat 1 → `Damage-Range-Fail`.

---

## v2.9.0 — Summary

| Fix | Kurt copy | Farside copy |
|-----|-----------|--------------|
| Cache rebuild / `###RowSectionId` attack lookup | Yes | Yes |
| `EXEC_PC_ATTACK` — `Rbysectionid`, Attack Not Found | Yes | Yes |
| `EXEC_NPC_BONUS_ACTION` / `REACTION` / `LEGENDARY_ACTION` — same parsing | Yes | Yes |
| PC weapon nat 1 — `[$attackRoll.Base]` in fail message | Yes | Yes |
| Critical-fail Roll20 tables on nat 1 | **No** | Yes |
| Temporary force-nat-1 test hook | **No** | **No** (removed after QA) |

---

## Cache rebuild / PC attack fix

**Problem:** After clearing the Action Menu cache (`CLEAR_CHARACTER_CACHE`), PC attacks failed with:

> `[Character name] has no NoRepeatingAttributeLoaded left.`

**Cause:** Button cache rebuild stores attack buttons as `ActionName###RowSectionId` (repeating-row disambiguation). `EXEC_NPC_ACTION` was updated to parse that format, but **`EXEC_PC_ATTACK` was not**. After rebuild, `Rfind` looked up a bogus name like `Longsword###-abc123`, failed, and the ammo/resource path treated `NoRepeatingAttributeLoaded` as a resource name.

Stale cache without `###` masked the bug until cache clear.

**Fix (both files):**
- `EXEC_PC_ATTACK` — parse `###` row id; use `Rbysectionid` when present; fall back to `Rfind` by name for legacy buttons; show “Attack Not Found” on failure; preserve row id on repeat button.
- `EXEC_NPC_BONUS_ACTION`, `EXEC_NPC_REACTION`, `EXEC_NPC_LEGENDARY_ACTION` — same parsing (same cached button format).

**Note:** v2.10.3 further fixes the NPC bonus/reaction/legendary *handlers* and cache behavior (see above).

**Test:** Clear cache → open Action Menu → PC attack. Should resolve without the bogus resource message.

---

## PC critical fail — wrong roll variable

**Problem:** PC weapon nat 1 showed:

> Critical Fail! You rolled a on your attack roll.

**Cause:** `ATTACK_FAIL` used `[$ToHit.Base]` (NPC attack variable) instead of `[$attackRoll.Base]`.

**Fix (both files):** `ATTACK_FAIL` now uses `[$attackRoll.Base]`.

**Test:** PC attacks NPC, roll natural 1 on d20 → message reads `You rolled a 1 on your attack roll.`

---

## Kurt package — critical-fail table removal (retired)

**Historical — removed in v3.0.0.** Previously `5eActionMenuForKurt.scard` omitted Roll20 fail-table lookups on natural 1. That separate file is deleted; the publication release includes fail tables (optional via `UseFailTables|0`).

**Originally applied to:** `5eActionMenuForKurt.scard` only.

**Removed:** Roll20 table lookups on natural 1 for:
- NPC attacks (`NPCA_FAIL`) — Farside used `Damage-Melee-Fail` / `Damage-Range-Fail`
- PC weapon attacks (`ATTACK_FAIL`)
- PC cantrip attacks (`CANTRIP_ATTACK_FAIL`)
- PC spell attacks (`SPELL_ATTACK_FAIL`)

**Replacement:** Single chat line only, e.g.:

> Critical Fail! You rolled a 1 on your attack roll.

No table roll, no optional fumble-damage prompt.

**Reason:** Fail tables live in the Farside Roll20 game ecosystem and are not required for upstream Action Menu behavior.

**Retained in `5eActionMenuModified.scard`:** Full fail-table logic for local / ecosystem games.

---

## Install notes

- Paste `5eActionMenuModified.scard` into the Roll20 macro (external editor recommended; see script header).
- After updating to v2.10.x or v3.0.0, use **Clear cache** on the Action Menu once per character (or `CLEAR_CHARACTER_CACHE`) so NPC Bonus/Reactions/Legendary lists rebuild.
- Fail tables are **optional**: set `UseFailTables|0` in the script settings, or leave table name settings blank, if you do not use Roll20 fumble tables.

## Suggested merge to upstream (optional)

Portable changes for Kurt Jaegers' base Action Menu:

**From v2.9.1 (already in Kurt copy):**
1. `###RowSectionId` parsing in `BUILD_BUTTON_LIST` handlers (PC attack + NPC bonus/reaction/legendary if those buttons use the same cache format).
2. `ATTACK_FAIL` — `[$attackRoll.Base]` instead of `[$ToHit.Base]`.
3. PC attack emote — set from `[*R:atkname]` after row load.
4. `Get_Ability_Modifier` — early return when attribute string is blank.

**From v2.9.2–v2.10.3 (Modified only — review before merge):**
5. PC Bonus/Reaction trait buttons — row-id reentry, inline layout, no universal Two-Weapon Fighting button.
6. NPC skill/save checks — skip global mods when `[*S:npc] -eq 1`.
7. Optional mule buttons for PC/NPC Bonus & Reactions only (`PCAbility_Mule` / `NPCAbility_Mule`).
8. NPC bonus/reaction/legendary handlers — load row before display; do not `^NPCA_NOT_ATTACK` on failed load; skip cache for all NPC action sections.
9. `CLEAR_CHARACTER_CACHE` — include Bonus Actions and Reactions cache keys.

Fail-table behavior is intentionally **not** included in the Kurt package.
