# DM Screen: Product Specification

> Scope: purpose, principles, platform, encounter lifecycle, override semantics,
> templates, party data, print, sync readiness. UI layout and turn entry live in
> [tracker-ui.md](tracker-ui.md); data authority and persistence rules live in
> [architecture.md](architecture.md). Persisted data shapes are defined by the
> JSON Schema only, not in this document.

## [PROD-PURPOSE] Purpose

A web-based combat tracker for a Dungeon Master screen, emphasizing flexibility,
override capability, and printable output.

The app is a client-side application with persistence and explicit
export/import. It avoids hard dependencies on internal data by allowing the DM
to override any auto-filled value.

## [PROD-PRINCIPLES] Core principles

- **User control over data**: any value the app auto-fills from rules,
  templates, or defaults is editable by the GM.
- **No opaque internal dependency**: the app may suggest and default, but
  suggestions are always visibly editable and replaceable.
- **Print-friendly UI**: the tracker produces a printable sheet or view with
  annotation-friendly areas.
- **Client-side persistence**: browser storage plus explicit file
  export/import, so the app runs without a server.
- **Offline-capable**: works without network connectivity.
- **Future-friendly sync**: data model and storage layer allow later sync to
  other devices without breaking the app.

## [PROD-PLATFORM] Target platform

- Tablets in landscape (primary): the DM's main use case is tracking a campaign
  at the table on a tablet.
- Desktop computers: for campaign preparation
- Smartphones, both in landscape and in portrait mode: when no other device is available. (In a future version, some manner of "player mode" synchronized with the DM's view could help players too. For Player Mode, the smartphone would probably be the primary target platform.)
- Laptops (secondary)

## [PROD-LIFECYCLE] Encounter lifecycle

An encounter normally progresses through `Creating` → `Active` → `Ending` →
`Completed`. These status values are defined by the `EncounterStatus` schema.

- **Creating**: assembling participants, checking or adjusting initial
  conditions, preparing for recording.
- **Active**: rounds and turns are being recorded.
- **Ending**: final notes, wrap-up data entry, end-of-encounter review.
- **Completed**: the encounter has been finalized and is no longer in active
  play.

Before moving an encounter to `Completed`, the GM SHALL select an end reason
from the schema's `EncounterEndReason` values. An optional end-reason note may
provide detail. The reason remains editable until the encounter is finalized.

## [PROD-OVERRIDE] Data behavior and override semantics

- Auto-fill is a convenience only.
- A participant created from a template or catalog entry can be changed in every
  field immediately.
- The most recent DM-entered value is authoritative.
- Reloading or refreshing an encounter preserves overrides; it never resets
  them to defaults.
- **Source templates** populate defaults but are treated as suggestions.
- **Override indicator**: the app tracks whether a value is user-overridden so
  it can show this clearly and avoid resetting it.
- **Editable defaults**: editing an auto-filled field stores the override.
- **Reapply logic**: if a template changes later (for example a new internal
  database version), fields the DM has overridden are not overwritten.

See OPEN-03 in [open-issues.md](open-issues.md) for how this relates to the
copy-on-create rule in `[ARCH-REFS]`.

## [PROD-TEMPLATES] Monster templates

- The first version supports creating a group of monsters from a single
  template.
- Templates are internal definitions used to populate participant instances.
- Templates include core fields only (name, type, CR, AC, HP, speed, ability
  scores, actions, notes). Custom monster persistence is deferred.
- Instance data stays separate from template definitions, so overrides remain
  local to the encounter.
- Template import/export is not required for the first version.

## [PROD-PARTY] Player character data

- The player-character profile supports fields that the GM may manage manually;
  the schema defines which fields are required and their exact shapes.
- The model supports both a full profile and an encounter-specific state
  overlay (see OPEN-03).
- All fields are JSON-serializable and stored in the browser.

Persisted profile fields and their requiredness are defined only in
`src/models/data.schema.yaml`; this document does not duplicate the field list.

- `currentWeapon` supports weapon-switch tracking and lets the app propose
  `switch` tokens (see [shorthand.md](shorthand.md)).
- `spellSlots`, `resources`, and `equipment` are optional consumable and
  inventory data.
- Encounter overlays hold a combatant's active state for a single encounter,
  may be sparse, and include only fields that differ from the base profile.
- When the app lacks a field, the GM can still record changes with shorthand
  tokens or free-form notes.

## [PROD-STORAGE] Storage requirements

Behavioral requirements only; the persistence design is in `[ARCH-PERSIST]`.

- Encounters and participants are stored locally in the browser.
- Encounter data stays available until the user explicitly exports or prints it.
- Explicit JSON export/import is provided for backup, sharing, and manual
  editing.
- Storage is independent of internal default/template data.
- Campaign data persists across sessions, and player starting data is
  read-only for the campaign's duration.

## [PROD-PRINT] Print support

- A print stylesheet presents a meaningful encounter sheet (layout details in
  [tracker-ui.md](tracker-ui.md), `[UI-PRINT]`).
- Prefer a single-page printable layout for an encounter.
- Print output hides UI controls and focuses on content.
- The app and print stylesheet also support printing completely blank forms.

## [PROD-SYNC] Future synchronization readiness

- The persistent data model is decoupled from the storage implementation.
- Encounter and participant objects are JSON-serializable.
- Runtime-only state is not stored in the persistent model.
- If sync is added, the same JSON shape is the source of truth.

Detailed rules: `[ARCH-PERSIST]`, `[ARCH-IDENTITY]`, `[ARCH-IMPORT]`.
