# Encounter Specification

## Purpose

An encounter is a persisted record of people and creatures present in a scene,
together with the rounds, turns, notes, and state changes recorded by the DM.
The encounter workflow supports preparation, active tracking, and completion.

The encounter model is schema-defined. This document describes encounter
behavior and workflow; the JSON Schema remains authoritative for persisted data
shape. See [architecture.md](architecture.md) and
[shorthand-notation-spec.md](shorthand-notation-spec.md).

## Encounter lifecycle

An encounter progresses through these states:

```text
Draft -> Ready -> Ongoing -> Completed
```

- `Draft`: the encounter is being assembled or edited.
- `Ready`: setup has been confirmed and the encounter can begin.
- `Ongoing`: rounds and turns are being recorded.
- `Completed`: play has ended and the encounter has been reviewed or finalized.

The encounter may be edited while in `Draft` or `Ready`. During `Ongoing`,
participant changes and corrections use explicit operations. A completed
encounter remains readable and may be reopened through a deliberate correction
or review workflow.

## Setup workflow

The setup workflow is:

1. Create or open an encounter.
2. Enter encounter metadata.
3. Add participants individually or from campaign/catalog data.
4. Add groups of participants when useful, including randomly generated groups
   from a template.
5. Review and edit the complete participant list.
6. Assign or verify initiative, hit points, and conditions for every participant.
7. Resolve duplicate labels and validation errors.
8. Confirm setup.
9. Create Round 1 and its ordered turns.
10. Activate the first turn.

The setup screen should support the following operations:

```text
CreateEncounter
AddParticipant
AddParticipants
UpdateParticipant
RemoveParticipant
ConfirmSetup
BeginRound
```

A multi-participant operation is a sequence of ordinary child commits. Each
participant is validated and persisted before it is linked into the encounter.
If a later participant fails, earlier successful commits remain valid and the
failure is reported. The application may offer rollback as a recovery action,
but rollback is not required for data integrity.

An encounter cannot enter `Ready` until its setup invariants are satisfied and
its current data has been successfully persisted.

## Encounter metadata

The encounter may contain:

- `title`: required human-facing title;
- `summary`: optional short description;
- `location`: optional location or scene description;
- `sessionTag`: optional session name, number, date, or other human-facing tag;
- `createdAt`: creation timestamp;
- `notes`: encounter-wide notes and annotations.

Encounter difficulty is derived from participant XP values, party composition,
and the applicable ruleset thresholds. It may be displayed as a proposal or
comment, but is not persisted as a primary encounter fact.

`sessionTag` is provisional session metadata. It is not a separate Session
entity and may later be replaced or supplemented when sessions are added to the
data model.

## Participants

Every encounter participant has:

- `id`: stable internal identity, normally hidden from the user;
- `label`: required, human-readable encounter-local identifier;
- `type`: `pc`, `npc`, or `creature`;
- `sourceId`: optional reference to the PC, NPC, or creature used as the source;
- `experienceValue`: optional XP value retained from a source creature or
   template for post-encounter attribution;
- `name`: optional proper or descriptive name;
- `initiative`: required initiative value;
- `hitPoints`: required current hit points;
- `temporaryHitPoints`: required tracked temporary hit points value; and
- `conditions`: required collection of active conditions.

`label` is used in shorthand, printed columns, and target references. It must
be unique within an encounter. Canonical labels contain no spaces and use only
letters, digits, `_`, and `-`. The Store and import validator enforce
encounter-wide uniqueness because ordinary JSON Schema cannot enforce uniqueness
across object properties in an array.

`name` is optional because many creatures do not have individual names. The UI
may display `name` when present and fall back to `label`; shorthand always uses
`label`.

`sourceId` is provenance, not encounter identity. An improvised participant may
have no source ID.

The participant's `experienceValue` is retained as input for awarding or
attributing XP when the encounter ends. It is not itself an encounter
difficulty measure, and the schema does not infer a final party or per-PC award
from it.

## Initiative and setup ordering

Initiative is established during setup and stored on each participant. It is
normally not a turn shorthand token because it establishes the order of play
rather than recording a turn event.

Once an encounter is ongoing, initiative normally remains unchanged. An
exceptional change is made through participant editing or an explicit setup or
administrative operation, not ordinary turn notation.

The first round's turn order is determined during setup according to the
encounter's initiative/display ordering policy. The policy may support manual
ordering and optional initiative sorting; paper output must not depend on
automatic sorting.

## Rounds and turns

A round has:

- a one-based `number`;
- an ordered `turns` collection; and
- optional round-level `notes`.

Normally, a round creates one turn for each participant present when that round
begins. Each turn stores:

