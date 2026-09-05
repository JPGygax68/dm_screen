import { defineStore } from 'pinia';
import { resolveEffectiveSchema } from '@/utils/schema-utils';

/**
 * Universal JSON Schema Runtime State Factory
 */
export function createGenericStore(schema: any, persistenceAdapter: any) {
  // TODO: make name overridable via schema metadata, or via parameter?
  return defineStore('generic-store', {
    state: () => {
      const initialState: Record<string, any> = {};

      if (schema.properties) {
        Object.keys(schema.properties).forEach(key => {
          const rawProperty = schema.properties[key];
          
          // Fully evaluate the property's type through its true reference tree
          const effectiveProp = resolveEffectiveSchema(rawProperty, schema);

          // Instantiate precise initial data footprints based on valid schema types
          if (effectiveProp.type === 'array') {
            initialState[key] = [];
          } else if (effectiveProp.type === 'object') {
            // Check for a declared default object layout, otherwise fallback empty
            initialState[key] = effectiveProp.default !== undefined 
              ? JSON.parse(JSON.stringify(effectiveProp.default)) 
              : {};
          } else {
            // Primitive types (string, integer, boolean, null)
            initialState[key] = effectiveProp.default !== undefined 
              ? effectiveProp.default 
              : null;
          }
        });
      }

      // Operational navigation registry
      initialState._activeContexts = {} as Record<string, string | null>;

      return initialState;
    },

    actions: {
      setItem(collectionKey: string, payload: any[]) {
        this[collectionKey] = payload;
      },

      upsertEntity(collectionKey: string, entity: { id: string }, parentContext?: { key: string, id: string }) {
        if (this[collectionKey] === undefined) return;

        if (!parentContext) {
          const idx = this[collectionKey].findIndex((item: any) => item.id === entity.id);
          if (idx !== -1) {
            this[collectionKey][idx] = { ...this[collectionKey][idx], ...entity };
          } else {
            this[collectionKey].push(entity);
          }
        } else {
          const parentIdx = this[collectionKey].findIndex((item: any) => item.id === parentContext.id);
          if (parentIdx !== -1) {
            const parent = this[collectionKey][parentIdx];
            if (!parent[parentContext.key]) parent[parentContext.key] = [];
            
            const childIdx = parent[parentContext.key].findIndex((c: any) => c.id === entity.id);
            if (childIdx !== -1) {
              parent[parentContext.key][childIdx] = { ...parent[parentContext.key][childIdx], ...entity };
            } else {
              parent[parentContext.key].push(entity);
            }
          }
        }
        
        persistenceAdapter.save(collectionKey, this[collectionKey]);
      },

      syncActiveContext(entityType: string, id: string | null) {
        this._activeContexts[entityType] = id;
      }
    }
  });
}
