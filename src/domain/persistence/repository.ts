import type { ResolvedSchema } from "../schema/schema-resolver.ts";
import { getEntity } from "../schema/schema-resolver.ts";
import { ConflictError, type StorageAdapter, type StoredDoc } from "./storage-adapter.ts";

/** Pseudo-entity type used to anchor the document root's entity collections (e.g. "campaigns"). */
export const ROOT_TYPE = "Root";
export const ROOT_ID = "root";

export interface ParentRef {
  type: string;
  id: string;
  /** Entity-collection property name on the parent that owns this child. */
  field: string;
}

export interface CleanupOptions {
  /** When false, orphaned documents are removed after the scan. Defaults to true. */
  dryRun?: boolean;
}

export interface CleanupReport {
  orphanedDocumentIds: string[];
  missingReferences: string[];
  deletedDocumentIds: string[];
}

/**
 * Normalized repository: each entity is its own storage record; a parent stores
 * only the ordered list of its children's IDs for each entity-collection field.
 * Callers work with plain nested objects (the Store's "natural nested form");
 * this class owns flattening on write and reconstruction on read.
 */
export class Repository {
  private readonly adapter: StorageAdapter;
  private readonly schema: ResolvedSchema;

  constructor(adapter: StorageAdapter, schema: ResolvedSchema) {
    this.adapter = adapter;
    this.schema = schema;
  }

  private docId(type: string, id: string): string {
    return `${type}:${id}`;
  }

  async ensureRoot(): Promise<void> {
    const existing = await this.adapter.get(this.docId(ROOT_TYPE, ROOT_ID));
    if (existing) return;
    await this.adapter.put({ _id: this.docId(ROOT_TYPE, ROOT_ID), type: ROOT_TYPE, entityId: ROOT_ID, data: {}, children: {} });
  }

  /** Scans normalized records for unreachable documents; deletion is opt-in. */
  async cleanup(options: CleanupOptions = {}): Promise<CleanupReport> {
    const root = await this.adapter.get(this.docId(ROOT_TYPE, ROOT_ID));
    if (!root) throw new Error("Cannot clean up without a persisted root document");

    const documents = new Map<string, StoredDoc>([[root._id, root]]);
    for (const entity of this.schema.entities.values()) {
      for (const doc of await this.adapter.listByType(entity.name)) {
        documents.set(doc._id, doc);
      }
    }

    const reachable = new Set<string>([root._id]);
    const missingReferences: string[] = [];
    const visit = (doc: StoredDoc): void => {
      const entity = doc.type === ROOT_TYPE ? undefined : getEntity(this.schema, doc.type);
      const collectionProperties = entity?.properties.filter((property) => property.isEntityCollection) ??
        this.schema.rootCollections.map((collection) => ({ name: collection.field, entityType: collection.entityType }));

      for (const property of collectionProperties) {
        if (!property.entityType) {
          throw new Error(`Entity collection "${property.name}" has no entity type`);
        }
        for (const childId of doc.children[property.name] ?? []) {
          const childDocId = this.docId(property.entityType, childId);
          const child = documents.get(childDocId);
          if (!child) {
            missingReferences.push(`${doc._id} -> ${childDocId}`);
          } else if (!reachable.has(childDocId)) {
            reachable.add(childDocId);
            visit(child);
          }
        }
      }
    };

    visit(root);

    const orphanedDocumentIds = [...documents.keys()].filter((docId) => !reachable.has(docId));
    const deletedDocumentIds: string[] = [];
    if (options.dryRun === false) {
      for (const docId of orphanedDocumentIds) {
        await this.adapter.remove(docId);
        deletedDocumentIds.push(docId);
      }
    }

    return { orphanedDocumentIds, missingReferences, deletedDocumentIds };
  }

  /** Reconstructs the full nested tree for one root-level entity-collection field. */
  async loadRootCollection(field: string): Promise<unknown[]> {
    const rootCollection = this.schema.rootCollections.find((collection) => collection.field === field);
    if (!rootCollection) throw new Error(`Unknown root collection "${field}"`);
    const rootDoc = await this.requireDoc(ROOT_TYPE, ROOT_ID);
    const ids = rootDoc.children[field] ?? [];
    return Promise.all(ids.map((id) => this.reconstruct(rootCollection.entityType, id)));
  }

  async reconstruct(type: string, id: string): Promise<Record<string, unknown>> {
    const doc = await this.requireDoc(type, id);
    return this.reconstructFromDoc(doc);
  }

