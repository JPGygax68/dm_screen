# DM Screen Specification

## Purpose

Create a web-based combat tracker for a Dungeon Master screen with an emphasis on flexibility, override capability, and printable output.

The app should be a static HTML/CSS/JS application with client-side persistence and explicit export/import. It should avoid hard dependencies on internal data by allowing the DM to override any auto-filled values.

## Core Principles

- **User control over data**: Any value the app auto-fills from internal rules, templates, or defaults must be editable by the GM.
- **No opaque internal dependency**: The app can provide suggestions and defaults, but those should always be visibly editable and replaceable.
- **Print-friendly UI**: The combat tracker should produce a printable sheet or view using CSS print styles, with annotation-friendly areas.
- **Client-side persistence**: Use browser storage (IndexedDB or localStorage) and explicit file export/import so the app can run without a server.
- **Offline-capable**: The app should work without network connectivity.
- **Future-friendly sync**: Design the data model and storage layer so later sync to other devices can be added without breaking the app.

## Target Platform

- Laptops (primary)
- Tablets (secondary)

Smartphones are not a target.

## Combat Tracker Specification

### Primary use case

A DM adds combatants, tracks initiative and status, and updates HP/conditions during a combat encounter. The tracker should support both player characters and NPC/monster entries.

### UI components

1. **Encounter header**
   - Encounter name
   - Encounter date/time or session tag
   - Optional quick notes section

2. **Combat tracker layout**
   - The digital combat tracker is organized by round: one row per round, with combatants represented by scrollable columns.
  - The leftmost column is frozen and contains the round number, turn phase, and any round-level controls.
  - A visually separate "current state" header row (above round rows) must be present in the digital UI and may optionally be printed. This header shows each combatant's current HP and the full list of active conditions; it is the authoritative (in digital), at-a-glance current-state summary for the encounter.
   - Each combatant gets a dedicated column containing compact current status: portrait, name/label, current HP, initiative, and a short condition summary.
   - The rightmost column is also frozen and reserved for round-specific notes and annotations.
   - Horizontal scrolling should reveal additional combatants while keeping the left and right frozen columns visible.
   - The digital layout should mirror the printed layout as closely as practical, with combatant columns aligned across the digital grid.
   - Distinguish player characters from monsters/NPCs visually in their column headers or portraits.
   - For the digital UI, initiative sorting remains optional. 

3. **Combatant details panel**
   - Optional expanded view for a selected combatant
   - Editable fields: name, type, HP, AC, initiative, conditions, description, tags
   - Auto-filled fields may be provided from an internal lookup, but every field stays editable.

4. **Printed combat tracker**
   - A single A4 landscape sheet should provide enough columns for 5 combatants.
   - Additional combatants may be accommodated by appending extra sheets to the right edge of the previous sheet.
   - The printed sheet should preserve the one-row-per-round structure and include a leftmost round label column and a rightmost notes column.
   - Use clear column headers and compact stat summaries to make the printout usable at a glance.
  - The printed layout MAY include the separate "current state" header row, but this is optional: the GM may choose to omit the header, include a pre-combat `turn 0` baseline row, or track current state on separate sheets/cards as preferred.

5. **Controls**
   - Add combatant
   - Duplicate combatant
   - Remove combatant
   - Reset encounter
   - Step through turn phases (end current turn, start next turn)
   - Apply damage / healing
   - Mark/clear conditions
   - Export encounter data
   - Print encounter sheet

6. **Turn progression**
   - Initiative sorting is optional in the digital UI and should not be assumed for paper.
   - Ending a turn and starting the next turn are separate, user-controlled steps.
   - The app should propose a checklist for each phase, initializing items with computed updates.
   - Each checklist item must be manually overridable by the GM.

7. **Annotations and overrides**
   - Inline editable notes for each combatant
   - Global encounter notes
   - Fields should allow manual override of auto-filled or suggested values

8. **Turn shorthand notation**
   - Every combat turn should be represented by a single row in the UI and on printable sheets.
   - Use a super-compact notation that is easy to parse without AI.
   - Limit the character set to US-ASCII plus optional non-US characters for readability.
   - Provide a small hideable free-text area for the GM to record encounter-wide notes that span multiple turns.

### Turn shorthand syntax

