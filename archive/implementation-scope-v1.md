# First implementation scope

This document defines a minimal first implementation slice for the combat tracker.

## Objective

Build a small, interactive prototype that proves the main flow:
- encounter setup,
- active turn entry,
- and turn progression.

## In scope for this first slice

### 1. Main screen shell
Create a single screen containing:
- an encounter header,
- a current-state row,
- a tracker grid skeleton,
- and a lower input panel.

### 2. Static sample data
Use simple built-in sample data such as:
- 3 combatants,
- 2 rounds,
- and a few placeholder turn cells.

### 3. Active turn interaction
Support the following interaction:
- the first turn is active by default,
- tapping the active turn opens the lower input panel,
- the panel shows a compact grid of shorthand-type buttons,
- selecting an action opens a small sub-panel,
- shorthand content is entered directly into the active turn cell,
- confirm commits the entry,
- and the next turn becomes active.

### 4. Basic editing behavior
Allow the GM to:
- unlock an existing turn for editing,
- edit the shorthand text,
- and confirm the edit.

### 5. Minimal state handling
Implement only enough state to support:
- the active turn,
- the current input draft,
- the shorthand content for the active cell,
- and the list of completed turns.

## Out of scope for this first slice

Do not implement yet:
- persistence,
- export/import,
- print layout,
- monster-template creation,
- real shorthand parsing beyond basic preview support,
- and full undo/redo.

## Suggested implementation order

1. Create the main shell layout.
2. Add sample combatants and turn cells.
3. Add the lower input panel and compact shorthand-button grid.
4. Add the active-turn entry behavior.
5. Add turn confirmation and progression.
6. Add turn unlock/editing.

## Acceptance criteria

The first slice is successful if the GM can:
- see the main encounter screen,
- activate a turn,
- choose a shorthand type from the lower panel,
- add shorthand content directly to the active turn cell,
- confirm it,
- and move to the next turn.
