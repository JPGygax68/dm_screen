import type { RouteRecordRaw } from 'vue-router';
import { resolveEffectiveSchema } from '@/utils/schema-utils';

export function buildRoutesFromSchema(schema: any, storeInstance: any): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = [];
  const rootProps = schema.properties || {};

  Object.keys(rootProps).forEach(key => {
    const effectiveRootProp = resolveEffectiveSchema(rootProps[key], schema);

    if (effectiveRootProp.type === 'array') {
      const collectionKey = key; // "campaigns"
      const itemSchema = resolveEffectiveSchema(effectiveRootProp.items, schema);
      const entityName = itemSchema.title 
        ? itemSchema.title.toLowerCase().replace(/\s+/g, '-') 
        : collectionKey.replace(/s$/, '');

      // Step 1: Base list route
      const listRoute: RouteRecordRaw = {
        path: `/${collectionKey}`,
        name: `generic-${collectionKey}-list`,
        component: () => import('@/views/GenericListView.vue'),
        props: { collectionKey }
      };

      // Step 2: Main detail route
      const detailRoute: RouteRecordRaw = {
        path: `/${collectionKey}/:${entityName}Id`,
        name: `generic-${entityName}-detail`,
        component: () => import('@/views/GenericDetailView.vue'),
        props: true,
        beforeEnter: (to) => {
          storeInstance.syncActiveContext(entityName, to.params[`${entityName}Id`] as string);
        },
        children: []
      };

      // Look inside the item for sub-properties
      if (itemSchema.properties) {
        Object.keys(itemSchema.properties).forEach(subKey => {
          const effectiveSubProp = resolveEffectiveSchema(itemSchema.properties[subKey], schema);

          if (effectiveSubProp.type === 'array') {
            const subCollectionKey = subKey; // "encounters"
            const subItemSchema = resolveEffectiveSchema(effectiveSubProp.items, schema);
            const subEntityName = subItemSchema.title 
              ? subItemSchema.title.toLowerCase().replace(/\s+/g, '-') 
              : subCollectionKey.replace(/s$/, '');

            // Step 3: Explicit child list route under parent detail
            detailRoute.children?.push({
              path: `${subCollectionKey}`,
              name: `generic-${entityName}-${subCollectionKey}-list`,
              component: () => import('@/views/GenericListView.vue'),
              props: { collectionKey: subCollectionKey }
            });

            // Step 4: Explicit child detail route under parent detail
            detailRoute.children?.push({
              path: `${subCollectionKey}/:${subEntityName}Id`,
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

      routes.push(listRoute, detailRoute);
    }
  });

  routes.push({ path: '/:pathMatch(.*)*', redirect: '/campaigns' });
  return routes;
}