- Each turn row is structured as:
  `Actor: update1; update2; ... [| note]`
- Use `;` to separate compact update tokens.
- Use `|` to attach a free-text note when the update token set is insufficient.
- Support actor labels with simple names, e.g. `Goblin1`, `PC_A`, `DM`.

Supported update tokens:

- `+Nhp`, `-Nhp`: change current HP by `N`.
- `hp=N`: set current HP.
- `maxhp=N`: set maximum HP.
- `ac=N`, `ac+N`, `ac-N`: set or modify armor class.
- `init=N`: set initiative value.
- `move:N`: record movement in feet.
- `cond:NAME`: add condition `NAME`.
- `clr:NAME`: clear condition `NAME`.
- `cond:+NAME[N]`: add condition `NAME` with duration `N` rounds/turns.
- `cond:-NAME`: add condition `NAME` with duration `N` rounds/turns.
- `+NAME`, `-NAME`: add or remove condition `NAME` in a turn cell as a compact change token.
- `temp:NAME N`: add temporary effect `NAME` lasting `N` rounds/turns.
- `stat:STR=18`, `str=18`: set a stat value.
- `save:WIS+2`, `skill:PER+5`: set or adjust saves/skills.
- `res:TYPE`, `vul:TYPE`, `imm:TYPE`: add resistance, vulnerability, or immunity.
- `cast:SPELL`: note a spell casting action.
- `action:TEXT`: record an action or short description.
- `atk:TARGET+MOD[/dmg=N][/miss]`: record an attack against `TARGET` (combatant label), optional attack modifier `+MOD`, optional damage `/dmg=N`, or `/miss` to indicate a miss. Example: `atk:Goblin1+4/dmg=7` records an attack versus `Goblin1` with +4 attack bonus dealing 7 damage.
- `roll:TEXT`: record a notable roll or check.
- `note:TEXT`: record a short free-text note inline.
- `raw:TEXT`: record any update that cannot be expressed with tokens.
 
Notes on targets and labels:
- `TARGET` must match the combatant label used in the column headers. Use underscores or hyphens instead of spaces (e.g. `Big_Ogre`), or quote labels if needed when implementing a parser.
- When an attack affects another combatant, record the provenance in the attacker's cell using `atk:...` and record the resulting deltas (HP change, conditions) in the target's cell using `+NAME`/`-NAME` or `+Nhp`/`-Nhp` tokens.

Consumables and resource tokens:

- `use:slot:L` — consume one spell slot of level `L` (e.g. `use:slot:1`).
- `use:slot:L:N` — consume `N` slots at level `L` (e.g. `use:slot:2:2`).
- `set:slot:L=N` — set remaining slots of level `L` to `N` (e.g. `set:slot:3=1`).
- `use:item:NAME` — consume one unit of `NAME` (e.g. `use:item:healing_potion`).
- `use:item:NAME:N` — consume `N` units.
- `add:item:NAME:N` — add `N` units.
- `set:item:NAME=N` — set remaining quantity of `NAME` to `N`.
- `rest:short`, `rest:long` — apply short/long rest semantics (applicable to resource recovery).

Rules for consumables:

- When the app has explicit data fields for a combatant's consumables (for example `spellSlots[level]` or `items["healing_potion"]`), the app SHOULD prepare a checklist item with the appropriate `tokens` (e.g. `use:slot:1`) and present it for DM review. The DM must be able to edit or delete that proposed token before confirming.
- When the app DOES NOT have a corresponding data field, the app MUST require the DM to enter a consumable token explicitly (for example `use:item:arrows:20` or `set:slot:2=0`) and confirm that they have updated any external records as needed. The UI must prevent proceeding until the DM confirms this.
- The app NEVER assumes responsibility for enforcing rules (e.g. spellcasting legality) — it only proposes or records consumable changes and leaves final authority to the GM.

UI behavior:

- Proposed consumable changes appear in end/start phase checklists like other tokens.
- The checklist entry for a proposed consumable change should show current stored value (when available), the proposed token, and the new computed value; the DM can accept, modify, or reject it.
- If no stored value exists, the checklist entry must show a prominent "Specify and confirm" button that opens a small editor to enter the `tokens` (or choose from a short list) and then confirm.


Rules:

