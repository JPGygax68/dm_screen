// generateRoutesFromUiSchema.mjs
// NOTE: not being used yet

import { slugify } from './slugify.mjs';

export function generateRoutesFromUiSchema(uiSchema) {
  const groups = Array.isArray(uiSchema.elements)
    ? uiSchema.elements.filter(el => el.type === 'Group')
    : [];

  return groups.map(group => {
    const slug = slugify(group.label);

    return {
      path: `/campaign/${slug}`,
      name: `campaign-${slug}`,
      component: () => import('../pages/AutoFormPage.vue'),
      meta: {
        groupLabel: group.label,
        uiSchemaGroup: group,
        actions: uiSchema['x-actions'] || [],
        options: uiSchema.options || {}
      }
    };
  });
}