- `participantId`: the participant owning the turn;
- `status`: `pending`, `active`, `completed`, or `skipped`;
- `startChecklist`: optional start-of-turn checklist;
- `tokens`: confirmed shorthand tokens for the turn;
- `note`: optional free-text note; and
- `endChecklist`: optional end-of-turn checklist.

Turn numbers are positions within a particular round. They are one-based and
must not be treated as stable participant identities. Adding a participant
does not retroactively change the meaning of already recorded turns.

A participant added while an encounter is ongoing joins the next round by
default. The DM may explicitly insert a turn into the current round when that
is appropriate; doing so is a deliberate workflow operation and may change the
current round's ordering.

Completed and skipped turns remain editable only through an explicit correction
operation. Corrections preserve the original shorthand unless the DM changes
it, and should be identifiable in the UI.

## Active turn and phases

`ActiveTurn` identifies the current round, the one-based turn number within that
round, and the current phase:

```text
start | turn | end
```

- `start`: the start-of-turn checklist is being reviewed or applied;
- `turn`: the participant's action entry is active; and
- `end`: the end-of-turn checklist is being reviewed or applied.

While `ActiveTurn` is present, the identified turn has status `active`. The
Store and restore validator must ensure that the referenced round and turn
exist and that their statuses are consistent.

The active turn is workflow state and is persisted so an encounter can resume
after reload. It does not replace the durable turn history.

## Checklists

The app may derive a proposed checklist from current participant and encounter
state. A checklist is an editable set of shorthand updates, not a second
structured event model.

A phase checklist contains:

- `phase`: `start` or `end`;
- `items`: ordered checklist items.

Each checklist item contains:

- `id`: checklist-item identity;
- `tokens`: shorthand tokens;
- `note`: optional annotation;
- `overridden`: whether the DM changed the proposed item; and
- `applied`: whether the item has been confirmed and applied.

The workflow is:

1. Derive proposed checklist items.
2. Allow the DM to edit, accept, reject, or clear them.
3. Confirm the checklist.
4. Apply confirmed tokens to the tracked state.
5. Preserve the checklist and append its confirmed tokens to the parent turn's
   `tokens` collection.

Checklist edits are not required to be machine-generated. The DM's confirmed
entry is authoritative.

## Turn notation

The shorthand notation is the durable human-readable source of truth for turn
updates. Structured effects are derived by the presentation and validation
layers; they are not stored as a competing event model.

The notation uses participant labels for actors and targets. It supports:

- health, armor, movement, conditions, and effects;
- ability, save, and skill modifications with optional durations;
- actions with optional ability/skill and roll information;
- advantage and disadvantage through `d20+` and `d20-`;
- calculated totals with `=`;
- optional `vs AC N` or `vs DC N` comparisons;
- outcomes introduced by `->`; and
- parenthesized human-readable annotations.

For example:

```text
Goblin_1: atk PC_A d20+ +5 = 19 vs AC 15 -> hit dmg=7
PC_A: STR:+2=18[1] (bless); study Runes using INT d20- +5 = 9 vs DC 14 -> failure
```

Initiative is not part of ordinary turn shorthand. Spell slots, device
charges, and inventory are participant state or application-side action effects,
not separate shorthand resource-consumption tokens.

The complete grammar and parsing rules are maintained separately in
[shorthand-notation-spec.md](shorthand-notation-spec.md).

## Validation boundaries

JSON Schema validates local object shape, types, required properties, enums,
patterns, and numeric constraints. The Store/import/restore validator must also
validate encounter-wide invariants, including:

- participant labels are unique after canonical normalization;
- every turn participant ID resolves to a participant in the encounter;
- turns belong to the round that contains them;
- `turnNumber` is one-based and within its round;
- the active round and turn exist;
- the active turn has status `active`;
- checklist phase values match their location;
- checklist items marked `applied` have been confirmed; and
- participants referenced by shorthand labels exist and are unambiguous.

Validation failures must be reported explicitly. Import, restore, and shorthand
parsing must never silently discard data or silently retarget a reference.

## Completion

Completing an encounter moves it to `Completed` and records an
`EncounterEndReason`. Supported reasons currently include:

- `hostiles_defeated`;
- `retreat`;
- `objective_achieved`;
- `scene_change`; and
- `other`, with optional `endReasonNote`.

The ending workflow may review conditions and final notes before completion.
The end reason remains editable until the encounter is finalized through the
application's completion operation.

Completion may use the stored participant XP values to propose an XP award for
the party or individual PCs. The final attribution is a completion workflow
decision and may be adjusted by the DM; it is separate from encounter
difficulty calculation.
