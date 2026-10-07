import { defineStore } from "pinia";
import {
  resolveSchema,
  type ResolvedSchema,
} from "../domain/schema/schema-resolver.ts";
import {
  Repository,
  ROOT_ID,
  ROOT_TYPE,
  type ParentRef,
} from "../domain/persistence/repository.ts";
import { createDraft } from "../domain/persistence/drafts.ts";
import type { StorageAdapter } from "../domain/persistence/storage-adapter.ts";
import {
  createEntityValidators,
  EntityValidationError,
  type EntityValidator,
} from "../domain/validation/entity-validator.ts";

let repository: Repository | undefined;
let resolvedSchema: ResolvedSchema | undefined;
let entityValidators = new Map<string, EntityValidator>();

/** Wires the store to a concrete schema document and storage adapter. Call once at app startup. 
 * @param schemaDocument The schema document describing the structure of entities.
 * @param adapter The storage adapter to use for persisting entities.
*/
export function configureDataStore(
  schemaDocument: object,
  adapter: StorageAdapter,
): void {
  resolvedSchema = resolveSchema(
    schemaDocument as Parameters<typeof resolveSchema>[0],
  );
  entityValidators = createEntityValidators(
    schemaDocument,
    resolvedSchema.entities.keys(),
  );
  repository = new Repository(adapter, resolvedSchema);
}

function requireRepository(): Repository {
  if (!repository)
    throw new Error(
      "Data store not configured; call configureDataStore() first",
    );
  return repository;
}

function requireSchema(): ResolvedSchema {
  if (!resolvedSchema)
    throw new Error(
      "Data store not configured; call configureDataStore() first",
    );
  return resolvedSchema;
}

function validateEntity(entityType: string, value: unknown): void {
  const validator = entityValidators.get(entityType);
  if (!validator)
    throw new Error(
      `No schema validator configured for entity type "${entityType}"`,
    );
  const issues = validator(value);
  if (issues.length) throw new EntityValidationError(entityType, issues);
}

/**
 * Pinia store for managing application data, including root-level collections and in-progress drafts.
 */
export const useDataStore = defineStore("data", {
  state: () => ({
    /** Root-level entity collections, keyed by schema field name (e.g. "campaigns"). */
    roots: {} as Record<string, unknown[]>,
    /** In-progress, uncommitted entities, keyed by draft ID. */
    drafts: {} as Record<string, Record<string, unknown>>,
  }),
  actions: {
    /**
     * Loads all root-level collections from the repository into the store.
     */
    async load(): Promise<void> {
      const repo = requireRepository();
      const schema = requireSchema();
      await repo.ensureRoot();
      for (const collection of schema.rootCollections) {
        this.roots[collection.field] = await repo.loadRootCollection(
          collection.field,
        );
      }
    },

    /**
     * Begins a new draft for the specified entity type, optionally overriding default values.
     * @param entityType The type of entity to draft.
     * @param overrides Initial values to override in the draft.
     * @returns The ID of the newly created draft.
     */
    beginDraft(
      entityType: string,
      overrides: Record<string, unknown> = {},
    ): string {
      const draft = createDraft(requireSchema(), entityType, overrides);
      const draftId = draft.id as string;
      this.drafts[draftId] = draft;
      return draftId;
    },

    /**
     * Updates an in-progress draft with the specified changes.
     * @param draftId The ID of the draft to update.
     * @param patch The changes to apply to the draft.
     */
    updateDraft(draftId: string, patch: Record<string, unknown>): void {
      const draft = this.drafts[draftId];
      if (!draft) throw new Error(`Unknown draft "${draftId}"`);
      Object.assign(draft, patch);
    },

    /**
     * Cancels an in-progress draft, discarding any changes.
     * @param draftId The ID of the draft to cancel.
     */
    cancelDraft(draftId: string): void {
      delete this.drafts[draftId];
    },

    /**
     * Commits a draft as a new entity, linking it either to a root collection field
     * (parent undefined) or as a child of an already-committed entity.
     */
    async commitDraft(
      draftId: string,
      entityType: string,
      parent?: {
        type: string;
        id: string;
        field: string;
        collection: unknown[];
      },
    ): Promise<Record<string, unknown>> {
      const draft = this.drafts[draftId];
      if (!draft) throw new Error(`Unknown draft "${draftId}"`);

      const parentRef: ParentRef = parent
        ? { type: parent.type, id: parent.id, field: parent.field }
        : {
            type: ROOT_TYPE,
            id: ROOT_ID,
            field: entityRootField(requireSchema(), entityType),
          };

      validateEntity(entityType, draft);
      await requireRepository().createEntity(entityType, draft, parentRef);

      if (parent) {
        parent.collection.push(draft);
      } else {
        const field = parentRef.field;
        this.roots[field] = [...(this.roots[field] ?? []), draft];
      }

      delete this.drafts[draftId];
      return draft;
    },

    /** Removes a committed child from its parent collection and deletes it from storage. 
     * @param childType The type of the child entity to remove.
     * @param childId The ID of the child entity to remove.
     * @param parent The parent entity containing the child.
    */
    async removeChild(
      childType: string,
      childId: string,
      parent: {
        type: string;
        id: string;
        field: string;
        collection: unknown[];
      },
    ): Promise<void> {
      await requireRepository().removeChild(
        { type: parent.type, id: parent.id, field: parent.field },
        childType,
        childId,
      );
      const index = parent.collection.findIndex(
        (item) => (item as { id: string }).id === childId,
      );
      if (index !== -1) parent.collection.splice(index, 1);
    },

    /** Persists in-place edits to an already-committed entity's own fields. */
    async updateEntity(
      entityType: string,
      entity: Record<string, unknown>,
    ): Promise<void> {
      validateEntity(entityType, entity);
      await requireRepository().updateEntity(entityType, entity);
    },
  },
});

function entityRootField(schema: ResolvedSchema, entityType: string): string {
  const collection = schema.rootCollections.find(
    (candidate) => candidate.entityType === entityType,
  );
  if (!collection)
    throw new Error(`Entity type "${entityType}" is not a root collection`);
  return collection.field;
}
