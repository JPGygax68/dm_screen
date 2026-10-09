# Combat Tracker: UI and Workflow Specification

> Scope: tracker layout, turn entry panel, checklist-driven turn progression,
> controls, printed layout, validation behavior. Product-level rules are in
> [product-spec.md](product-spec.md); turn data and workflow rules (`ActiveTurn`, turn
> status, token lists) are in `[WORK-ACTIVE]` in [tracker-workflow.md](tracker-workflow.md);
> notation grammar is in [shorthand.md](shorthand.md).

## [UI-USECASE] Primary use case

A DM adds participants, tracks initiative and status, and updates HP and
conditions during an encounter. The tracker supports both player characters and
NPC/monster entries.

## [UI-HEADER] Encounter header

- Encounter name
- Encounter date/time or session tag
- Optional quick notes section

## [UI-LAYOUT] Digital tracker layout

The tracker is organized by round: one row per round, with participants as
scrollable columns.

- The **leftmost column is frozen** and holds the round number, turn phase, and
  round-level controls.
- The **rightmost column is frozen** and is reserved for round-specific notes
  and annotations.
- Horizontal scrolling reveals additional participants while both frozen
  columns stay visible.
- A visually separate **"current state" header row** sits above the round rows.
  It is required in the digital UI and optional in print. It shows each
  participant's current HP and the full list of active conditions, and is the
  authoritative at-a-glance summary of current state (digital).
- Each participant column shows compact status: portrait, name/label, current
  HP, initiative, and a short condition summary.
- Player characters are visually distinguished from monsters/NPCs in column
  headers or portraits.
- Round rows may grow vertically to fit multi-line shorthand entries.
  Implementations may instead use per-cell internal scrollbars; the default
  prototype uses stretchable rows.
- The digital layout mirrors the printed layout as closely as practical, with
  participant columns aligned across the grid.
- Initiative sorting is optional in the digital UI and is not assumed on paper.

## [UI-DETAILS] Participant details panel

- Optional expanded view for a selected participant.
- Editable fields: name, type, HP, AC, initiative, conditions, description,
  tags.
- Auto-filled fields may come from an internal lookup; every field stays
  editable.

## [UI-PRINT] Printed tracker

- One A4 landscape sheet provides enough columns for 5 participants.
- Additional participants are accommodated by appending extra sheets to the
  right edge of the previous sheet.
- The printed sheet keeps the one-row-per-round structure, with a leftmost
  round-label column and a rightmost notes column.
- Clear column headers and compact stat summaries keep the printout usable at
  a glance.
- The "current state" header row is optional in print. The GM may omit it,
  include a pre-combat `turn 0` baseline row, or track current state on
  separate sheets or cards.
- Blank forms are printable (see `[PROD-PRINT]`).

See OPEN-12 in [open-issues.md](open-issues.md): the older print-support
bullets (combatant list, initiative order) do not match this layout.

## [UI-CONTROLS] Controls

- Add, duplicate, remove participant
- Reset encounter
- Step through turn phases (end current turn, start next turn)
- Apply damage / healing
- Mark/clear conditions
- Export encounter data
- Print encounter sheet
- **End-encounter review popup**: optionally summarizes conditions added or
  removed during the encounter and lets the GM reset them.

## [UI-ANNOTATE] Annotations and overrides

- Inline editable notes per participant.
- Global encounter notes: a small, hideable free-text area for notes that span
  multiple turns.
- Every auto-filled or suggested value can be manually overridden.

## [UI-PROGRESSION] Turn progression and checklists

- Each turn is represented by a single cell/row entry in the UI and on print.
- Ending a turn and starting the next turn are separate, user-controlled steps.
- The digital UI exposes separate **end-of-turn** and **start-of-turn**
  checklists. The app initializes checklist items from current state and
  computed updates.
- Every checklist item is editable or overridable by the GM before the phase is
  confirmed.
- Shorthand is the compact representation used in checklists and on printed
  sheets to capture turn-specific changes.

## [UI-ENTRY] Turn entry workflow

- At encounter start the GM prepares participants and confirms the encounter
  can begin. The first turn cell then activates automatically.
- When a turn is confirmed, the next turn cell activates automatically and the
  previous turn is locked but remains visible as a completed record.
- The active turn cell opens the **turn-entry panel**. It starts as a menu and
  opens sub-panels to the right for specific actions (attack, cast, condition,
  damage, heal, switch, note).
- The panel offers **confirm**, **cancel**, and **clear**:
  - confirm commits the shorthand preview to the turn cell;
  - cancel closes the panel without changing the turn;
  - clear removes unsaved input.
- The panel's `Close` control only closes or hides the panel. It does not end
  the round or encounter unless explicitly labelled and implemented to do so.
- The active cell shows a **live shorthand preview** while the panel is open
  and stays visually distinguished (highlight or arrow cue).
- Panels are large, fixed-position, and remain visible during entry, in a
  consistent vertical zone. Horizontal alignment may differ for start-of-round,
  per-turn, and end-of-turn actions.
- Controls are touch-friendly and sized for fast interaction.
- On tablets, complex or rare entries are supported by a **numbered footnote
  system** as an alternative to typing on a virtual keyboard.

## [UI-VALIDATE] Turn editing and validation

- State changes such as damage or healing may be applied immediately even after
  a participant has acted in the round.
- Shorthand action entry for a participant whose turn is complete is
  discouraged: related action buttons may be grayed out or disabled, with raw
  entry available only as an escape hatch. Corrections to completed turns go
  through the explicit correction operation in `[WORK-CORRECT]`.
- Invalid or malformed shorthand is made impossible by the UI wherever
  practical.
- The app still validates shorthand internally to catch bugs and prevent
  inconsistent data.
- Undo/redo is a future enhancement and must not be blocked by the initial
  design.
