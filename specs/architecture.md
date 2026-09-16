DM Screen app
=============

Software architecture
---------------------

### Architectural position

The JSON Schema is the authoritative definition of the application's persisted
data. It defines the shape, relationships, defaults, and validity constraints of
the data. The application SHALL NOT maintain a second, competing data model in
code.

The application does, however, need runtime information that JSON Schema does
not express, such as component overrides, workflow routes, and permitted
operations. A single schema resolver SHALL derive a consistent runtime model
from the schema and a small amount of application metadata. This runtime model
is a view of the schema, not an alternative source of truth.

The application is intended to run as a client-side web application and, in the
future, as a native application using the same application code and storage
contracts.

### Schema and resolved model

The data structure is defined by the JSON Schema document, currently maintained
in YAML format. It is based on a top-level collection of campaigns containing
nested objects and collections. The nesting depth is not formally limited.

The schema resolver SHALL:

- parse and dereference schema definitions;
- normalize properties, defaults, required fields, titles, and descriptions;
- identify object collections and their item definitions;
- identify entity types and their parent/collection relationships; and
- expose one resolved representation for routing, views, validation, and
  persistence.

Application metadata MAY extend the resolved representation with information
that is not data shape, for example:

- custom view or workflow components;
- route aliases and additional workflow routes;
- permitted create, update, and delete operations; and
- presentation-specific labels or actions.

Such metadata SHALL NOT duplicate the schema's property definitions or
validation rules.

### In-memory data

Pinia SHALL hold the natural nested form of the data. A campaign and its
nested objects and collections are represented as reactive objects, so generic
and custom views can work with the same object graph.

Runtime-only metadata MAY be associated with objects when necessary, but it
SHALL be clearly distinguished from persisted data and SHALL NOT alter the
schema-defined data contract. Prefer store context or repository context over
hidden properties on domain objects.

### Persistence model

The persistence layer SHALL be accessed through repositories. Stores and views
SHALL NOT know the physical database layout.

The initial persistence strategy is normalized storage:

- each persisted object has a stable application-assigned ID and a schema type;
- each object is stored as a separate record;
- nested object collections are represented in storage by child IDs and explicit
  relationship metadata;
- the repository owns flattening before writes and reconstruction after reads;
- the schema resolver determines which properties contain nested objects; and
- database-specific fields are kept separate from the schema-defined payload.

The normalized storage strategy is intentional. It permits independently
updating entities, avoids rewriting large aggregates, and leaves room for later
querying or synchronization. It also means that reconstruction and relationship
integrity are first-class repository responsibilities.

The storage implementation SHALL be replaceable. Browser-local persistence is
required initially; PouchDB or another IndexedDB-backed implementation may be
used behind the repository interfaces. A future online or synchronized backend
must not require changes to the views or domain stores.

### Persistence ordering and integrity

Flattening does not imply that every multi-record operation must be a database
transaction. The repository SHALL enforce the following ordered protocol:

Creating a nested object:

1. Validate and persist the child.
2. Confirm successful persistence.
3. Link the child from the parent in memory.
4. Persist the updated parent.
5. Expose the committed relationship as application state only after the
   required writes have succeeded.

Removing a nested object:

1. Remove the child reference from the parent.
2. Persist the updated parent.
3. Confirm successful persistence.
4. Delete the child record.

If a later step fails, the last successfully persisted graph SHALL remain
readable and valid. An orphaned child or incomplete cleanup is a recoverable
repository condition, not a reason to discard data.

The repository SHALL:

- make operations retryable and idempotent where possible;
- detect and report orphaned records and missing references;
- never silently omit a referenced object during reconstruction;
- prevent links to objects that have not been successfully persisted; and
- use a database transaction when it materially improves consistency and is
  available, without making correctness depend on one particular backend.

Concurrent writers and ambiguous storage failures SHALL be treated as explicit
failure modes. Conflict handling may be limited in the first version, but it
must not silently overwrite data without a defined policy.

### Object identity

IDs SHALL be generated by the application when an object is created. The
database may add revision, timestamp, or synchronization metadata, but it does
not assign or replace the object's identity.

IDs must be stable across saves, reloads, and JSON export/import. Where an
object may be referenced outside its ancestry, its identity SHALL remain stable
and the reference SHALL be represented explicitly.

### Drafts and object lifecycle

Objects are normally created as drafts in the Store or an editor-local draft
state. Defaults MAY be initialized from the schema, but an uncommitted object
MUST NOT be persisted or linked to committed data before explicit confirmation.

