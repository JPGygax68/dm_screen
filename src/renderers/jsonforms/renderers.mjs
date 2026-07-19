import { and, scopeEndsWith, isLayout, isStringControl, rankWith, uiTypeIs } from '@jsonforms/core';
import IonicStringControlRenderer from './IonicStringControlRenderer.vue';
import IonicGroupRenderer from './IonicGroupRenderer.vue';
import CampaignListRenderer from './CampaignListRenderer.vue';

export const myRenderers = [
  {
    tester: rankWith(5, isStringControl),
    renderer: IonicStringControlRenderer
  },
  {
    tester: rankWith(5, and(isLayout, uiTypeIs('Group'))),
    renderer: IonicGroupRenderer
  },
  {
    tester: rankWith(5, scopeEndsWith('campaigns')),
    renderer: CampaignListRenderer
  }
];
