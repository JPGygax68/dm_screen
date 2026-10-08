# Glossary

One definition per term. Where the source documents used different words for the
same thing, the preferred term is listed first (see OPEN-01 in
[open-issues.md](open-issues.md); preferred terms are proposals until
confirmed).

- **Participant** — A PC, NPC, or monster taking part in an encounter.
- **Campaign** — Top-level container of party, encounters, and related data.
- **Encounter** — A recorded combat, with participants, rounds, and notes.
- **Round** — One pass through the participants; has round-level metadata and an ordered list of turns.
- **Turn** — One participant's slot within a round. Status includes `active` while it is the current turn. One-based number within its round.
- **ActiveTurn** — Runtime pointer to the current round and turn number plus the current `phase`.
- **Phase** — Phase of a turn: `start` checklist, action entry, `end` checklist. 
    TODO: probably useless.  Experiment.
- **Checklist** — Proposed, GM-editable set of token entries for a start or end phase.
- **Token** — One compact shorthand update, such as `-7hp` or `cond:PRONE`. See [shorthand.md](shorthand.md).
- **Shorthand** — The compact notation for recording turn updates; the editable source of truth for checklist items and print.
- **Label** — Encounter-unique, space-free, human-readable participant identifier (`A-Z a-z 0-9 _ -`). Used by shorthand, print, and targeting.
- **Name** — Optional descriptive or proper name. Never used as a shorthand reference.
- **ID** — Opaque, globally unique, application-generated, stable internal identifier (UUID by default). Not shown to users.
- **Template** — Read-only catalog definition (for example from the bestiary) used to populate participant instances. Values are copied on use.
- **Override** — A value the GM has explicitly changed from a default or template value; must never be silently reset.
- **Draft** — An uncommitted, editable object that is neither persisted nor linked until `CommitDraft`.
- **Working copy** — Editable copy of a committed object; the committed object is unchanged until a save succeeds.
- **Repository** — The persistence-facing layer. Owns flattening, reconstruction, ordering, and integrity. Stores and views never touch storage layout.
- **Store** — Pinia state holding the nested in-memory object graph.
- **Schema resolver** — Derives the runtime model (collections, entity types, relationships) from the JSON Schema plus a small amount of app metadata.
- **Structural route** — Route derived from the schema's collections and relationships.
- **Workflow route** — Additional per-entity route such as `/edit`, `/track`, `/print`.
- **Generic view** — `GenericCollectionView` / `GenericDetailView`: reusable schema interpreters.
- **Custom view** — Hand-built view that can replace a generic view without changing schema, Store, or repository.
