import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import '@/styles/tailwind.css';
import App from '@/App.vue';

import dataSchema from '@/generated/models/data.schema.json';

// 2. Import your generic, schema-driven factories
import { buildRoutesFromSchema } from '@/router/generic-router.js';
import { PouchDbAdapter } from '@/db/pouch-adapter.js';
import { useDmScreenStore } from '@/stores/dmScreenStore.js';

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

const dmScreenStore = useDmScreenStore();

// Hydrate your state cache completely from storage before starting the router
// This guarantees list paths find active matching models immediately during route checks
await dmScreenStore.hydrateFromStorage();

// Compile the nested routing paths dynamically using the live store context
const dynamicRoutes = buildRoutesFromSchema(dataSchema, dmScreenStore);

const router = createRouter({
  history: createWebHistory(),
  routes: dynamicRoutes
});
app.use(router);

// 8. Final application execution mounting point
app.mount('#app');
