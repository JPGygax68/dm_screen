import { resolveEffectiveSchema } from '@/utils/schema-utils';
import dataSchema from '@/generated/models/data.schema.json';

/**
 * RECONSTRUCTION ENGINE (HYDRATION)
 * Automatically structures flat database documents back into a unified, reactive 
 * nested memory tree, injecting invisible metadata tags for frictionless O(1) trackability.
 */
export class JsonSchemaORM {
  private schema: any;

  constructor() {
    this.schema = dataSchema;
  }

  /**
   * Helper to stamp hidden, read-only tracking metadata onto an object frame.
   * Properties are marked enumerable: false so they never leak into JSON operations,
   * form fields, or automated document serialization streams.
   */
  private stampMetadata(
    target: any,
    schemaType: string,
    parentId: string | null = null,
    parentType: string | null = null,
    arrayPropertyName: string | null = null
  ): void {
    if (!target || typeof target !== 'object') return;

    Object.defineProperties(target, {
      __schemaType: { value: schemaType, writable: false, enumerable: false, configurable: true },
      __parentId: { value: parentId, writable: false, enumerable: false, configurable: true },
      __parentType: { value: parentType, writable: false, enumerable: false, configurable: true },
      __arrayPropertyName: { value: arrayPropertyName, writable: false, enumerable: false, configurable: true }
    });
  }

  /**
   * Hydrates flat PouchDB records into the Pinia runtime store object layout.
   * Scans root definitions to parse top-level properties (arrays, primitives, settings objects)
   * and recursively stitches child objects into their respective structural sub-arrays.
   */
  public reconstruct(flatDocs: any[]): Record<string, any> {
    const rootState: Record<string, any> = {};
    const rootProps = this.schema.properties || {};

    // 1. Pre-initialize the Store Root Layout to mirror the JSON Schema definitions completely
    Object.keys(rootProps).forEach((key) => {
      const propSchema = resolveEffectiveSchema(rootProps[key], this.schema);
      rootState[key] = propSchema.type === 'array' ? [] : (propSchema.default ?? null);
    });

    // 2. Identify the active structural mappings of our types
    // Group child documents by parent identifiers to allow efficient O(N) stitching loops
    const parentMap: Record<string, any[]> = {};
    const rootItems: any[] = [];

    flatDocs.forEach((doc) => {
      const dataPayload = { ...doc.data, id: doc.id };

      if (doc.parentId) {
        const structuralKey = `${doc.parentType}:${doc.parentId}`;
        if (!parentMap[structuralKey]) parentMap[structuralKey] = [];
        parentMap[structuralKey].push({ doc, payload: dataPayload });
      } else {
        rootItems.push({ doc, payload: dataPayload });
      }
    });

    // 3. Hydrate the Root Elements first
    rootItems.forEach(({ doc, payload }) => {
      // Locate which top-level root schema property matches this record's type signature
      const matchedRootKey = Object.keys(rootProps).find((key) => {
        const propSchema = resolveEffectiveSchema(rootProps[key], this.schema);
        if (propSchema.type === 'array') {
          return resolveEffectiveSchema(propSchema.items, this.schema).title === doc.type;
        }
        return key === doc.id; // Fallback for single top-level primitive configuration rows
      });

      if (!matchedRootKey) return;

      const propSchema = resolveEffectiveSchema(rootProps[matchedRootKey], this.schema);

      if (propSchema.type === 'array') {
        // Stamp hidden properties specifying this item lives at the database root
        this.stampMetadata(payload, doc.type, null, null, matchedRootKey);
        rootState[matchedRootKey].push(payload);
        // Recursively search and attach child objects nested underneath this row
        this.hydrateChildren(payload, doc.type, doc.id, parentMap);
      } else {
        // It's a non-array root parameter (like your "dummy" field)
        this.stampMetadata(payload, 'RootProperty', null, null, null);
        rootState[matchedRootKey] = payload;
      }
    });

    return rootState;
  }

  /**
   * Recursive tree scanner that mounts child elements onto their live reactive arrays.
   */
  private hydrateChildren(
    parentPayload: any,
    parentType: string,
    parentId: string,
    parentMap: Record<string, any[]>
  ): void {
    const parentLookupKey = `${parentType}:${parentId}`;
    const childrenToStitch = parentMap[parentLookupKey] || [];
    if (childrenToStitch.length === 0) return;

    // Retrieve the schema properties map for this specific entity block type
    const defsMap = this.schema.$defs || {};
    const entityDef = resolveEffectiveSchema(defsMap[parentType], this.schema);
    const properties = entityDef.properties || {};

    childrenToStitch.forEach(({ doc, payload }) => {
      // Discover which internal sub-array property name maps to this child's data type
      const targetArrayKey = Object.keys(properties).find((key) => {
        const childProp = resolveEffectiveSchema(properties[key], this.schema);
        return childProp.type === 'array' && resolveEffectiveSchema(childProp.items, this.schema).title === doc.type;
      });

      if (!targetArrayKey) return;

      if (!parentPayload[targetArrayKey]) {
        parentPayload[targetArrayKey] = [];
      }

      // Stamp the immutable hidden metadata context variables securely
      this.stampMetadata(payload, doc.type, parentId, parentType, targetArrayKey);
      parentPayload[targetArrayKey].push(payload);

      // Descend deeper into the data layout tree recursively
      this.hydrateChildren(payload, doc.type, doc.id, parentMap);
    });
  }

  /**
   * FLATTENING ENGINE (SERIALIZATION PREPARATION)
   * Clones a mutated object from memory and strips out its nested sub-collections
   * to guarantee the database write remains completely shallow and atomic.
   */
  public flattenShallowRecord(mutatedRecord: any): any {
    if (!mutatedRecord) return null;

    // 1. Read hidden metadata signatures instantly in O(1) time
    const entityType = mutatedRecord.__schemaType;
    if (!entityType) {
      console.warn("Object lacks tracking metadata. Running raw fallback extraction pass.");
      return { ...mutatedRecord };
    }

    // 2. Create an isolated surface copy so we never interfere with Vue's live reactive tree paths
    const cleanPayload = { ...mutatedRecord };

    // 3. Query the Schema definitions to discover what properties represent complex branches
    const defsMap = this.schema.$defs || {};
    const rootProps = this.schema.properties || {};

    let propertiesMap: Record<string, any> = {};

    if (defsMap[entityType]) {
      propertiesMap = resolveEffectiveSchema(defsMap[entityType], this.schema).properties || {};
    } else if (rootProps[mutatedRecord.__arrayPropertyName || '']) {
      // Fallback alignment check for top-level records if needed
      const rootProp = resolveEffectiveSchema(rootProps[mutatedRecord.__arrayPropertyName || ''], this.schema);
      propertiesMap = resolveEffectiveSchema(rootProp.items, this.schema).properties || {};
    }

    // 4. Scrub complex sub-arrays out of the transaction footprint entirely
    Object.keys(propertiesMap).forEach((key) => {
      const propSchema = resolveEffectiveSchema(propertiesMap[key], this.schema);
      if (propSchema.type === 'array' || propSchema['$ref']) {
        delete cleanPayload[key];
      }
    });

    return cleanPayload;
  }
}
