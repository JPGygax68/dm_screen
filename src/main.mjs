import { createApp } from "vue";
import { createPinia } from "pinia";
import dataSchema from "./generated/models/data.schema.json";
import App from "./App.vue";
import { configureDataStore } from "./stores/data-store.ts";
import { PouchDbStorageAdapter } from "./domain/persistence/pouchdb-storage-adapter.ts";
import "./styles/tailwind.css";

configureDataStore(dataSchema, new PouchDbStorageAdapter());

createApp(App).use(createPinia()).mount("#app");