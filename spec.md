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

2. **Combatant roster**
   - Columns:
     - Name / label
     - Initiative
     - Max HP
     - Current HP
     - AC / defenses
     - Status / conditions
     - Notes
   - Distinguish player characters from monsters/NPCs visually.
   - Allow sorting by initiative, name, or custom order.

3. **Combatant details panel**
   - Optional expanded view for a selected combatant
   - Editable fields: name, type, HP, AC, initiative, conditions, description, tags
   - Auto-filled fields may be provided from an internal lookup, but every field stays editable.

4. **Controls**
   - Add combatant
   - Duplicate combatant
   - Remove combatant
   - Reset encounter
   - Step initiative / next turn
   - Apply damage / healing
   - Mark/clear conditions
   - Export encounter data
   - Print encounter sheet

5. **Annotations and overrides**
   - Inline editable notes for each combatant
   - Global encounter notes
   - Fields should allow manual override of auto-filled or suggested values

6. **Turn shorthand notation**
   - Every combat turn should be represented by a single row in the UI and on printable sheets
   - Use a super-compact notation that is easy to parse without AI
   - Limit the character set to US-ASCII plus optional non-US characters for readability
   - Provide a small free-text area for the GM to record encounter-wide notes that span multiple turns

### Data behavior

- Auto-fill support is allowed only as a convenience.
- If a combatant is created from an internal template or database entry, the DM can immediately change any entry.
- The most recent DM-entered value is authoritative.
- If the app later refreshes or reloads an encounter, it must preserve overrides rather than resetting them to defaults.

### Storage model

- Store encounters and combatants locally in browser storage.
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