One user operation MAY create and commit multiple child objects, for example
when adding a random group from a creature template. Each child SHALL be
validated, persisted, and linked using the normal child-before-parent ordering
rules. If a later child fails to persist, already committed children remain
valid and the error SHALL be reported. The application MAY offer rollback of
the successfully committed children as a recovery action, but rollback is not
required for data integrity.

The lifecycle operations SHALL be distinct:

- `BeginDraft` creates an editable draft;
- `UpdateDraft` changes only the draft;
- `CancelDraft` discards it without persistence; and
- `CommitDraft` validates and persists it before adding or linking it.

Existing committed objects may be edited in a separate update operation. Schema
validation SHALL occur before commit and before persistence of an updated object.
Native HTML form validity is not a substitute for schema validation.

### Object mutation

Once an object is committed, changes made through a view are reflected in the
reactive Store immediately. The Store SHALL queue persistence of the affected
object or aggregate and debounce repeated changes where appropriate.

The Store SHALL not perform flattening itself. It passes the object and its
resolved schema context to the repository, which creates a persistence-safe
representation and applies the ordering rules above.

### Object deletion

Only committed, successfully persisted objects may be deleted. A parent object
must not be deleted while it contains non-empty owned child collections unless
the repository performs an explicitly defined cascade operation.

Removing an owned child from a collection is one Store operation. It updates
the parent relationship first and deletes the child record only after that
update succeeds. Failed cleanup must remain detectable and retryable.

### Turn workflow

The tracker normally creates one ordered `Turn` for each participant present
when a round begins. A participant added while an encounter is running joins at
the next round by default; the DM may explicitly insert a turn into the current
round when appropriate.

`ActiveTurn` identifies the current round and one-based turn number within that
round. Its phase determines whether the tracker presents start-of-turn
checklist entry, action entry, or end-of-turn checklist entry. The identified
turn SHALL have status `active` while `ActiveTurn` is present.

Confirmed checklist tokens SHALL be retained in their checklist and appended to
the parent turn's token list. Completed and skipped turns remain editable only
through an explicit correction operation.

JSON Schema cannot verify these relationships across nested arrays. The Store
and validation layer SHALL enforce them when creating rounds, advancing turns,
adding participants, and restoring an encounter.

### References and external data

The preferred data relationship is ancestry: data on which an object depends
should be contained in that object or one of its ancestors. Cross-references
are allowed when required, but they SHALL be explicit and validated where
possible.

The application ships with read-only D&D data such as a bestiary. This data is
catalog data, not user campaign data. When a catalog entry is used to create an
encounter participant, the relevant values are copied into the participant
instance together with the source ID. Later catalog changes SHALL NOT overwrite
DM-edited instance values.

### Client-side routing

Client-side routing is the basis for navigation. The structural route tree SHALL
be derived recursively from the schema's object collections and relationships.
For example, the schema may produce routes equivalent to:

```text
/campaigns
/campaigns/:campaignId
/campaigns/:campaignId/party
/campaigns/:campaignId/party/:participantId
/campaigns/:campaignId/encounters
/campaigns/:campaignId/encounters/:encounterId
```

Structural routes provide the navigation backbone and fallback
behavior. They do not restrict the application to master-detail navigation.

Breadcrumbs SHALL be derived from the route context and resolved schema
metadata. Workflow routes may be added for a specific entity, for example:

```text
/campaigns/:campaignId/encounters/:encounterId/edit
/campaigns/:campaignId/encounters/:encounterId/track
/campaigns/:campaignId/encounters/:encounterId/print
```

### Generic and custom views

The application provides two reusable generic fallback views:

- `GenericCollectionView` interprets a resolved collection schema and displays,
  creates, and navigates to its items; and
- `GenericDetailView` interprets a resolved entity schema and displays and edits
  its scalar fields and nested collections.

These are reusable schema interpreters, not generated per-entity views.

All production views may eventually be custom-made. A custom view SHALL be able
to replace the generic view for an entity or route without changing the schema,
Store, repository, or structural route machinery. Custom views use the same
resolved model and lifecycle operations as generic views.

The encounter editor, encounter tracker, character sheet, and print views are
expected to be custom views. They remain reachable through and consistent with
the schema-derived navigation backbone.

### Import, export, and synchronization

JSON export and import are explicit application operations. Exported documents
SHALL include a format/schema version, preserve stable IDs, and be validated
before import. Invalid or partially imported data SHALL produce diagnostics;
the importer must not silently discard records.

Online persistence and multi-device synchronization are future possibilities.
Repositories and serialized data should preserve that option, but the first
version need not implement synchronization or conflict resolution.

