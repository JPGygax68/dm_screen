import PouchDB from 'pouchdb';
import findPlugin from 'pouchdb-find';

// Initialize structural plugins securely
PouchDB.plugin(findPlugin);

export interface PouchDoc {
  _id: string;
  _rev?: string;
  type: string;        // The Authoritative JSON Schema Definition Title (e.g. "Campaign")
  id: string;          // The unique 8-character token identifier string
  parentId: string | null;
  parentType: string | null;
  data: Record<string, any>;
  updatedAt: string;
}

export class PouchDbAdapter {
  private db: PouchDB.Database;

  constructor(databaseName: string = 'dm-screen-app-db') {
    this.db = new PouchDB(databaseName);
    this.initializeIndexes();
  }

  /**
   * Initializes declarative optimization indexes inside PouchDB
   * to guarantee fast retrieval queries during relational tree stitching passes.
   */
  private async initializeIndexes(): Promise<void> {
    try {
      await this.db.createIndex({
        index: {
          fields: ['type', 'parentId', 'parentType']
        }
      });
      console.log('PouchDB relational indexing vectors successfully instantiated.');
    } catch (error) {
      console.error('Failed to configure database execution indexes:', error);
    }
  }

  /**
   * FETCH ALL ENTITIES
   * Grabs every single operational tracking record out of the local store.
   * Leveraged by JsonSchemaORM.reconstruct on page refresh to rebuild memory layouts.
   */
  public async getAllEntities(): Promise<any[]> {
    try {
      const response = await this.db.allDocs({
        include_docs: true,
        startkey: '\u0000',
        endkey: '\ufff0'
      });

      // Filter out any internal PouchDB system configuration or index rows
      return response.rows
        .map(row => row.doc)
        .filter(doc => doc && 'type' in doc);
    } catch (error) {
      console.error('Critical breakdown during full database extraction:', error);
      throw error;
    }
  }

  /**
   * SURGICAL ATOMIC ENTITY PERSISTENCE
   * Writes flat documents down to disk using direct mapping keys.
   * Completely decoupled from nested layout parameters or array structure guesswork.
   */
  public async saveEntity(
    entityType: string,
    id: string,
    parentId: string | null = null,
    parentType: string | null = null,
    shallowDataPayload: Record<string, any>
  ): Promise<void> {
    // Generate a deterministic primary key matching our pure schema namespaces
    // e.g. "Campaign:b4da5f9e" or "PlayerCharacter:fa9301bc"
    const docId = `${entityType}:${id}`;

    try {
      let existingDoc: any = null;
      try {
        existingDoc = await this.db.get(docId);
      } catch (getErr: any) {
        if (getErr.status !== 404) throw getErr;
      }

      const updatedDoc: PouchDoc = {
        _id: docId,
        _rev: existingDoc ? existingDoc._rev : undefined,
        type: entityType,
        id: id,
        parentId: parentId,
        parentType: parentType,
        data: shallowDataPayload,
        updatedAt: new Date().toISOString()
      };

      await this.db.put(updatedDoc);
      console.log(`Successfully stored shallow entity database record: [${docId}]`);
    } catch (error) {
      console.error(`Failed to write operational doc instance [${docId}] to storage disk:`, error);
      throw error;
    }
  }

  /**
   * SINGLE ROOT ROW PERSISTENCE
   * Saves distinct, non-array root parameter metrics directly matching schema definitions.
   * This is what manages fields like your top-level "dummy" key property!
   */
  public async saveSingleRootRow(propertyKey: string, payload: any): Promise<void> {
    const docId = `RootProperty:${propertyKey}`;

    try {
      let existingDoc: any = null;
      try {
        existingDoc = await this.db.get(docId);
      } catch (getErr: any) {
        if (getErr.status !== 404) throw getErr;
      }

      const rootDoc = {
        _id: docId,
        _rev: existingDoc ? existingDoc._rev : undefined,
        type: 'RootProperty',
        id: propertyKey,
        parentId: null,
        parentType: null,
        data: typeof payload === 'object' && payload !== null ? payload : { value: payload },
        updatedAt: new Date().toISOString()
      };

      await this.db.put(rootDoc);
      console.log(`Successfully persisted top-level single configuration entry: [${docId}]`);
    } catch (error) {
      console.error(`Failed to commit standalone root data matrix row [${docId}]:`, error);
      throw error;
    }
  }

  /**
   * SURGICAL RECORD EXTINCTION (DELETE PIPELINE)
   * Safely purges an individual flat document block out of the database mapping index.
   */
  public async deleteEntity(entityType: string, id: string): Promise<void> {
    const docId = `${entityType}:${id}`;
    try {
      const activeDoc = await this.db.get(docId);
      await this.db.remove(activeDoc);
      console.log(`Successfully removed entity record from data store partitions: [${docId}]`);
    } catch (error) {
      console.error(`Failed to execute deletion pass on target database doc instance [${docId}]:`, error);
      throw error;
    }
  }
}

// Export a clean instantiation helper to preserve singleton consistency across files
let instance: PouchDbAdapter | null = null;
export function usePouchDbAdapter(): PouchDbAdapter {
  if (!instance) {
    instance = new PouchDbAdapter();
  }
  return instance;
}
