# Open Issues: Conflicts and Gaps

Found while consolidating the original `spec.md`, `architecture.md`, and
`shorthand-notation-spec.md`. These documents carry the wording of the originals
unless a pointer says otherwise. Resolve each item, then fold the decision into
the owning document and delete the entry here.

Suggested resolutions are proposals, not decisions.

## Cross-document conflicts

### OPEN-01: "combatant" vs "participant"
Original spec and its JSON examples use *combatant*; architecture and shorthand
use *participant*.
**Proposal:** use *participant* everywhere (done in `tracker-ui.md` and
`product-spec.md`); keep a note in the glossary.

### OPEN-02: What does a turn contain?
- Spec: each turn cell persists "an array of Note objects".
- Workflow (`[WORK-CHECKLIST]`): turns have a token list; confirmed checklist
  tokens are appended to it.
- Shorthand: checklist item `tokens` is "authoritative".

**Proposal:** define `Turn.tokens` (shorthand strings) plus optional notes in the
schema; drop "Note objects" unless Notes carry structure not expressible as
tokens (`note:`/`raw:`).

### OPEN-03: Overlays and override flags vs copy-on-create
- Spec: PC profile plus sparse *encounter state overlay*; per-field `overrides`
  boolean maps; "reapply logic" when templates change.
- Architecture (`[ARCH-REFS]`): catalog values are copied into the participant
  instance with a source ID, and later catalog changes SHALL NOT overwrite
  DM-edited values.

If catalog changes never overwrite instance values, per-field override flags and
reapply logic may be unnecessary (or may only serve UI highlighting). Also, the
spec examples carry both `templateId` and `sourceTemplate`.
**Proposal:** decide whether override flags exist for UI display only; choose one
source-reference field name.

### OPEN-04: Import/export scope
Spec: import/export "not required" for templates in v1 (but required for
encounters). Architecture: JSON export/import with version, ID preservation, and
validation is a general first-class operation with ambiguity diagnostics.
**Proposal:** state explicitly which entity types are in v1 scope.

### OPEN-05: Storage shape
Spec persisted examples nest participants inside encounters ("object-based
format suitable for IndexedDB"); architecture mandates normalized records with
child IDs and repository-owned flattening. The spec examples have been removed
from this tree; the schema is the only shape.

### OPEN-06: Campaign level
Architecture routes and schema root are campaign-based (`/campaigns/:id/party`,
`/encounters`). Spec treats campaign persistence as a later expansion and its
examples have no campaign. Confirm campaign is v1.

### OPEN-07: Turn ordering vs optional initiative sorting
The workflow (`[WORK-ORDER]`) creates "one ordered Turn per participant present when a round
begins". Spec says initiative sorting is optional and "not assumed for paper".
Define how turn order is established when initiative sorting is off, and how a
participant added mid-encounter is placed (architecture: next round by default,
DM may insert).

### OPEN-08: Labels in examples and the `DM` actor
Architecture requires every participant to have a unique canonical label.
Spec's monster/combatant example has no `label`. Shorthand examples use `DM` as
an actor, which is not a participant. Define whether `DM` is a reserved pseudo
actor, and how it is validated.

### OPEN-09: Print requirements overlap
See OPEN-12.

## Shorthand grammar ambiguities

### OPEN-10: Overlapping condition forms
`cond:NAME`, `clr:NAME`, `cond:+NAME[N]`, `cond:-NAME`, `+NAME`, `-NAME` all
change conditions. `+NAME` / `-NAME` are visually close to `+Nhp` / `-Nhp` and to
`ac+N`. `cond:-NAME` is described as "remove ... with duration semantics" without
saying how it differs from `clr:`.
**Proposal:** pick canonical forms and mark the rest as accepted aliases.

### OPEN-11: Undefined or inconsistent tokens
- `utilize` appears in an example but is not in the token list.
- `magic`, `study`, `search`, `influence`, `custom` are described only through the
  shared roll suffix; their base forms are not listed under "Actions".
- Colon optional rule (`cast Fireball` / `cast:Fireball`, `note: text`) is stated
  for "keywords the grammar permits" without listing which keywords.
- There is no formal grammar (EBNF); the parser contract is prose plus examples.
- `atk` has two descriptions (roll suffix section vs `atk TARGET ...` line) with
  slightly different optional parts.

## Spec content that no longer fits

### OPEN-12: Old print bullets vs round-row layout
Original "Print support" lists a combatant list with key stats, *initiative
order*, conditions/status, notes, and a blank annotation area. The tracker
layout is one row per round with participant columns and a frozen notes column.
Decide whether the initiative-order list is still wanted, or is superseded by
the round grid.

### OPEN-13: Planning notes removed
`Next steps` and `Questions to refine the spec` from the original were left out
as planning content, not requirements. Their questions appear answered by the
architecture (multiple encounters: yes; prebuilt templates: yes in v1; manual vs
automated initiative: manual/optional). Confirm, and recover them from
`spec.md` if wanted.

## Not included in this tree

- **`schema.yaml`**: the JSON Schema is the authoritative data definition
  (`[ARCH-POSITION]`) and was not part of the upload. All embedded JSON examples
  (PC profile, overlay, template, encounter, checklist item) were deliberately
  removed so they cannot compete with it. Add the real schema to this folder, or
  link to its repo path in the README.
