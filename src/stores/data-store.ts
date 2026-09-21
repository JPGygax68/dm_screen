import { defineStore } from "pinia";
import { reactive } from "vue";
import { resolveSchema, type ResolvedSchema } from "../domain/schema/schema-resolver.ts";
import { Repository, ROOT_ID, ROOT_TYPE, type ParentRef } from "../domain/persistence/repository.ts";
import { createDraft } from "../domain/persistence/drafts.ts";
import type { StorageAdapter } from "../domain/persistence/storage-adapter.ts";

let repository: Repository | undefined;
let resolvedSchema: ResolvedSchema | undefined;

/** Wires the store to a concrete schema document and storage adapter. Call once at app startup. */
export function configureDataStore(schemaDocument: object, adapter: StorageAdapter): void {
  resolvedSchema = resolveSchema(schemaDocument as Parameters<typeof resolveSchema>[0]);
  repository = new Repository(adapter, resolvedSchema);
}

function requireRepository(): Repository {
  if (!repository) throw new Error("Data store not configured; call configureDataStore() first");
  return repository;
}

function requireSchema(): ResolvedSchema {
  if (!resolvedSchema) throw new Error("Data store not configured; call configureDataStore() first");
  return resolvedSchema;
}

export const useDataStore = defineStore("data", {
  state: () => ({
    /** Root-level entity collections, keyed by schema field name (e.g. "campaigns"). */
    roots: reactive<Record<string, unknown[]>>({}),
    /** In-progress, uncommitted entities, keyed by draft ID. */
    drafts: reactive<Record<string, Record<string, unknown>>>({})
  }),
  actions: {
    async load(): Promise<void> {
      const repo = requireRepository();
      const schema = requireSchema();
      await repo.ensureRoot();
      for (const collection of schema.rootCollections) {
        this.roots[collection.field] = await repo.loadRootCollection(collection.field);
      }
    },

    beginDraft(entityType: string, overrides: Record<string, unknown> = {}): string {
      const draft = createDraft(requireSchema(), entityType, overrides);
      const draftId = draft.id as string;
      this.drafts[draftId] = draft;
      return draftId;
    },

    updateDraft(draftId: string, patch: Record<string, unknown>): void {
      const draft = this.drafts[draftId];
      if (!draft) throw new Error(`Unknown draft "${draftId}"`);
      Object.assign(draft, patch);
    },

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
      parent?: { type: string; id: string; field: string; collection: unknown[] }
    ): Promise<Record<string, unknown>> {
      const draft = this.drafts[draftId];
      if (!draft) throw new Error(`Unknown draft "${draftId}"`);

      const parentRef: ParentRef = parent
        ? { type: parent.type, id: parent.id, field: parent.field }
        : { type: ROOT_TYPE, id: ROOT_ID, field: entityRootField(requireSchema(), entityType) };

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

    /** Removes a committed child from its parent collection and deletes it from storage. */
    async removeChild(
      childType: string,
      childId: string,
      parent: { type: string; id: string; field: string; collection: unknown[] }
    ): Promise<void> {
      await requireRepository().removeChild({ type: parent.type, id: parent.id, field: parent.field }, childType, childId);
      const index = parent.collection.findIndex((item) => (item as { id: string }).id === childId);
      if (index !== -1) parent.collection.splice(index, 1);
    },

    /** Persists in-place edits to an already-committed entity's own fields. */
    async updateEntity(entityType: string, entity: Record<string, unknown>): Promise<void> {
      await requireRepository().updateEntity(entityType, entity);
    }
  }
});

function entityRootField(schema: ResolvedSchema, entityType: string): string {
  const collection = schema.rootCollections.find((candidate) => candidate.entityType === entityType);
  if (!collection) throw new Error(`Entity type "${entityType}" is not a root collection`);
  return collection.field;
}
