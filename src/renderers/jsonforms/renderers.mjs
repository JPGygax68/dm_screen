import { and, scopeEndsWith, isLayout, isStringControl, rankWith, uiTypeIs } from '@jsonforms/core';
import IonicGroupRenderer from './IonicGroupRenderer.vue';
import IonicListRenderer from './IonicListRenderer.vue';
import IonicStringControlRenderer from './IonicStringControlRenderer.vue';
import MyArrayRenderer from './MyArrayRenderer.vue';

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
    tester: rankWith(5, uiTypeIs('array')),
    renderer: IonicListRenderer
  },
  // {
  //   tester: rankWith(5, uiTypeIs('array')),
  //   renderer: MyArrayRenderer
  // }
];
