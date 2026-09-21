import type { ResolvedSchema } from "../schema/schema-resolver.ts";
import { getEntity } from "../schema/schema-resolver.ts";

/** Builds a new draft object for an entity type, seeded from schema defaults and an assigned ID. */
export function createDraft(
  schema: ResolvedSchema,
  entityType: string,
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  const entity = getEntity(schema, entityType);
  const draft: Record<string, unknown> = { id: crypto.randomUUID() };

  for (const property of entity.properties) {
    if (property.name === "id") continue;
    if (property.isEntityCollection) {
      draft[property.name] = [];
    } else if (property.default !== undefined) {
      draft[property.name] = structuredClone(property.default);
    }
  }

  return { ...draft, ...overrides };
}
