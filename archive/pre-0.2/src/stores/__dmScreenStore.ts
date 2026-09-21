import { createGenericStore } from './generic-store';
import { PouchDbAdapter } from '@/db/pouch-adapter';
import dataSchema from '@/generated/models/data.schema.json';

const dbAdapter = new PouchDbAdapter(dataSchema);

export const useDmScreenStore = createGenericStore('dmscreen-store', dataSchema, dbAdapter);