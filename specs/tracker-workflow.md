# Tracker Workflow: Rounds and Turns

> Scope: how rounds and turns are created and advanced, `ActiveTurn`, phases,
> checklist-to-turn rules, corrections, and the turn data model. Screens and
> controls are in [tracker-ui.md](tracker-ui.md); notation is in
> [shorthand.md](shorthand.md). The Store and validation layer enforce the
> relationships below (`[ARCH-TURN]` in [architecture.md](architecture.md)).

## [WORK-ORDER] Turn creation and order

The tracker normally creates one ordered `Turn` for each participant present
when a round begins. A participant added while an encounter is running joins at
the next round by default; the DM may explicitly insert a turn into the current
round when appropriate.

See OPEN-07 in [open-issues.md](open-issues.md) for ordering when initiative
sorting is off.

## [WORK-ACTIVE] ActiveTurn and phases

`ActiveTurn` identifies the current round and one-based turn number within that
round. Its phase determines whether the tracker presents start-of-turn checklist
entry, action entry, or end-of-turn checklist entry. The identified turn SHALL
have status `active` while `ActiveTurn` is present.

## [WORK-CHECKLIST] Checklist tokens

Confirmed checklist tokens SHALL be retained in their checklist and appended to
the parent turn's token list.

## [WORK-CORRECT] Corrections

Completed and skipped turns remain editable only through an explicit correction
operation.

## [WORK-MODEL] Turn data model (UI view)

- Each turn cell persists its data as an array of Note objects.
- Rounds are objects that wrap an array of turns plus round-level metadata
  (notes, phase markers, other shared information).

See OPEN-02 in [open-issues.md](open-issues.md): the "Note objects" wording
conflicts with the token-list rules above and in [shorthand.md](shorthand.md).
