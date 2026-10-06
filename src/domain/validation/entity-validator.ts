import Ajv2020 from "ajv/dist/2020.js";
import { type ErrorObject, type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";

export interface EntityValidationIssue {
  keyword: string;
  instancePath: string;
  message: string;
}

export type EntityValidator = (value: unknown) => EntityValidationIssue[];

export class EntityValidationError extends Error {
  readonly entityType: string;
  readonly issues: EntityValidationIssue[];

  constructor(entityType: string, issues: EntityValidationIssue[]) {
    const detail = issues.map(({ instancePath, message }) => `${instancePath || "/"} ${message}`).join("; ");
    super(`${entityType} is invalid: ${detail}`);
    this.name = "EntityValidationError";
    this.entityType = entityType;
    this.issues = issues;
  }
}

export function createEntityValidators(
  schema: object,
  entityTypes: Iterable<string>,
): Map<string, EntityValidator> {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  ajv.addSchema(schema);

  const schemaId = (schema as { $id?: string }).$id;
  if (!schemaId) throw new Error("Entity validation requires a schema with an $id");

  return new Map(
    [...entityTypes].map((entityType) => {
      const pointer = entityType.replace(/~/g, "~0").replace(/\//g, "~1");
      const validate = ajv.compile({ $ref: `${schemaId}#/$defs/${pointer}` });
      return [entityType, (value: unknown) => validationIssues(validate, value)];
    }),
  );
}

function validationIssues(validate: ValidateFunction, value: unknown): EntityValidationIssue[] {
  if (validate(value)) return [];
  return (validate.errors ?? []).map((error: ErrorObject) => ({
    keyword: error.keyword,
    instancePath: error.instancePath,
    message: error.message ?? "Schema validation failed",
  }));
}