# DM Screen: Documentation Index

Combat tracker / DM screen app. Read only what the task needs; each entry says
when to read it. Section IDs in brackets (for example `[ARCH-ORDER]`) are stable
anchors: cite them in tasks, reviews, and code comments.

| File | Read when you are working on… | Approx. size |
|---|---|---|
| [product-spec.md](product-spec.md) | what the app is for, principles, encounter lifecycle, override semantics, templates, party data, print/sync goals | ~1.5k tokens |
| [tracker-ui.md](tracker-ui.md) | tracker grid layout, turn entry panel, checklists, controls, printed sheet, UI validation | ~1.5k tokens |
| [tracker-workflow.md](tracker-workflow.md) | rounds, turns, `ActiveTurn`, phases, checklists, turn data model, corrections | ~0.8k tokens |
| [shorthand.md](shorthand.md) | parsing or generating turn shorthand, tokens, rolls, labels/targets | ~2.5k tokens |
| [architecture.md](architecture.md) | schema authority, Pinia store, repositories, persistence ordering, IDs, drafts, mutation, deletion, turn invariants, routing, views, import/export | ~3.5k tokens |
| [glossary.md](glossary.md) | any unfamiliar term; check here before inventing one | ~0.8k tokens |
| [open-issues.md](open-issues.md) | known conflicts between documents; check before implementing anything they touch | ~1.8k tokens |

## Source of truth

- **Data shape:** the JSON Schema (YAML), not these documents. No document here
  defines persisted properties. Location: *add path here* (not included in this
  tree).
- **Behavior and UX:** `product-spec.md`, `tracker-ui.md`.
- **Notation grammar:** `shorthand.md`.
- **Structure and invariants:** `architecture.md`.
- If two documents disagree, the entry in `open-issues.md` says so; do not pick
  silently. Ask the owner.

## Quick routing for AI agents

- Touching storage, stores, or object lifecycle → `architecture.md`
- Touching tracker screens or turn entry → `tracker-ui.md` (+ `tracker-workflow.md`; invariants in `[ARCH-TURN]`)
- Writing or validating shorthand → `shorthand.md` (+ `[ARCH-REFS]` for labels)
- Import/export → `[ARCH-IMPORT]` and `[ARCH-IDENTITY]`
- Print → `[UI-PRINT]`, `[PROD-PRINT]`

## Conventions

- Normative words (SHALL, MUST, MAY) follow RFC 2119.
- One definition per term; see `glossary.md`.
- Do not copy JSON examples into prose docs; the schema is authoritative.
