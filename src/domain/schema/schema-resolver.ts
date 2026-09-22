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
const LOCAL_DEF_REF = /^#\/\$defs\/([^/]+)$/;

interface ResolvedReference {
  schema: JsonSchema;
  definitionName?: string;
}

export function resolveSchema(schema: RootDocumentSchema): ResolvedSchema {
  const defs = schema["$defs"] ?? {};

  const deref = (node: JsonSchema | undefined, trail: string[] = []): ResolvedReference | undefined => {
    if (!node?.$ref) return node ? { schema: node } : undefined;

    const match = LOCAL_DEF_REF.exec(node.$ref);
    if (!match) {
      throw new Error(`Unsupported schema reference "${node.$ref}"; only local #/$defs references are supported`);
    }

    const name = match[1];
    if (trail.includes(name)) {
      throw new Error(`Cyclic schema reference: ${[...trail, name].join(" -> ")}`);
    }

    const target = defs[name];
    if (!target) {
      throw new Error(`Schema reference "${node.$ref}" does not resolve to a definition`);
    }

    const resolvedTarget = deref(target, [...trail, name])!;
    const { $ref: _ignoredRef, ...siblings } = node;
    return {
      schema: { ...resolvedTarget.schema, ...siblings },
      definitionName: resolvedTarget.definitionName ?? name
    };
  };

  const isEntityDef = (defName: string): boolean => {
    const def = deref(defs[defName])?.schema;
    const idProperty = deref(def?.properties?.id);
    return idProperty?.definitionName === "GlobalId" || idProperty?.schema.$ref === GLOBAL_ID_REF;
  };

  const entities = new Map<string, ResolvedEntity>();

  for (const [defName, def] of Object.entries(defs)) {
    if (!isEntityDef(defName)) continue;

    const resolvedDef = deref(def)?.schema ?? def;
    const requiredFields = new Set(resolvedDef.required ?? []);
    const properties: ResolvedProperty[] = Object.entries(resolvedDef.properties ?? {}).map(([propName, propSchema]) => {
      const resolvedPropSchema = deref(propSchema)?.schema ?? propSchema;
      const items = resolvedPropSchema.type === "array" ? deref(resolvedPropSchema.items) : undefined;
      const itemsRefName = items?.definitionName;
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
    const resolved = deref(propSchema)?.schema;
    const itemsRefName = resolved?.type === "array" ? deref(resolved.items)?.definitionName : undefined;
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
