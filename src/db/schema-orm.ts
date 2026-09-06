import { resolveEffectiveSchema } from '@/utils/schema-utils';

export interface FlatPouchDoc {
  _id: string;        // Flat key: "[type]:[8-char-id]" (e.g., "encounter:71a9b234")
  type: string;       // Local entity namespace (e.g., "encounter")
  id: string;         // The local 8-character unique ID
  parentId: string | null;  // Direct parent entity lookup hook 
  parentType: string | null; // Parent namespace context tracer
  data: any;          // Pure primitive attributes only
}

export class JsonSchemaORM {
  private schema: any;

  constructor(schema: any) {
    this.schema = schema;
  }

  /**
   * AUTOMATED FLATTENING
   * Deep-walks your nested JSON tree, decouples the arrays into flat database records,
   * and injects clean, non-brittle single-layer parent references.
   */
  public flatten(rootKey: string, nestedData: any[]): FlatPouchDoc[] {
    const documents: FlatPouchDoc[] = [];
    const rootProp = resolveEffectiveSchema(this.schema.properties[rootKey], this.schema);
    const itemSchema = resolveEffectiveSchema(rootProp.items, this.schema);
    const entityType = itemSchema.title?.toLowerCase() || rootKey.replace(/s$/, '');

    const worker = (
      items: any[], 
      currentType: string, 
      currentSchema: any, 
      parentId: string | null = null,
      parentType: string | null = null
    ) => {
      items.forEach((item: any) => {
        if (!item.id) return;

        // Clone the item to mutate it safely without breaking reactive UI memory references
        const cleanData = { ...item };
        const properties = currentSchema.properties || {};

        // Discover and recurse into nested collections declared by the schema definitions
        Object.keys(properties).forEach(key => {
          const propSchema = resolveEffectiveSchema(properties[key], this.schema);
          
          if (propSchema.type === 'array' && Array.isArray(cleanData[key])) {
            const childItemSchema = resolveEffectiveSchema(propSchema.items, this.schema);
            const childType = childItemSchema.title?.toLowerCase() || key.replace(/s$/, '');

            // Recursively process child blocks, passing the current item's local ID as parentId
            worker(cleanData[key], childType, childItemSchema, String(item.id), currentType);
            
            // Strip the nested collection array to keep the database row lightweight
            delete cleanData[key];
          }
        });

        documents.push({
          _id: `${currentType}:${item.id}`,
          type: currentType,
          id: String(item.id),
          parentId: parentId,
          parentType: parentType,
          data: cleanData
        });
      });
    };

    worker(nestedData, entityType, itemSchema);
    return documents;
  }

  /**
   * AUTOMATED RECONSTRUCTION
   * Takes a completely flat collection of database items and leverages the explicit
   * _parentId properties to stitch together your deeply nested memory tree for Pinia.
   */
  public reconstruct(flatDocs: FlatPouchDoc[]): Record<string, any[]> {
    const hydratedOutput: Record<string, any[]> = {};
    
    // Group records by their target entity types
    const recordsByType = flatDocs.reduce((acc, doc) => {
      if (!acc[doc.type]) acc[doc.type] = [];
      // Enrich the primitive data temporarily with mapping keys for our relational linker pass
      acc[doc.type].push({ 
        ...doc.data, 
        parentId: doc.parentId,
        parentType: doc.parentType
      });
      return acc;
    }, {} as Record<string, any[]>);

    const stitcher = (parentItems: any[], parentSchema: any, parentType: string) => {
      if (!parentSchema.properties) return;

      parentItems.forEach(parent => {
        Object.keys(parentSchema.properties).forEach(key => {
          const propSchema = resolveEffectiveSchema(parentSchema.properties[key], this.schema);
          
          if (propSchema.type === 'array') {
            const childItemSchema = resolveEffectiveSchema(propSchema.items, this.schema);
            const childType = childItemSchema.title?.toLowerCase() || key.replace(/s$/, '');

            // Find all matching child records that explicitly belong to this specific parent ID and type
            const matchedChildren = (recordsByType[childType] || []).filter(
              c => c.parentId === String(parent.id) && c.parentType === parentType
            );

            parent[key] = matchedChildren;

            // Dive deeper down the relational tree branches recursively
            stitcher(matchedChildren, childItemSchema, childType);
          }
        });

        // Clean up the temporary structural linking metadata tracking keys
        delete parent.parentId;
        delete parent.parentType;
      });
    };

    // Initialize reconstruction across every top-level property node in your data schema
    if (this.schema.properties) {
      Object.keys(this.schema.properties).forEach(rootKey => {
        const rootProp = resolveEffectiveSchema(this.schema.properties[rootKey], this.schema);
        if (rootProp.type === 'array') {
          const itemSchema = resolveEffectiveSchema(rootProp.items, this.schema);
          const entityType = itemSchema.title?.toLowerCase() || rootKey.replace(/s$/, '');
          
          // Root level entities have no parent configurations
          const rootItems = (recordsByType[entityType] || []).filter(r => r.parentId === null);
          
          stitcher(rootItems, itemSchema, entityType);
          hydratedOutput[rootKey] = rootItems;
        }
      });
    }

    return hydratedOutput;
  }
}
