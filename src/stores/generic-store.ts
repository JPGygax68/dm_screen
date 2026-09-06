import { defineStore } from 'pinia';
import type { PouchDbAdapter } from '@/db/pouch-adapter';

export interface ParentContext {
  id: string;
  type: string;
  propertyKey: string; // e.g., 'encounters' or 'party'
}

export const createGenericStore = (name: string, schema: any, dbAdapter: PouchDbAdapter) => {
  return defineStore(name, {
    state: () => ({
      // A dynamic, schema-driven dictionary holding our top-level root arrays (e.g., campaigns: [])
      _collections: {} as Record<string, any[]>,
      _activeContexts: {} as Record<string, string | null>
    }),

    actions: {
      async hydrateFromStorage() {
        // This method can be called to re-hydrate the store from PouchDB at any time
        await dbAdapter.hydrateStore(this);
      },
      
      /**
       * HYDRATION ACCESSOR
       * Used by the PouchDB adapter on system startup to inject the stitched nested data tree.
       */
      setItem(rootKey: string, data: any[]) {
        this._collections[rootKey] = data;
      },

      /**
       * GENERIC UPSERT ENGINE
       * Handles both adding brand-new records and updating existing ones at any nesting level.
       */
      async upsertEntity(
        entityType: string,
        record: { id: string;[key: string]: any },
        parentContext?: ParentContext
      ) {
        console.log(`Upserting entity [${entityType}:${record.id}] with parent context:`, parentContext);
        const localType = entityType.toLowerCase();
        const rootKey = parentContext ? this._getRootCollectionKey(localType) : `${localType}s`;

        // Ensure the base runtime array bucket exists
        if (!this._collections[rootKey]) {
          this._collections[rootKey] = [];
        }

        if (!parentContext) {
          // ROOT LAYER MUTATION (e.g., /campaigns)
          const targetArray = this._collections[rootKey];
          const index = targetArray.findIndex(item => String(item.id) === String(record.id));

          if (index !== -1) {
            targetArray[index] = { ...targetArray[index], ...record };
          } else {
            targetArray.push(record);
          }

          // Persist the clean structural change to PouchDB
          await dbAdapter.saveEntity(localType, record.id, null, null, record);
        } else {
          // NESTED SUB-LAYER MUTATION (e.g., campaigns -> c1 -> encounters -> e1)
          const rootArray = this._collections[rootKey];

          // Traverses the nested tree in memory to find the direct parent object
          const parentObj = this._findNestedEntityById(rootArray, parentContext.id, parentContext.type);

          if (parentObj) {
            if (!parentObj[parentContext.propertyKey]) {
              parentObj[parentContext.propertyKey] = [];
            }

            const subArray = parentObj[parentContext.propertyKey] as any[];
            const index = subArray.findIndex(item => String(item.id) === String(record.id));

            if (index !== -1) {
              subArray[index] = { ...subArray[index], ...record };
            } else {
              subArray.push(record);
            }

            // Persist surgically to PouchDB using the flat parent relational mapping keys
            await dbAdapter.saveEntity(localType, record.id, parentContext.id, parentContext.type, record);
          } else {
            console.error(`Failed to resolve parent context [${parentContext.type}:${parentContext.id}] in memory layout.`);
          }
        }
      },

      /**
       * ROUTE CONTEXT TRACKER
       * Tracks which specific items are currently focused in the view layout.
       */
      syncActiveContext(entityType: string, id: string | null) {
        this._activeContexts[entityType.toLowerCase()] = id;
      },

      /**
       * INTERNAL HELPER: RECURSIVE TREE SEARCH
       * Crawls through the nested collection arrays to find an object matching an ID and type.
       */
      _findNestedEntityById(currentScope: any, targetId: string, targetType: string): any | null {
        if (!currentScope) return null;

        if (Array.isArray(currentScope)) {
          for (const item of currentScope) {
            if (String(item.id) === String(targetId)) {
              return item;
            }
            // Recursively search nested object properties
            const found = this._findNestedEntityById(item, targetId, targetType);
            if (found) return found;
          }
        } else if (typeof currentScope === 'object') {
          for (const key of Object.keys(currentScope)) {
            if (Array.isArray(currentScope[key])) {
              const found = this._findNestedEntityById(currentScope[key], targetId, targetType);
              if (found) return found;
            }
          }
        }
        return null;
      },

      /**
       * INTERNAL HELPER: ROOT SCHEMA KEY RESOLVER
       * Dynamically calculates which top-level root store array owns a given nested entity type.
       */
      _getRootCollectionKey(entityType: string): string {
        if (!schema.properties) return `${entityType}s`;

        // Scan the root properties configuration to see where the collection belongs
        for (const rootKey of Object.keys(schema.properties)) {
          const rootProp = schema.properties[rootKey];
          if (rootProp.type === 'array' && JSON.stringify(rootProp).toLowerCase().includes(entityType)) {
            return rootKey;
          }
        }
        return `${entityType}s`;
      }
    }
  });
};
