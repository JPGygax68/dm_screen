// Derives a runtime model (entity types, their properties, and entity-collection
// relationships) from the DM Screen JSON Schema. This is a view over the schema,
// not a second source of truth: property shape, defaults, and required fields are
// all read directly from the schema document.

export interface ResolvedProperty {
  name: string;
  schema: JsonSchema;
  required: boolean;
  default?: unknown;
  /** True if this is an array of references to another entity type (normalized on persist). */
  isEntityCollection: boolean;
  /** Entity type name of the array items, when isEntityCollection is true. */
  entityType?: string;
}

export interface ResolvedEntity {
  name: string;
  properties: ResolvedProperty[];
}

export interface RootCollection {
  /** Property name on the document root, e.g. "campaigns". */
  field: string;
  entityType: string;
}

export interface ResolvedSchema {
  entities: Map<string, ResolvedEntity>;
  rootCollections: RootCollection[];
}

// Minimal shape of the subset of JSON Schema this resolver understands.
export interface JsonSchema {
  $ref?: string;
  type?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  default?: unknown;
  [key: string]: unknown;
}

interface RootDocumentSchema extends JsonSchema {
  "$defs"?: Record<string, JsonSchema>;
}

const GLOBAL_ID_REF = "#/$defs/GlobalId";

export function resolveSchema(schema: RootDocumentSchema): ResolvedSchema {
  const defs = schema["$defs"] ?? {};

  const deref = (node: JsonSchema | undefined): JsonSchema | undefined => {
    let current = node;
    while (current?.$ref) {
      const name = current.$ref.replace("#/$defs/", "");
      current = defs[name];
    }
    return current;
  };

  const isEntityDef = (defName: string): boolean => {
    const def = defs[defName];
    const idProperty = def?.properties?.id;
    return idProperty?.$ref === GLOBAL_ID_REF;
  };

  const entities = new Map<string, ResolvedEntity>();

  for (const [defName, def] of Object.entries(defs)) {
    if (!isEntityDef(defName)) continue;

    const requiredFields = new Set(def.required ?? []);
    const properties: ResolvedProperty[] = Object.entries(def.properties ?? {}).map(([propName, propSchema]) => {
      const resolvedPropSchema = deref(propSchema) ?? propSchema;
      const items = resolvedPropSchema.type === "array" ? deref(resolvedPropSchema.items) : undefined;
      const itemsRefName = resolvedPropSchema.items?.$ref?.replace("#/$defs/", "");
      const isEntityCollection = Boolean(
        resolvedPropSchema.type === "array" && itemsRefName && isEntityDef(itemsRefName)
      );

      return {
        name: propName,
        schema: resolvedPropSchema,
        required: requiredFields.has(propName),
        default: resolvedPropSchema.default,
        isEntityCollection,
        entityType: isEntityCollection ? itemsRefName : undefined
      } satisfies ResolvedProperty;
    });

    entities.set(defName, { name: defName, properties });
  }

  const rootCollections: RootCollection[] = Object.entries(schema.properties ?? {}).flatMap(([field, propSchema]) => {
    const resolved = deref(propSchema);
    const itemsRefName = resolved?.items?.$ref?.replace("#/$defs/", "");
    if (resolved?.type === "array" && itemsRefName && isEntityDef(itemsRefName)) {
      return [{ field, entityType: itemsRefName }];
    }
    return [];
  });

  return { entities, rootCollections };
}

export function getEntity(schema: ResolvedSchema, entityType: string): ResolvedEntity {
  const entity = schema.entities.get(entityType);
  if (!entity) throw new Error(`Unknown entity type "${entityType}"`);
  return entity;
}
