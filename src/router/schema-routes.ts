import type { Component } from "vue";
import type { RouteRecordRaw } from "vue-router";
import {
  getEntity,
  type ResolvedSchema,
} from "@/domain/schema/schema-resolver.ts";

/**
 * Describes the views used for schema-based routing.
 * Provides functions to resolve the appropriate Vue components for different types of routes.
 */
export interface SchemaRouteViews {
  ///< The layout component used for schema-based routes.
  layout: Component;
  ///< The component used for the root collection view.
  rootCollection: (field: string, entityType: string) => Component;
  ///< The component used for collection views within the schema.
  collection: (
    parentType: string,
    field: string,
    entityType: string,
  ) => Component;
  ///< The component used for entity views within the schema.
  entity: (entityType: string) => Component;
}

export interface RouteBreadcrumb {
  label: string;
  href?: string;
  entityType?: string;
  paramName?: string;
}

/**
 * Describes a workflow route within the schema-based routing system.
 * Represents a route that is part of a workflow, typically used for creating or managing
 * entities within a collection.
 */
export interface WorkflowRoute {
  parentType: string; ///< The type of the parent entity in the workflow route.
  collection: string; ///< The name of the collection within the parent entity.
  path: string; ///< The URL path segment for the workflow route.
  name: string; ///< The unique name of the workflow route.
  breadcrumb: string; ///< The label to display in the breadcrumb navigation.
  component: Component; ///< The Vue component to render for this workflow route.
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

    // console.log(
    //   `Processing entity page for entityType: ${entityType}, entityPath: ${entityPath}, entityParam: ${entityParam}`,
    //   "parentBreadcrumbs:", parentBreadcrumbs,
    //   "ancestry:", ancestry,
    // );
    pages.push({
      path: entityPath,
      name: `${routeKey}-detail`,
      component: views.entity(entityType),
      props: true,
      meta: {
        breadcrumbs: entityBreadcrumbs,
        entityType,
        idParam: entityParam,
      },
    });

    for (const property of entity.properties.filter(
      (candidate) => candidate.isEntityCollection,
    )) {
      const childType = property.entityType;
      if (!childType)
        throw new Error(
          `Entity collection "${entityType}.${property.name}" has no entity type`,
        );

      const collectionPath = `${entityPath}/${property.name}`;
      const collectionName = `${routeKey}-${toKebabCase(property.name)}-collection`;
      const collectionBreadcrumbs = [
        ...entityBreadcrumbs,
        { label: titleCase(property.name), href: collectionPath },
      ];

      // console.log(
      //   `  Processing collection page for entityType: ${entityType}, property: ${property.name}, collectionPath: ${collectionPath}`,
      //   "collectionBreadcrumbs:", collectionBreadcrumbs,
      // );
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

      for (const workflow of workflows.filter(
        (item) =>
          item.parentType === entityType && item.collection === property.name,
      )) {
        pages.push({
          path: `${collectionPath}/${workflow.path}`,
          name: workflow.name,
          component: workflow.component,
          meta: {
            breadcrumbs: [
              ...collectionBreadcrumbs,
              { label: workflow.breadcrumb },
            ],
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
    const rootBreadcrumbs: RouteBreadcrumb[] = [
      { label: titleCase(field), href: collectionPath },
    ];
    const entityParam = `${toCamelCase(entityType)}Id`;
    const entityPath = `${collectionPath}/:${entityParam}`;

    pages.push({
      path: collectionPath,
      name: `${field}-list`,
      component: views.rootCollection(field, entityType),
      meta: { breadcrumbs: rootBreadcrumbs, collectionField: field },
    });

    // console.log(
    //   `Processing root collection for field ${field}:`,
    //   "entityType:", entityType, ", ",
    //   "entityPath:", entityPath, ", ",
    //   "entityParam:", entityParam, ", ",
    //   "rootBreadcrumbs:", rootBreadcrumbs,
    // );
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
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());
}
