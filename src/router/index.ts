import { createRouter, createWebHistory, type Component, type RouteRecordRaw } from "vue-router";
import { resolveSchema } from "../domain/schema/schema-resolver.ts";
import { buildSchemaRoutes, type WorkflowRoute } from "./schema-routes.ts";
import CampaignsLayout from "../views/CampaignsLayout.vue";
import CampaignListView from "../views/CampaignListView.vue";
import CampaignDetailView from "../views/CampaignDetailView.vue";
import SchemaCollectionView from "../views/SchemaCollectionView.vue";
import SchemaEntityView from "../views/SchemaEntityView.vue";
import PartyCollectionView from "../views/PartyCollectionView.vue";
import NewPlayerCharacterRouteView from "../views/NewPlayerCharacterRouteView.vue";
import PlayerCharacterEditor from "../components/PlayerCharacterEditor.vue";

export function createAppRouter(schemaDocument: object) {
  const schema = resolveSchema(schemaDocument as Parameters<typeof resolveSchema>[0]);
  const routeViews = {
    layout: CampaignsLayout,
    rootCollection: (field: string) => field === "campaigns" ? CampaignListView : SchemaCollectionView,
    collection: (parentType: string, field: string): Component =>
      parentType === "Campaign" && field === "party" ? PartyCollectionView : SchemaCollectionView,
    entity: (entityType: string): Component => {
      if (entityType === "Campaign") return CampaignDetailView;
      if (entityType === "PlayerCharacter") return PlayerCharacterEditor;
      return SchemaEntityView;
    },
  };
  const workflows: WorkflowRoute[] = [
    {
      parentType: "Campaign",
      collection: "party",
      path: "new",
      name: "campaign-party-new",
      breadcrumb: "New character",
      component: NewPlayerCharacterRouteView,
    },
  ];

  const routes: RouteRecordRaw[] = [
    { path: "/", redirect: { name: "campaigns-list" } },
    ...buildSchemaRoutes(schema, routeViews, workflows),
    { path: "/:pathMatch(.*)*", redirect: { name: "campaigns-list" } },
  ];

  return createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes });
}