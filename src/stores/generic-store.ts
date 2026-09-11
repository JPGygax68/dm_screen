import { defineStore } from 'pinia';
import dataSchema from '@/generated/models/data.schema.json';
import { resolveEffectiveSchema } from '@/utils/schema-utils';
import { JsonSchemaORM } from '@/db/schema-orm';
import { usePouchDbAdapter } from '@/db/pouch-adapter';

const orm = new JsonSchemaORM();

export interface ActiveContext {
  id: string;
  type: string; // The pure, unchanged schema title of the parent container entity (e.g. "Campaign")
}

export const useDmScreenStore = defineStore('dmscreen-store', {
  /**
   * PURE SCHEMA-DRIVEN ROOT STATE
   * Dynamically inspects the data model layout definitions on boot.
   * Maps arrays to [] and non-array configurations (like your "dummy" field) to defaults.
   */
  state: () => {
    const initialState: Record<string, any> = {};

    if (dataSchema.properties) {
      Object.keys(dataSchema.properties).forEach((key) => {
        const propSchema = resolveEffectiveSchema((dataSchema.properties as any)[key], dataSchema);
        initialState[key] = propSchema.type === 'array' ? [] : (propSchema.default ?? null);
      });
    }

    return initialState;
  },

  actions: {
    /**
     * SYSTEM REBOOT LIFECYCLE RECONSTRUCTOR
     * Fires automatically on application initialization to fetch flat PouchDB rows,
     * weave them into a nested object graph, and inject non-enumerable tracking variables.
     */
    async loadDatabaseIntoStore() {
      try {
        const dbAdapter = usePouchDbAdapter();
        
        // 1. Fetch raw un-nested records from local storage
        const rawFlatDocuments = await dbAdapter.getAllEntities();
        console.log('Raw database docs recovered on boot:', rawFlatDocuments);

        // 2. Process documents through the ORM stitching matrix to generate a nested memory tree
        const fullyHydratedStateTree = orm.reconstruct(rawFlatDocuments);

        // 3. Mount properties directly onto the root reactive state layer
        Object.keys(fullyHydratedStateTree).forEach((rootPropertyKey) => {
          this[rootPropertyKey] = fullyHydratedStateTree[rootPropertyKey];
        });

        console.log('Reactive store state tree successfully synchronized from disk:', this.$state);
      } catch (error) {
        console.error('Critical breakdown encountered during database initialization lifecycle:', error);
      }
    },

    /**
     * UNIFIED METADATA-DRIVEN ELEMENT PERSISTENCE
     * Accepts shallow leaf mutations directly from view forms.
     * Extracts non-enumerable metadata to update local paths and stream records down to disk.
     */
    async persistEntity(mutatedRecord: any) {
      try {
        const dbAdapter = usePouchDbAdapter();

        // 1. Instantly read hidden context variables in O(1) time
        const entityType = mutatedRecord.__schemaType;
        const parentId = mutatedRecord.__parentId;
        const parentType = mutatedRecord.__parentType;

        if (!entityType) {
          console.error('Aborting transaction. Given object context lacks hidden tracking metadata signatures.');
          return;
        }

        // 2. Run the object payload through the ORM tool to extract a shallow copy stripped of arrays
        const shallowDatabasePayload = orm.flattenShallowRecord(mutatedRecord);

        // 3. Commit cleanly to the flat database sequence partition
        await dbAdapter.saveEntity(
          entityType,
          mutatedRecord.id,
          parentId,
          parentType,
          shallowDatabasePayload
        );
        
        console.log(`Surgically synchronized shallow database row: [${entityType}:${mutatedRecord.id}]`);
      } catch (error) {
        console.error(`Failed to commit active object mutation to persistent storage layers:`, error);
      }
    }
  }
});
