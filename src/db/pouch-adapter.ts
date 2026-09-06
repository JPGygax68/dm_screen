import PouchDB from 'pouchdb';
import { JsonSchemaORM, type FlatPouchDoc } from './schema-orm';
import { toRaw } from 'vue';

export class PouchDbAdapter {
  public db: PouchDB.Database;
  private orm: JsonSchemaORM;

  constructor(schema: any) {
    // Dynamically assign local database name from schema metadata
    const dbName = schema.title?.toLowerCase().replace(/\s+/g, '-') || 'generic-dmscreen-db';
    this.db = new PouchDB(dbName);
    this.orm = new JsonSchemaORM(schema);
  }

  /**
   * FULL DATABASE HYDRATION
   * Reads all flat records from PouchDB, processes them through the schema ORM,
   * and populates your unflattened, nested Pinia store.
   */
  public async hydrateStore(storeInstance: any): Promise<void> {
    try {
      const result = await this.db.allDocs({ include_docs: true });
      const flatDocs = result.rows.map(row => row.doc) as unknown as FlatPouchDoc[];
      console.log('Retrieved flat documents from PouchDB:', flatDocs);

      // Reconstruct the deep, hierarchical object tree automatically
      const nestedStateMap = this.orm.reconstruct(flatDocs);
      console.log('Hydrated nested state map from PouchDB:', nestedStateMap);

      // Hydrate each top-level root collection property into Pinia state arrays
      Object.keys(nestedStateMap).forEach(rootKey => {
        storeInstance.setItem(rootKey, nestedStateMap[rootKey]);
      });
    } catch (err) {
      console.error('Failed to fully hydrate Pinia state tree from PouchDB:', err);
      throw err;
    }
  }

  /**
   * SURGICAL RECORD PERSISTENCE
   * Instantly saves or updates exactly one single record anywhere in your tree.
   * Drops reactivity layers using toRaw() so PouchDB safely receives clean objects.
   */
  public async saveEntity(
    type: string,
    id: string,
    parentId: string | null,
    parentType: string | null,
    dataFields: any
  ): Promise<void> {
    console.log(`Persisting entity [${type}:${id}] with parent context:`, { parentId, parentType });
    const databaseKey = `${type.toLowerCase()}:${id}`;
    const cleanData = JSON.parse(JSON.stringify(toRaw(dataFields)));

    try {
      // Fetch existing row to retrieve PouchDB's mandatory revision hash (_rev)
      const existingDoc = await this.db.get(databaseKey);

      await this.db.put({
        ...existingDoc,
        data: cleanData,
        parentId: parentId,
        parentType: parentType,
        _rev: existingDoc._rev // Crucial to prevent document update conflict exceptions
      });
    } catch (err: any) {
      if (err.status === 404) {
        // Record does not exist yet – perform a clean insertion pass
        const result = await this.db.put({
          _id: databaseKey,
          type: type.toLowerCase(),
          id: String(id),
          parentId: parentId,
          parentType: parentType,
          data: cleanData
        });
      } else {
        throw err;
      }
    }
  }

  /**
   * BULK COLLECTION RESET
   * Flattens and overrides an entire top-level category branch (e.g., all campaigns).
   * Useful during major state overrides, initialization setups, or reset operations.
   */
  public async saveRootCollection(rootKey: string, nestedCollectionArray: any[]): Promise<void> {
    // 1. Compile the deep layout into an array of isolated flat records
    const flatRecords = this.orm.flatten(rootKey, nestedCollectionArray);

    try {
      // 2. Fetch all existing keys belonging to this namespace type to purge stale items
      const targetPrefix = `${rootKey.replace(/s$/, '').toLowerCase()}:`;
      const allCurrentRows = await this.db.allDocs({
        include_docs: true,
        startkey: targetPrefix,
        endkey: `${targetPrefix}\ufff0`
      });

      // Build a map of active new entries to identify what should stay or change
      const newDocsMap = new Map(flatRecords.map(r => [r._id, r]));
      const operations: any[] = [];

      // Flag old database entries that are no longer part of the updated array for deletion
      allCurrentRows.rows.forEach(row => {
        if (!newDocsMap.has(row.id)) {
          operations.push({ _id: row.id, _rev: row.doc?._rev, _deleted: true });
        }
      });

      // Update or add the fresh records while matching up tracking revision tokens safely
      for (const record of flatRecords) {
        const existing = allCurrentRows.rows.find(row => row.id === record._id);
        operations.push({
          ...record,
          _rev: existing?.doc?._rev
        });
      }

      // 3. Commit mutations atomi­cally to PouchDB in a single batch
      if (operations.length > 0) {
        await this.db.bulkDocs(operations);
      }
    } catch (err) {
      console.error(`Bulk collection override failed for root property [${rootKey}]:`, err);
      throw err;
    }
  }
}
