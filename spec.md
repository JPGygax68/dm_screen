# DM Screen Specification

## Purpose

Create a web-based combat tracker for a Dungeon Master screen with an emphasis on flexibility, override capability, and printable output.

The app should be a client-side application with persistence and explicit export/import. It should avoid hard dependencies on internal data by allowing the DM to override any auto-filled values.

## Core Principles

- **User control over data**: Any value the app auto-fills from internal rules, templates, or defaults must be editable by the GM.
- **No opaque internal dependency**: The app can provide suggestions and defaults, but those should always be visibly editable and replaceable.
- **Print-friendly UI**: The combat tracker should produce a printable sheet or view with annotation-friendly areas.
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
   - End encounter review popup: optionally summarize conditions that were added or removed during this encounter and allow the GM to reset those conditions.

6. **Turn progression**
   - Initiative sorting is optional in the digital UI and should not be assumed for paper.
   - Ending a turn and starting the next turn are separate, user-controlled steps.
   - The app should propose a checklist for each phase, initializing items with computed updates.
   - Each checklist item must be manually overridable by the GM.
   - Turn recording should be supported by large, fixed-position input panels that remain visible during entry. The panels should appear in a consistent vertical zone and may use different horizontal alignment for start-of-round, per-turn, and end-of-turn actions.
   - Turn cells should become active automatically once the previous turn has been confirmed by the GM. The first turn should activate automatically once the GM has confirmed that the round can begin.
   - The initial turn-entry panel should behave like a menu, opening sub-panels to the right as needed for specific turn actions.
   - The currently edited turn cell should remain visible and should display a live shorthand preview while the panel is active. The active cell should be visually indicated, for example with a highlight or arrow cue, so the GM can clearly see which turn is being filled.
   - For tablet use, complex or rare entries should be supported by a numbered footnote system as an alternative to typing on a virtual keyboard.
   - The input panel should be large enough to support touch-friendly controls and fast interaction, with clear confirm, cancel, and clear actions.

7. **Annotations and overrides**
   - Inline editable notes for each combatant
   - Global encounter notes
   - Fields should allow manual override of auto-filled or suggested values

8. **Turn shorthand notation**
   - Every combat turn should be represented by a single row in the UI and on printable sheets.
   - The shorthand syntax is documented separately in a standalone specification so it can evolve independently of the core app spec.
   - Provide a small hideable free-text area for the GM to record encounter-wide notes that span multiple turns.

   See [shorthand-notation-spec.md](shorthand-notation-spec.md) for the full notation grammar, token definitions, examples, and checklist guidance.

### Turn entry workflow

- At encounter start, the GM prepares participants and confirms that the encounter is ready to begin. The first turn cell becomes active automatically.
- When a turn is confirmed, the next turn cell becomes active automatically. The previous turn becomes locked and remains visible as a completed record.
- The active turn cell should open the turn-entry panel, which begins as a menu and can open sub-panels to the right for specific action types such as attack, cast, condition, damage, heal, switch, or note.
- The turn-entry panel should support confirm, cancel, and clear actions. Confirm commits the shorthand preview to the turn cell; cancel closes the panel without changing the turn; clear removes any unsaved input.
- The active turn cell should display a live shorthand preview while the panel is open, and the active cell should remain visually distinguished so the GM can easily see which turn is being filled.

### Checklist-driven turn progression

- The digital UI should expose separate phase checklists for end-of-turn and start-of-turn.
- The app should initialize checklist items based on current state and computed updates.
- Each item should be editable or overridable before the phase is confirmed.
- The shorthand notation is the compact representation used in the checklist and on printed sheets when the DM wants to capture turn-specific changes.
- Actions: every turn cell should allow or include an `action:` / `atk:` / `cast:` token describing the action taken by that combatant on that turn. Action tokens provide the provenance for condition deltas and consumable changes and must be recorded in the checklist/turn cell so the GM has context for deltas applied to targets.

### Turn data model

- Each turn cell should persist its data as shorthand notation text.
- Rounds should be modeled as objects that wrap a list/array of turns plus round-level metadata that applies to all turns in that round.
- Round-level data may include notes, phase markers, or other encounter-wide information that is shared by the turns in that round.

### Encounter lifecycle

