# First Wireframe Scope

This document defines the first low-fidelity wireframe scope for the digital combat tracker.

## Goal

Create a simple, reviewable layout for the core encounter experience:
- preparing an encounter,
- recording turns,
- and reviewing the encounter at the end.

## Primary screen to wireframe

The first wireframe should cover the main encounter screen, including:
1. the encounter header,
2. the tracker grid,
3. the current-state header row,
4. the turn-entry input panel,
5. and the active turn highlight.

## Proposed layout

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Encounter header: name | session tag | quick notes | controls        │
├──────────────────────────────────────────────────────────────────────┤
│ Current state header row: combatant HP / condition summary           │
├──────────────────────────────────────────────────────────────────────┤
│ Left frozen column | Combatant columns (scrollable) | Notes column   │
│ Round/phase        | Turn cells / current state     | annotations    │
│ ...                | ...                            | ...            │
├──────────────────────────────────────────────────────────────────────┤
│ Fixed bottom input panel: menu / sub-panel / preview                 │
└──────────────────────────────────────────────────────────────────────┘
```

## Major regions

### 1. Encounter header
Include:
- encounter name,
- session tag or date,
- quick notes,
- primary encounter controls.

### 2. Current-state header row
Show a compact summary for each combatant:
- name/label,
- HP,
- initiative,
- active conditions.

### 3. Tracker grid
The main battle grid should show:
- a frozen left column for round/phase and round-level controls,
- a central area for turn cells,
- and a frozen right column for notes/annotations.

### 4. Turn-entry input panel
The panel should be placed in a fixed lower area and should support:
- a menu-first interaction,
- sub-panels for specific action types,
- a live shorthand preview,
- confirm, cancel, and clear actions.

### 5. Active turn affordance
The active turn cell should be visually distinguished with:
- a highlight,
- or a small arrow/marker cue,
- while keeping the live preview visible in the cell.

## Interaction flow to show

The wireframe should clearly communicate these flows:

1. Encounter setup
   - assemble participants,
   - review initial conditions,
   - confirm readiness to begin.

2. Turn recording
   - the first turn becomes active automatically,
   - a turn-entry panel opens,
   - the GM confirms the entry,
   - the next turn becomes active automatically.

3. Turn editing
   - existing turns can be unlocked for editing,
   - and the UI should make that state obvious.

4. Encounter ending
   - the encounter shifts into an ending state,
   - final notes can be added,
   - and end-of-encounter review actions are available.

## Scope for the first wireframe

Include:
- the core encounter screen,
- the fixed bottom input panel,
- one active turn flow,
- and the basic distinction between active, completed, and editable turns.

## Out of scope for the first wireframe

The first wireframe does not need to define:
- full visual styling,
- advanced print layouts,
- monster-template creation UI,
- persistence implementation,
- or full undo/redo behavior.
