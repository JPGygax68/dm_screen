// Storage-adapter contract that the normalized repository is built on. Keeping
// this interface small and adapter-agnostic is what lets the backing store be
// swapped (in-memory for tests, PouchDB today, something sync-capable later)
// without any change to the repository, Store, or views.

export interface StoredDoc {
  _id: string;
  _rev?: string;
  /** Resolved-schema entity type name, e.g. "Campaign", or the "Root" pseudo-type. */
  type: string;
  /** Application-assigned global ID (same as the entity's `id` field). */
  entityId: string;
  /** Scalar and embedded (non-entity) property values. */
  data: Record<string, unknown>;
  /** Ordered child entity IDs, keyed by the owning entity-collection property name. */
  children: Record<string, string[]>;
}

export interface StorageAdapter {
  get(docId: string): Promise<StoredDoc | undefined>;
  /** Must throw ConflictError if doc._rev does not match the currently stored revision. */
  put(doc: StoredDoc): Promise<void>;
  remove(docId: string): Promise<void>;
  listByType(type: string): Promise<StoredDoc[]>;
}

/** Thrown by StorageAdapter.put() when doc._rev is stale relative to the stored document. */
export class ConflictError extends Error {
  constructor(docId: string) {
    super(`Storage write conflict on document "${docId}"`);
    this.name = "ConflictError";
  }
}
