/**
 * Spec-compliant helper to resolve the true underlying type of a property,
 * evaluating recursive $ref targets and handling overrides.
 */
export function resolveEffectiveSchema(prop: any, schemaRoot: any): any {
  if (!prop) return {};

  if (prop['$ref']) {
    // Transform "#/$defs/Campaigns" -> ["$defs", "Campaigns"]
    const pathParts = prop['$ref'].split('/').slice(1);

    // Recursively walk down the schema using reduce
    const resolved = pathParts.reduce((currentSegment: any, part: string) => {
      return currentSegment?.[part];
    }, schemaRoot);

    // Merge: Local adjacent properties override the referenced schema target
    return { ...resolved, ...prop };
  }

  return prop;
}

