import type { Component } from "vue";
import type { RouteRecordRaw } from "vue-router";
import { getEntity, type ResolvedSchema } from "../domain/schema/schema-resolver.ts";

export interface SchemaRouteViews {
  layout: Component;
  rootCollection: (field: string, entityType: string) => Component;
  collection: Component;
  entity: (entityType: string) => Component;
}

export interface WorkflowRoute {
  parentType: string;
  collection: string;
  path: string;
  name: string;
  breadcrumb: string;
  component: Component;
}

export function buildSchemaRoutes(
  schema: ResolvedSchema,
  views: SchemaRouteViews,
  workflows: WorkflowRoute[] = [],
): RouteRecordRaw[] {
  const entityRoute = (
    entityType: string,
    path: string,
    name: string,
    ancestry: string[],
  ): RouteRecordRaw => {
    const entity = getEntity(schema, entityType);
    const children = entity.properties
      .filter((property) => property.isEntityCollection)
      .map((property) => collectionRoute(entityType, property.name, property.entityType!, ancestry));

    return {
      path,
      name,
      component: views.entity(entityType),
      props: true,
      meta: { breadcrumb: entity.title ?? entityType, entityType, idParam: path.slice(1) },
      ...(children.length ? { children } : {}),
    };
  };

  const collectionRoute = (
    parentType: string,
    field: string,
    childType: string,
    ancestry: string[],
  ): RouteRecordRaw => {
    if (!childType) throw new Error(`Entity collection "${parentType}.${field}" has no entity type`);

    const routeKey = [...ancestry, field].map(toKebabCase).join("-");
    const childParam = `${toCamelCase(childType)}Id`;
    const children: RouteRecordRaw[] = workflows
      .filter((workflow) => workflow.parentType === parentType && workflow.collection === field)
      .map((workflow) => ({
        path: workflow.path,
        name: workflow.name,
        component: workflow.component,
        meta: { breadcrumb: workflow.breadcrumb, workflow: true },
      }));

    if (!ancestry.includes(childType)) {
      children.push(
        entityRoute(
          childType,
          `:${childParam}`,
          `${routeKey}-${toKebabCase(childType)}-detail`,
          [...ancestry, childType],
        ),
      );
    }

    return {
      path: field,
      name: `${routeKey}-collection`,
      component: views.collection,
      meta: { breadcrumb: titleCase(field), collectionField: field, parentType },
      children,
    };
  };

  return schema.rootCollections.map(({ field, entityType }) => {
    const rootEntity = getEntity(schema, entityType);
    const entityParam = `${toCamelCase(entityType)}Id`;

    return {
      path: `/${field}`,
      component: views.layout,
      meta: { breadcrumb: titleCase(field), collectionField: field },
      children: [
        {
          path: "",
          name: `${field}-list`,
          component: views.rootCollection(field, entityType),
          meta: { breadcrumb: false },
        },
        entityRoute(
          entityType,
          `:${entityParam}`,
          `${toKebabCase(entityType)}-detail`,
          [entityType],
        ),
      ],
    };
  });
}

function toCamelCase(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function toKebabCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function titleCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (char) => char.toUpperCase());
}