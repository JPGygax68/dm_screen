import PouchDB from "pouchdb";
import type { StorageAdapter, StoredDoc } from "./storage-adapter.ts";

/** PouchDB-backed StorageAdapter: the initial browser-local persistence implementation. */
export class PouchDbStorageAdapter implements StorageAdapter {
  private readonly db: PouchDB.Database<StoredDoc>;

  constructor(databaseName = "dm-screen") {
    this.db = new PouchDB<StoredDoc>(databaseName);
  }

  async get(docId: string): Promise<StoredDoc | undefined> {
    try {
      return await this.db.get(docId);
    } catch (error) {
      if (isNotFound(error)) return undefined;
      throw error;
    }
  }

  async put(doc: StoredDoc): Promise<void> {
    await this.db.put(doc);
  }

  async remove(docId: string): Promise<void> {
    const doc = await this.get(docId);
    if (!doc) return;
    await this.db.remove(doc._id, doc._rev!);
  }

  async listByType(type: string): Promise<StoredDoc[]> {
    const result = await this.db.allDocs({
      include_docs: true,
      startkey: `${type}:`,
      endkey: `${type}:\ufff0`
    });
    return result.rows.map((row) => row.doc!).filter((doc): doc is StoredDoc => Boolean(doc));
  }

  /** Test/dev helper: irreversibly deletes the underlying database. */
  async destroy(): Promise<void> {
    await this.db.destroy();
  }
}

function isNotFound(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { status?: number }).status === 404;
}
