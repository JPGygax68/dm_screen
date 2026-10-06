import assert from "node:assert/strict";
import type { Component } from "vue";
import type { RouteRecordRaw } from "vue-router";
import dataSchema from "../src/generated/models/data.schema.json" with { type: "json" };
import { resolveSchema } from "../src/domain/schema/schema-resolver.ts";
import { buildSchemaRoutes } from "../src/router/schema-routes.ts";

const placeholder = {} as Component;
const schema = resolveSchema(dataSchema as Parameters<typeof resolveSchema>[0]);
const routes = buildSchemaRoutes(schema, {
  layout: placeholder,
  rootCollection: () => placeholder,
  collection: placeholder,
  entity: () => placeholder,
}, [
  {
    parentType: "Campaign",
    collection: "party",
    path: "new",
    name: "campaign-party-new",
    breadcrumb: "New character",
    component: placeholder,
  },
]);

const routePaths: string[] = [];
const routeNames = new Set<string>();

function collectRoutes(records: RouteRecordRaw[], parentPath = ""): void {
  for (const record of records) {
    const path = record.path.startsWith("/")
      ? record.path
      : `${parentPath}/${record.path}`.replace(/\/+/g, "/");
    routePaths.push(path);
    if (record.name) routeNames.add(String(record.name));
    if ("children" in record && record.children) collectRoutes(record.children, path);
  }
}

collectRoutes(routes);

assert.ok(routePaths.includes("/campaigns"));
assert.ok(routePaths.includes("/campaigns/:campaignId"));
assert.ok(routePaths.includes("/campaigns/:campaignId/party"));
assert.ok(routePaths.includes("/campaigns/:campaignId/party/:playerCharacterId"));
assert.ok(routePaths.includes("/campaigns/:campaignId/party/new"));
assert.ok(routePaths.includes("/campaigns/:campaignId/encounters/:encounterId"));
assert.ok(routePaths.includes("/campaigns/:campaignId/encounters/:encounterId/participants/:participantId"));
assert.ok(routeNames.has("campaign-party-new"));
assert.ok(routeNames.has("campaign-party-collection"));

console.log("Schema-derived route tests passed.");