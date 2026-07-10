# Second-pass wireframe

This document describes a second-pass wireframe for the main encounter screen.

## Goal

Show the core UI structure for:
- encounter setup,
- turn recording,
- and encounter ending.

## Authoritative layout description

The screen can be described as five stacked regions:

1. Header region
   - Encounter name
   - Session tag or date
   - Quick notes
   - Encounter-level controls

2. Current-state row
   - One compact summary area per combatant
   - Each summary shows HP, initiative, and active conditions

3. Tracker grid
   - A single current-state header row appears above the round rows and shows each combatant's compact summary (portrait, HP, initiative, conditions).
   - Each round is a single stretchable row composed of a left frozen area (round label and controls), a horizontally scrollable center area with one cell per combatant, and a right frozen area for round notes.

4. Lower input panel
   - Fixed in the lower part of the screen and anchored in a consistent vertical zone.
   - Opens automatically when the encounter enters recording state and when the active turn cell is selected.
   - Is divided horizontally into three parts:
     1. The shorthand type selector: a grid of buttons to choose the action or token type for the current turn cell.
     2. The detail input panel: shorthand-type specific fields plus an optional raw multiline shorthand entry area.
     3. The flow control panel with buttons for:
        1. confirming the current shorthand draft,
        2. moving to the next turn with a separate `Next Turn` control,
        3. canceling the current draft without recording it,
        4. clearing the current draft to start over.
   - Confirm should commit the shorthand into the active turn cell. The separate `Next Turn` control should advance the active turn once the current entry is ready.
   - Cancel should abandon the current draft without closing the panel.

5. Active turn cue
   - The current turn cell is visually highlighted
   - A small arrow or marker may be used to show the active cell

## Region details

### 1. Encounter header
Contains:
- encounter name,
- session tag or date,
- quick notes,
- and encounter-level controls.

### 2. Current-state header
A compact summary row showing each combatant's:
- name/label,
- current HP,
- initiative,
- and active conditions.

### 3. Tracker grid
The main combat grid should include:
- a single `current-state` header row displayed once above the round rows (not repeated per round),
- per-round rows that may expand vertically to accommodate multi-line shorthand content,
- the round label column is horizontally frozen,
- the combatant columns scroll horizontally so the active turn cell is fully visible,
- a frozen "notes" column is set aside at the right end of the tracker, with one multi-line text cell per round/row.

### 4. Fixed lower input panel
This panel is always anchored in the same lower area.

It should support:
- a compact grid of shorthand-type buttons,
- sub-panels for specific action types,
- direct shorthand entry into the active turn cell,
- and clear confirm/cancel/clear actions.

### 5. Active turn focus
The currently active turn cell should be visually distinguished.

Suggested cues:
- a highlight,
- a small arrow or marker,
- or a subtle outline around the cell.

## Interaction flow shown in the wireframe

### Encounter start
- The encounter begins in a setup state.
- Initial combatants are visible.
- The first turn cell becomes active automatically.

### Turn recording
- The lower input panel opens automatically when the encounter enters recording mode and when the active turn cell is selected.
- The shorthand type selector chooses the kind of action to record, and the detail input panel updates to show the relevant fields.
- The active turn cell should show live shorthand draft content while the panel is open.
- Confirm commits the entry to the cell.
- A separate `Next Turn` control advances the active turn once the current entry is ready.

### Turn progression
- Once the current turn is confirmed, the next turn cell becomes active automatically.
- Completed turns remain visible, and state changes may still be applied immediately if needed.
- Action-type entry for a combatant who has already acted in the round should be discouraged: shorthand action buttons may be grayed out or disabled for those turns, while raw entry remains as an escape hatch.

### Encounter ending
- The encounter enters an ending state.
- The GM can add final notes.
- The encounter-end reason can be selected and recorded.

## Notes for review

This first-pass wireframe is intentionally simple and should be used to review:
- the overall layout,
- the position of the lower input panel,
- the active turn focus behavior,
- and the separation between encounter header, tracker grid, and notes area.

## Out of scope for this pass

- detailed styling,
- full print layout,
- persistence behavior,
- advanced monster-template UI,
- and undo/redo interactions.
