import type { RouteRecordRaw } from 'vue-router';
import { resolveEffectiveSchema } from '@/utils/schema-utils';

/**
 * PURE DOMAIN ENGINE ROUTE BUILDER
 * Generates user navigation entrypoints exclusively for structural data collection arrays.
 * Global application parameters or primitive keys are bypassed by design.
 */
export function buildRoutesFromSchema(schema: any, storeInstance: any): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = [];
  
  const effectiveSchema = resolveEffectiveSchema(schema, schema);
  const rootProps = effectiveSchema.properties || {};

  Object.keys(rootProps).forEach(key => {
    const effectiveRootProp = resolveEffectiveSchema(rootProps[key], schema);

    // CRUCIAL BOUNDARY: Only build routes for your domain collection arrays!
    if (effectiveRootProp.type === 'array') {
      const collectionKey = key; // "campaigns"
      const itemSchema = resolveEffectiveSchema(effectiveRootProp.items, schema);
      const entityName = itemSchema.title 
        ? itemSchema.title.toLowerCase().replace(/\s+/g, '-') 
        : collectionKey.replace(/s$/, '');

      // 1. Root Collection List View (e.g., path: "/campaigns")
      const listRoute: RouteRecordRaw = {
        path: `/${collectionKey}`,
        name: `generic-${collectionKey}-list`,
        component: () => import('@/views/GenericListView.vue'),
        props: { collectionKey }
      };
      routes.push(listRoute);

      const childListRoutes: RouteRecordRaw[] = [];
      const childDetailRoutes: RouteRecordRaw[] = [];

      // Unpack nested child attributes inside the item profile definition
      if (itemSchema.properties) {
        Object.keys(itemSchema.properties).forEach(subKey => {
          const effectiveSubProp = resolveEffectiveSchema(itemSchema.properties[subKey], schema);

          if (effectiveSubProp.type === 'array') {            
            const subCollectionKey = subKey; // "party", "encounters"
            const subItemSchema = resolveEffectiveSchema(effectiveSubProp.items, schema);
            const subEntityName = subItemSchema.title 
              ? subItemSchema.title.toLowerCase().replace(/\s+/g, '-') 
              : subCollectionKey.replace(/s$/, '');

            // Nested flattened collection page link (e.g., /campaigns/:campaignId/party)
            childListRoutes.push({
              path: `/${collectionKey}/:${entityName}Id/${subCollectionKey}`,
              name: `generic-${entityName}-${subCollectionKey}-list`,
              component: () => import('@/views/GenericListView.vue'),
              props: { collectionKey: subCollectionKey }
            });

            // Nested flattened record detail page link (e.g., /campaigns/:campaignId/party/:partyId)
            childDetailRoutes.push({
              path: `/${collectionKey}/:${entityName}Id/${subCollectionKey}/:${subEntityName}Id`,
              name: `generic-${entityName}-${subEntityName}-detail`,
              component: () => import('@/views/GenericDetailView.vue'),
              props: true
            });
          }
        });
      }

      // Prioritize explicit nested sub-collection route matching configurations
      routes.push(...childListRoutes);
      routes.push(...childDetailRoutes);

      // 2. Fallback Root Item Detail View (e.g., path: "/campaigns/:campaignId")
      const detailRoute: RouteRecordRaw = {
        path: `/${collectionKey}/:${entityName}Id`,
        name: `generic-${entityName}-detail`,
        component: () => import('@/views/GenericDetailView.vue'),
        props: true
      };
      routes.push(detailRoute);
    }
    // Any top-level field that is NOT an array (like "dummy") is gracefully ignored by the router loop.
  });

  // Catch-all fallthrough redirection rule maps straight back to your primary data hub path
  routes.push({ path: '/:pathMatch(.*)*', redirect: '/campaigns' });
  return routes;
}
