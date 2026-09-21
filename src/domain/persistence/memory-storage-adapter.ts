import type { StorageAdapter, StoredDoc } from "./storage-adapter.ts";

/** In-memory StorageAdapter, used by tests and available as a no-persistence fallback. */
export class MemoryStorageAdapter implements StorageAdapter {
  private readonly docs = new Map<string, StoredDoc>();
  private revCounter = 0;

  async get(docId: string): Promise<StoredDoc | undefined> {
    const doc = this.docs.get(docId);
    return doc ? structuredClone(doc) : undefined;
  }

  async put(doc: StoredDoc): Promise<void> {
    this.revCounter += 1;
    this.docs.set(doc._id, structuredClone({ ...doc, _rev: `${this.revCounter}` }));
  }

  async remove(docId: string): Promise<void> {
    this.docs.delete(docId);
  }

  async listByType(type: string): Promise<StoredDoc[]> {
    return [...this.docs.values()].filter((doc) => doc.type === type).map((doc) => structuredClone(doc));
  }
}
