import { and, isLayout, isStringControl, rankWith, uiTypeIs } from '@jsonforms/core';
import IonicStringControlRenderer from './IonicStringControlRenderer.vue';
import IonicGroupRenderer from './IonicGroupRenderer.vue';

export const ionicRenderers = [
  {
    tester: rankWith(5, isStringControl),
    renderer: IonicStringControlRenderer
  },
  {
    tester: rankWith(6, and(isLayout, uiTypeIs('Group'))),
    renderer: IonicGroupRenderer
  }
];
