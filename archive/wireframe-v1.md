# First-pass wireframe

This document describes a first-pass wireframe for the main encounter screen.

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
   - Fixed in the lower part of the screen
   - Starts as a compact grid of shorthand-type buttons
   - Can open sub-panels for specific action types
   - Shows the active turn's shorthand content directly in the turn cell
   - Includes confirm, cancel, and clear actions

5. Active turn cue
   - The current turn cell is visually highlighted
   - A small arrow or marker may be used to show the active cell

## Non-authoritative ASCII illustration

The following sketch is illustrative only and not meant to be pixel-perfect:

```text
+-----------------------------------------------------------------+
| Encounter header: Name | Tag | Notes | Start/End/Export         |
+-----------------------------------------------------------------+
| Current state row: PC1 HP/Init/Cond | PC2 HP/Init/Cond ...      |
+-----------------------------------------------------------------+
| Left column | Tracker cells (rounds/turns)    | Notes column    |
| Round/phase | [active turn] [turn] [turn] ... | notes           |
| Round/phase | [turn] [turn] [turn] ...        | notes           |
| Round/phase | [turn] [turn] [turn] ...        | notes           |
+-----------------------------------------------------------------+
| Lower input panel                                               |
| Grid: Attack | Cast | Condition | Damage | Heal | Switch | Note |
| Sub-panel content for the selected shorthand type              |
| Confirm | Cancel | Clear                                        |
+-----------------------------------------------------------------+
```

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
- within each round row: a left frozen round label, a scrollable set of combatant cells, and a right notes area.

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
- The GM opens the lower input panel.
- The panel starts as a compact grid of shorthand-type buttons and can open sub-panels for the selected action.
- The selected action adds shorthand content directly to the active turn cell.
- Confirm commits the entry.

### Turn progression
- Once the current turn is confirmed, the next turn cell becomes active automatically.
- Completed turns remain visible as locked records.

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