- Tokens are case-insensitive for names like `hp`, `ac`, `cond`, `clr`, `temp`, `stat`, `save`, `skill`, `res`, `vul`, `imm`, `cast`, `action`, `roll`, `note`, `raw`.
- Use simple separators and avoid punctuation that conflicts with parsing.
- If needed, use `note:` or `raw:` to capture exceptional or manual updates.

- Signed numeric tokens: when a numeric token value is preceded by `+` or `-`, treat it as a delta (increase/decrease) rather than an absolute assignment. Example: `+5hp` increases current HP by 5, `-7hp` reduces current HP by 7. Use `hp=N` to set an absolute HP value. For tokens that use `:` (for example `move:10`) the unsigned value retains the per-token meaning (here: distance moved this turn); prefer the signed delta form when recording changes to an existing stored value.

Example rows:

- `Goblin1: -7hp; cond:PRONE; move:10; note: fell from ledge`
- `PC_A: +5hp; temp:BRACED 1; action:Shield spell`
- `DM: cond:BLINDED[1]; atk:Spear +4; note: target behind cover`
- `Ogre: hp=45; ac=13; res:fire; note: rage active`
- `DM: raw:Grant inspiration; note: team advantage for next check`

### Checklist-driven turn progression

- The digital UI should expose separate phase checklists for end-of-turn and start-of-turn.
- The app should initialize checklist items based on current state and computed updates.
- Each item should be editable or overridable before the phase is confirmed.
- The shorthand notation is the compact representation used in the checklist and on printed sheets when the DM wants to capture turn-specific changes.

- Actions: every turn cell should allow or include an `action:` / `atk:` / `cast:` token describing the action taken by that combatant on that turn. Action tokens provide the provenance for condition deltas and consumable changes and must be recorded in the checklist/turn cell so the GM has context for deltas applied to targets.

### Checklist item schema

- Checklist items are lightweight records proposed by the app at the end or start of a turn. They capture a compact, human-editable set of shorthand tokens plus a parsed representation the UI can initialize and present for confirmation.

Minimal JSON model (recommended):

```json
{
  "id": "uuid",
  "encounterId": "uuid",
  "turnIndex": 3,
  "phase": "end",
  "actorId": "Goblin1",
  "tokens": ["-7hp","cond:PRONE","move:10"],
  "tokensHash": "sha256-hex-of-tokens", 
  "note": "fell from ledge",
  "overridden": false,
  "applied": false,
  "timestamp": "2026-07-07T12:00:00Z"
}
```

- Field notes:
  - `turnIndex`: integer counter for the encounter turn (0-based or 1-based as agreed by the UI).
  - `phase`: either `end` or `start` (separate checklists).
  - `tokens`: the compact shorthand strings from the turn row; authoritative single source of truth for the checklist item.
  - `tokensHash`: optional integrity/checksum of `tokens` to detect accidental edits or round-trips.
  - `overridden`: true if the DM edited the checklist item before confirming.
  - `applied`: true once the item has been confirmed and applied to combatant state (or recorded for paper output).

Note: do NOT persist parsed or derived representations (such as `proposedEffects`). Compute structured effects from `tokens` on-demand in the UI/runtime so the stored JSON remains the single source of truth and cannot diverge.

Examples (mapped to tokens):

- Turn row: `Goblin1: -7hp; cond:PRONE; move:10; note: fell from ledge`
  - `tokens`: ["-7hp","cond:PRONE","move:10","note:fell from ledge"]
  - `proposedEffects`: [{"type":"hpDelta","value":-7},{"type":"conditionAdd","name":"PRONE"},{"type":"move","distance":10}]

- Turn row: `PC_A: +5hp; temp:BRACED 1; action:Shield spell`
  - `tokens`: ["+5hp","temp:BRACED 1","action:Shield spell"]
  - `proposedEffects`: [{"type":"hpDelta","value":5},{"type":"tempEffect","name":"BRACED","duration":1},{"type":"action","text":"Shield spell"}]

### Data behavior

- Auto-fill support is allowed only as a convenience.
- If a combatant is created from an internal template or database entry, the DM can immediately change any entry.
- The most recent DM-entered value is authoritative.
- If the app later refreshes or reloads an encounter, it must preserve overrides rather than resetting them to defaults.

