import { createApp} from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import '@/styles/tailwind.css';
import App from '@/App.vue';

import dataSchema from '@/generated/models/data.schema.json';

// 2. Import your generic, schema-driven factories
import { buildRoutesFromSchema } from '@/router/generic-router.js';
import { PouchDbAdapter } from '@/db/pouch-adapter.js';
import { useDmScreenStore } from '@/stores/generic-store.js';

const app = createApp(App);
//console.log('App initialized:', app);

const pinia = createPinia();
app.use(pinia);

const dmScreenStore = useDmScreenStore();
//console.log('DM Screen Store initialized:', JSON.parse(JSON.stringify(dmScreenStore)));

// Hydrate your state cache completely from storage before starting the router
// This guarantees list paths find active matching models immediately during route checks
await dmScreenStore.loadDatabaseIntoStore();
//console.log('Database loaded into store:', JSON.parse(JSON.stringify(dmScreenStore)));

// Compile the nested routing paths dynamically using the live store context
const dynamicRoutes = buildRoutesFromSchema(dataSchema, dmScreenStore);
//console.log('Dynamic routes built from schema:', JSON.parse(JSON.stringify(dynamicRoutes)));

const router = createRouter({
  history: createWebHistory(),
  routes: dynamicRoutes
});
app.use(router);

// 8. Final application execution mounting point
app.mount('#app');