- The encounter should progress through three basic states: creating, active, and ending.
- Creating covers assembling participants, checking or adjusting initial conditions, and preparing the encounter for recording.
- Active covers the period during which rounds and turns are being recorded.
- Ending covers final notes, wrap-up data entry, and any encounter-end review actions.
- The app should support a small set of explicit encounter-end reasons so the GM can mark how the encounter concluded. Suggested reasons include: all hostile combatants defeated, retreat/withdrawal, objective achieved, time/scene change, or GM-defined conclusion.
- The encounter-end reason should be stored as part of the encounter metadata and should be editable before the encounter is finalized.

### Turn editing and validation

- Existing turn entries should be editable, but only after the GM explicitly unlocks the turn for editing.
- Undo/redo support is a future enhancement and should not be blocked by the initial spec.
- Invalid or malformed shorthand should be made impossible by the UI wherever practical.
- The app should still perform internal validation of shorthand input to catch bugs and prevent inconsistent data.

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

### Player character data format

- The app should define a flexible player-character profile schema that supports optional fields.
- Most fields can be left empty, since the GM may choose to manage them manually.
- The schema should support both a full profile and an encounter-specific state overlay.
- All fields should be serializable to JSON and stored in the browser.

Recommended PC profile shape:

```json
{
  "id": "uuid",
  "name": "Elandra Brightwood",
  "label": "Elandra",
  "type": "pc",
  "race": "Half-Elf",
  "class": ["Fighter", "Rogue"],
  "level": 5,
  "background": "Mercenary",
  "currentHp": 32,
  "maxHp": 38,
  "tempHp": 0,
  "ac": 17,
  "initiative": 3,
  "speed": "30 ft.",
  "conditions": ["Blessed"],
  "stats": {"str": 14, "dex": 18, "con": 14, "int": 12, "wis": 10, "cha": 13},
  "saves": {"str": 2, "dex": 6, "con": 2, "int": 1, "wis": 0, "cha": 1},
  "skills": {"athletics": 5, "stealth": 8, "perception": 4},
  "spellSlots": {"1": 3, "2": 2, "3": 1},
  "resources": {"arrows": 20, "healing_potion": 2},
  "equipment": ["shortsword", "shield", "light crossbow"],
  "currentWeapon": "shortsword",
  "notes": "Uses inspiration on key attacks.",
  "overrides": {
    "ac": false,
    "initiative": true,
    "currentHp": true
  }
}
```

- Optional fields are expected. The profile can contain only the subset of fields that the GM wants to track digitally.
- `overrides` should capture which values the GM has explicitly adjusted relative to defaults or templates.
- `currentWeapon` supports weapon switch tracking and can be used to propose `switch:` tokens when the next attack uses a different weapon.
- `spellSlots`, `resources`, and `equipment` are optional dictionaries/arrays for consumables and inventory.

Encounter state overlay:

```json
{
  "encounterId": "uuid",
  "pcId": "uuid",
  "currentHp": 28,
  "tempHp": 0,
  "conditions": ["Blessed", "Concentrating"],
  "currentWeapon": "shortsword",
  "initiative": 3,
  "notes": "Holding action for the next round.",
  "lastUpdated": "2026-07-08T10:00:00Z"
}
```

- Encounter overlays store the active state for a combatant during a single encounter.
- They may be sparse and only include fields that differ from the base profile.
- When the app does not have a field, it should still allow the GM to record changes manually via shorthand tokens or free-form notes.

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
- The app, and the print stylesheet, should also support printing completely blank forms

## Future synchronization readiness

- Decouple the persistent data model from the storage implementation.
- Keep encounter and combatant objects serializable to JSON.
- Avoid storing runtime-only state inside the persistent model.
- If sync is added later, use the same JSON shape as the source of truth.

## Next steps

1. Define the first combat tracker wireframe and table layout.
2. Choose a frontend approach suitable for the target platform.
3. Implement local persistence with IndexedDB and export/import.
4. Add the override metadata and UI controls for manual edits.
5. Add print styles for the encounter sheet.

## Questions to refine the spec

- Should combatant entries support custom attributes beyond HP/AC/initiative, such as spellcasting or resistances?
- Do you want multiple encounters stored at once, or only one active encounter at a time?
- Should the app allow quick creation from prebuilt monster templates, or only free-form combatants initially?
- Is initiative tracking turn-by-turn automation required, or is a manual initiative reorder sufficient?
