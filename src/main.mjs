import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';

// 1. Import your raw JSON Schema data footprint
// (Ensure your bundler environment supports directly loading JSON files)
import dataSchema from './generated/models/data.schema.json';

// 2. Import your generic, schema-driven factories
import { createGenericStore } from './stores/generic-store.js';
import { buildRoutesFromSchema } from './router/generic-router.js';
import { GenericPersistenceAdapter } from './db/persistence.js'; // Adjust path to your adapter

const app = createApp(App);

// 3. Initialize Pinia first so the global store engine registry exists
const pinia = createPinia();
app.use(pinia);

// 4. Initialize your generic persistence adapter
const dbAdapter = new GenericPersistenceAdapter(dataSchema);

// 5. Build and instantiate your Pinia store dynamically
// This registers 'generic-dmscreen-store' directly into Pinia's central internal map
const useGlobalStore = createGenericStore(dataSchema, dbAdapter);
const globalStore = useGlobalStore();

// 6. Hydrate your state cache completely from storage before starting the router
// This guarantees list paths find active matching models immediately during route checks
await dbAdapter.hydrateStore(globalStore);

// 7. Compile the nested routing paths dynamically using the live store context
const dynamicRoutes = buildRoutesFromSchema(dataSchema, globalStore);

const router = createRouter({
  history: createWebHistory(),
  routes: dynamicRoutes
});
app.use(router);

// 8. Final application execution mounting point
app.mount('#app');
