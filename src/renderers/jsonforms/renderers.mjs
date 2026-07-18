import { and, isArrayObjectControl, isLayout, isStringControl, rankWith, uiTypeIs } from '@jsonforms/core';
import IonicStringControlRenderer from './IonicStringControlRenderer.vue';
import IonicGroupRenderer from './IonicGroupRenderer.vue';
import IonicListRenderer from './IonicListRenderer.vue';

export const ionicRenderers = [
  {
    tester: rankWith(5, isStringControl),
    renderer: IonicStringControlRenderer
  },
  {
    tester: rankWith(6, and(isLayout, uiTypeIs('Group'))),
    renderer: IonicGroupRenderer
  },
  // // For arrays/lists:
  // {
  //   tester: rankWith(5, isArrayObjectControl),
  //   renderer: IonicListRenderer
  // }
];
