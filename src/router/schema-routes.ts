import type { Component } from "vue";
import type { RouteRecordRaw } from "vue-router";
import { getEntity, type ResolvedSchema } from "../domain/schema/schema-resolver.ts";

export interface SchemaRouteViews {
  layout: Component;
  rootCollection: (field: string, entityType: string) => Component;
  collection: (parentType: string, field: string, entityType: string) => Component;
  entity: (entityType: string) => Component;
}

export interface RouteBreadcrumb {
  label: string;
  href?: string;
  entityType?: string;
  paramName?: string;
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
  const pages: RouteRecordRaw[] = [];

  const entityPages = (
    entityType: string,
    entityPath: string,
    entityParam: string,
    routeKey: string,
    parentBreadcrumbs: RouteBreadcrumb[],
    ancestry: string[],
  ): void => {
    const entity = getEntity(schema, entityType);
    const entityBreadcrumbs = [
      ...parentBreadcrumbs,
      {
        label: entity.title ?? entityType,
        entityType,
        paramName: entityParam,
        href: entityPath,
      },
    ];

    pages.push({
      path: entityPath,
      name: `${routeKey}-detail`,
      component: views.entity(entityType),
      props: true,
      meta: { breadcrumbs: entityBreadcrumbs, entityType, idParam: entityParam },
    });

    for (const property of entity.properties.filter((candidate) => candidate.isEntityCollection)) {
      const childType = property.entityType;
      if (!childType) throw new Error(`Entity collection "${entityType}.${property.name}" has no entity type`);

      const collectionPath = `${entityPath}/${property.name}`;
      const collectionName = `${routeKey}-${toKebabCase(property.name)}-collection`;
      const collectionBreadcrumbs = [
        ...entityBreadcrumbs,
        { label: titleCase(property.name), href: collectionPath },
      ];

      pages.push({
        path: collectionPath,
        name: collectionName,
        component: views.collection(entityType, property.name, childType),
        meta: {
          breadcrumbs: collectionBreadcrumbs,
          collectionField: property.name,
          parentType: entityType,
        },
      });

      for (const workflow of workflows.filter((item) => item.parentType === entityType && item.collection === property.name)) {
        pages.push({
          path: `${collectionPath}/${workflow.path}`,
          name: workflow.name,
          component: workflow.component,
          meta: {
            breadcrumbs: [...collectionBreadcrumbs, { label: workflow.breadcrumb }],
            workflow: true,
          },
        });
      }

      if (ancestry.includes(childType)) continue;
      const childParam = `${toCamelCase(childType)}Id`;
      entityPages(
        childType,
        `${collectionPath}/:${childParam}`,
        childParam,
        `${routeKey}-${toKebabCase(property.name)}-${toKebabCase(childType)}`,
        collectionBreadcrumbs,
        [...ancestry, childType],
      );
    }
  };

  for (const { field, entityType } of schema.rootCollections) {
    const rootEntity = getEntity(schema, entityType);
    const collectionPath = `/${field}`;
    const rootBreadcrumbs: RouteBreadcrumb[] = [{ label: titleCase(field), href: collectionPath }];
    const entityParam = `${toCamelCase(entityType)}Id`;
    const entityPath = `${collectionPath}/:${entityParam}`;

    pages.push({
      path: collectionPath,
      name: `${field}-list`,
      component: views.rootCollection(field, entityType),
      meta: { breadcrumbs: rootBreadcrumbs, collectionField: field },
    });

    entityPages(
      entityType,
      entityPath,
      entityParam,
      toKebabCase(entityType),
      rootBreadcrumbs,
      [entityType],
    );
  }

  return [{ path: "/", component: views.layout, children: pages }];
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