  private async reconstructFromDoc(doc: StoredDoc): Promise<Record<string, unknown>> {
    const entity = getEntity(this.schema, doc.type);
    const obj: Record<string, unknown> = { ...doc.data, id: doc.entityId };
    for (const property of entity.properties) {
      if (!property.isEntityCollection) continue;
      const childIds = doc.children[property.name] ?? [];
      obj[property.name] = await Promise.all(
        childIds.map(async (childId) => this.reconstructFromDoc(await this.requireDoc(property.entityType!, childId)))
      );
    }
    return obj;
  }

  /** Validates and persists a new entity (and any nested entities it already contains), then links it to its parent. */
  async createEntity(type: string, obj: Record<string, unknown>, parent: ParentRef): Promise<void> {
    await this.persistBranch(type, obj);
    await this.linkChild(parent, obj.id as string);
  }

  /** Persists changes to an entity's own scalar/embedded fields. Does not alter child linkage. */
  async updateEntity(type: string, obj: Record<string, unknown>): Promise<void> {
    await this.upsert(this.flatten(type, obj));
  }

  /** Unlinks a child from its parent, then deletes the child (and its descendants). */
  async removeChild(parent: ParentRef, childType: string, childId: string): Promise<void> {
    await this.withConflictRetry(async () => {
      const parentDoc = await this.requireDoc(parent.type, parent.id);
      const list = (parentDoc.children[parent.field] ?? []).filter((id) => id !== childId);
      await this.adapter.put({ ...parentDoc, children: { ...parentDoc.children, [parent.field]: list } });
    });
    await this.deleteBranch(childType, childId);
  }

  private async persistBranch(type: string, obj: Record<string, unknown>): Promise<void> {
    const entity = getEntity(this.schema, type);
    for (const property of entity.properties) {
      if (!property.isEntityCollection) continue;
      const children = (obj[property.name] as Record<string, unknown>[] | undefined) ?? [];
      for (const child of children) {
        await this.persistBranch(property.entityType!, child);
      }
    }
    await this.upsert(this.flatten(type, obj));
  }

  private async deleteBranch(type: string, id: string): Promise<void> {
    const doc = await this.adapter.get(this.docId(type, id));
    if (!doc) return;
    const entity = getEntity(this.schema, type);
    for (const property of entity.properties) {
      if (!property.isEntityCollection) continue;
      for (const childId of doc.children[property.name] ?? []) {
        await this.deleteBranch(property.entityType!, childId);
      }
    }
    await this.adapter.remove(doc._id);
  }

  private flatten(type: string, obj: Record<string, unknown>): StoredDoc {
    const entity = getEntity(this.schema, type);
    const data: Record<string, unknown> = {};
    const children: Record<string, string[]> = {};

    for (const property of entity.properties) {
      if (property.name === "id") continue;
      const value = obj[property.name];
      if (property.isEntityCollection) {
        children[property.name] = ((value as { id: string }[] | undefined) ?? []).map((child) => child.id);
      } else if (value !== undefined) {
        data[property.name] = value;
      }
    }

    return { _id: this.docId(type, obj.id as string), type, entityId: obj.id as string, data, children };
  }

  private async linkChild(parent: ParentRef, childId: string): Promise<void> {
    await this.withConflictRetry(async () => {
      const parentDoc = await this.requireDoc(parent.type, parent.id);
      const list = parentDoc.children[parent.field] ?? [];
      if (!list.includes(childId)) list.push(childId);
      await this.adapter.put({ ...parentDoc, children: { ...parentDoc.children, [parent.field]: list } });
    });
  }

  /**
   * Persists a document, retrying against the latest stored revision on conflict.
   * For a plain entity upsert this is last-write-wins on that entity's own fields;
   * for parent linkage (children ID lists) the caller recomputes the list against
   * the freshly re-read document, so concurrent additions/removals are not lost.
   */
  private async withConflictRetry(operation: () => Promise<void>, attempts = 5): Promise<void> {
    for (let attempt = 1; ; attempt += 1) {
      try {
        await operation();
        return;
      } catch (error) {
        if (!(error instanceof ConflictError) || attempt >= attempts) throw error;
      }
    }
  }

  private async upsert(doc: StoredDoc): Promise<void> {
    await this.withConflictRetry(async () => {
      const existing = await this.adapter.get(doc._id);
      await this.adapter.put(existing ? { ...doc, _rev: existing._rev } : doc);
    });
  }

  private async requireDoc(type: string, id: string): Promise<StoredDoc> {
    const doc = await this.adapter.get(this.docId(type, id));
    if (!doc) throw new Error(`Missing record ${type}:${id}`);
    return doc;
  }
}
