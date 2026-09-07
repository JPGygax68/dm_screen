import type { RouteRecordRaw } from 'vue-router';
import { resolveEffectiveSchema } from '@/utils/schema-utils';

export function buildRoutesFromSchema(schema: any, storeInstance: any): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = [];
  const rootProps = schema.properties || {};

  Object.keys(rootProps).forEach(key => {
    const effectiveRootProp = resolveEffectiveSchema(rootProps[key], schema);

    // Only collection root properties (arrays) are considered for route generation
    if (effectiveRootProp.type === 'array') {
      const collectionKey = key; // e.g., "campaigns"
      const itemSchema = resolveEffectiveSchema(effectiveRootProp.items, schema);
      const entityName = itemSchema.title 
        ? itemSchema.title.toLowerCase().replace(/\s+/g, '-') 
        : collectionKey.replace(/s$/, ''); //

      // Step 1: Base list route (e.g., /campaigns)
      const listRoute: RouteRecordRaw = {
        path: `/${collectionKey}`,
        name: `generic-${collectionKey}-list`,
        component: () => import('@/views/GenericListView.vue'),
        props: { collectionKey } //
      };
      routes.push(listRoute);

      // Arrays to collect explicit child paths safely so we can prioritize them
      const childListRoutes: RouteRecordRaw[] = [];
      const childDetailRoutes: RouteRecordRaw[] = [];

      // Look inside the item for sub-properties
      if (itemSchema.properties) {
        Object.keys(itemSchema.properties).forEach(subKey => {
          const effectiveSubProp = resolveEffectiveSchema(itemSchema.properties[subKey], schema);

          if (effectiveSubProp.type === 'array') {            
            const subCollectionKey = subKey; // e.g., "encounters" or "party"
            const subItemSchema = resolveEffectiveSchema(effectiveSubProp.items, schema);
            const subEntityName = subItemSchema.title 
              ? subItemSchema.title.toLowerCase().replace(/\s+/g, '-') 
              : subCollectionKey.replace(/s$/, ''); //

            // Step 2: Flattened child list route (e.g., /campaigns/:campaignId/party)
            // Absolute path specification bypasses child window layout constraints
            childListRoutes.push({
              path: `/${collectionKey}/:${entityName}Id/${subCollectionKey}`,
              name: `generic-${entityName}-${subCollectionKey}-list`,
              component: () => import('@/views/GenericListView.vue'),
              props: { collectionKey: subCollectionKey }
            });
            console.log(`Added flat child list route: /${collectionKey}/:${entityName}Id/${subCollectionKey}`); //

            // Step 3: Flattened child detail route (e.g., /campaigns/:campaignId/party/:partyId)
            childDetailRoutes.push({
              path: `/${collectionKey}/:${entityName}Id/${subCollectionKey}/:${subEntityName}Id`,
              name: `generic-${entityName}-${subEntityName}-detail`,
              component: () => import('@/views/GenericDetailView.vue'),
              props: true,
              beforeEnter: (to) => {
                storeInstance.syncActiveContext(subEntityName, to.params[`${subEntityName}Id`] as string);
              }
            });
          }
        });
      }

      // CRUCIAL ROUTER ORDERING MATRICES:
      // 1. First push explicit longer sub-list parameters (/campaigns/:id/party)
      routes.push(...childListRoutes);
      
      // 2. Next push explicit longer sub-detail parameters (/campaigns/:id/party/:id)
      routes.push(...childDetailRoutes);

      // 3. Finally push the fallback wildcard pattern entity detail path (/campaigns/:campaignId)
      const detailRoute: RouteRecordRaw = {
        path: `/${collectionKey}/:${entityName}Id`,
        name: `generic-${entityName}-detail`,
        component: () => import('@/views/GenericDetailView.vue'),
        props: true,
        beforeEnter: (to) => {
          storeInstance.syncActiveContext(entityName, to.params[`${entityName}Id`] as string);
        } //
      };
      routes.push(detailRoute);
    }
  });

  // Catch-all route definition remains at the very bottom
  routes.push({ path: '/:pathMatch(.*)*', redirect: '/campaigns' }); //
  return routes;
}
