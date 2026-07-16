import { slugify } from '#lib/slugify.mjs';

export function generateFormSpec(name, schema, uiSchema, normalizedRoot, fieldList, formWarnings) {
  const slugifiedName = slugify(name);
  return {
    $schema: 'https://dm-screen.local/schema/form-spec.schema.json',
    $id: `https://dm-screen.local/generated/forms/${slugifiedName}.form-spec.json`,
    version: 1,
    source: {
      dataSchemaId: schema?.$id ?? null,
      uiSchemaId: uiSchema?.$id ?? null,
      modelRoot: `#/$defs/${name}`
    },
    form: normalizedRoot,
    fieldsByPath: Object.fromEntries(
      fieldList
        .filter((field) => typeof field.path === 'string' && field.path.length > 0)
        .map((field) => [
          field.path,
          {
            scope: field.scope,
            pointer: field.pointer,
            schemaType: field.schemaType,
            required: field.required,
            label: field.label,
            placeholder: field.placeholder,
            options: field.options,
          }
        ])
    ),
    warnings: formWarnings
  };
}