### Monster templates

- Support creating a group of monsters from a single template in the first version.
- Templates are internal definitions used to populate combatant instances.
- Templates may include core fields only; custom monster persistence is deferred to later versions.
- Instance data should remain separate from template definitions so overrides stay local to the encounter.
- A simple internal JSON schema is sufficient; import/export is not required for the first version.

Example template shape:

```json
{
  "templateId": "goblin-archer",
  "name": "Goblin Archer",
  "type": "humanoid",
  "cr": "1/4",
  "ac": 13,
  "hp": 9,
  "spd": "30 ft.",
  "stats": {"str": 8, "dex": 14, "con": 10, "int": 10, "wis": 8, "cha": 8},
  "actions": [
    "Shortbow. Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
  ],
  "notes": "Advantage from high ground"
}
```

Example persisted encounter shape:

```json
{
  "encounters": [
    {
      "id": "uuid",
      "name": "Goblin Ambush",
      "createdAt": "2026-07-07T12:00:00Z",
      "notes": "Bridge encounter",
      "combatants": [
        {
          "id": "uuid",
          "templateId": "goblin-archer",
          "name": "Goblin Archer",
          "type": "monster",
          "initiative": 15,
          "maxHp": 11,
          "currentHp": 7,
          "ac": 13,
          "conditions": ["hidden"],
          "notes": "Advantage from high ground",
          "sourceTemplate": "goblin-archer",
          "overrides": {
            "name": true,
            "maxHp": true,
            "ac": false
          }
        }
      ]
    }
  ]
}
```

### Storage model

- Store encounters and combatants locally in browser storage.
- Keep encounter data available until the user explicitly exports or prints it out.
- For future expansion, preserve campaign data across sessions and keep player starting data read-only for the campaign duration.
- Use an object-based format suitable for IndexedDB.
- Provide explicit export/import of JSON for backup, sharing, and manual editing.
- Keep storage independent of internal default/template data.

Example persisted object shape:

```json
{
  "encounters": [
    {
      "id": "uuid",
      "name": "Goblin Ambush",
      "createdAt": "2026-07-07T12:00:00Z",
      "notes": "Bridge encounter",
      "combatants": [
        {
          "id": "uuid",
          "name": "Goblin Archer",
          "type": "monster",
          "initiative": 15,
          "maxHp": 11,
          "currentHp": 7,
          "ac": 13,
          "conditions": ["hidden"],
          "notes": "Advantage from high ground",
          "sourceTemplate": "goblin-archer",
          "overrides": {
            "name": true,
            "maxHp": true,
            "ac": false
          }
        }
      ]
    }
  ]
}
```

### Internal data and override semantics

- **Source templates**: Templates may populate default values, but they must be treated as suggestions.
- **Override indicator**: Track whether a value is user-overridden so the app can show it clearly and avoid resetting it.
- **Editable defaults**: If a DM edits a field that was auto-filled, the app stores the override.
- **Reapply logic**: If a template changes later (e.g. new internal database version), do not overwrite fields that a DM has overridden.

## Print support

- A print stylesheet should present a meaningful encounter sheet:
  - Combatant list with key stats and current HP
  - Initiative order
  - Conditions/status, notes, and a blank annotation area
- Prefer a single-page printable layout for an encounter.
- Ensure print output hides UI controls and focuses on content.

## Future synchronization readiness

- Decouple the persistent data model from the storage implementation.
- Keep encounter and combatant objects serializable to JSON.
- Avoid storing runtime-only state inside the persistent model.
- If sync is added later, use the same JSON shape as the source of truth.

## Next steps

1. Define the first combat tracker wireframe and table layout.
2. Choose a frontend approach: plain HTML/JS, lightweight framework, or PWA.
3. Implement local persistence with IndexedDB and export/import.
4. Add the override metadata and UI controls for manual edits.
5. Add print styles for the encounter sheet.

## Questions to refine the spec

- Should combatant entries support custom attributes beyond HP/AC/initiative, such as spellcasting or resistances?
- Do you want multiple encounters stored at once, or only one active encounter at a time?
- Should the app allow quick creation from prebuilt monster templates, or only free-form combatants initially?
- Is initiative tracking turn-by-turn automation required, or is a manual initiative reorder sufficient?
