import { resolveEffectiveSchema } from '@/utils/schema-utils';

/**
 * Generic Schema-Driven Database Persistence Adapter
 * Uses native browser IndexedDB to dynamically allocate storage structures.
 */
export class GenericPersistenceAdapter {
    private dbName: string;
    private db: IDBDatabase | null = null;
    private storeNames: string[] = [];

    constructor(schema: any) {
        // Generate a unique database name based on the schema title
        this.dbName = schema.title?.toLowerCase().replace(/\s+/g, '-') || 'generic-dmscreen-db';

        // Dynamically identify root collections by scanning schema properties for arrays
        if (schema.properties) {
            Object.keys(schema.properties).forEach(key => {
                const effectiveProp = resolveEffectiveSchema(schema.properties[key], schema);
                if (effectiveProp.type === 'array') {
                    this.storeNames.push(key); // e.g., "campaigns"
                }
            });
        }
    }

    /**
     * Initializes or upgrades IndexedDB on the fly based on schema collections
     */
    public async initDB(): Promise<IDBDatabase> {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            // Open IndexedDB connection
            const request = indexedDB.open(this.dbName, 1);

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Dynamically create an object store for every root collection array found in the schema
                this.storeNames.forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        // Every record inside the collection must have an 'id' property
                        db.createObjectStore(storeName, { keyPath: 'id' });
                    }
                });
            };

            request.onsuccess = (event: Event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve(this.db);
            };

            request.onerror = (event: Event) => {
                console.error('IndexedDB allocation failed:', (event.target as IDBOpenDBRequest).error);
                reject((event.target as IDBOpenDBRequest).error);
            };
        });
    }

    /**
     * Hydrates the Pinia store state by reading all collections out of storage
     */
    public async hydrateStore(storeInstance: any): Promise<void> {
        await this.initDB();

        for (const storeName of this.storeNames) {
            try {
                const data = await this.getAllRecords(storeName);
                // Safely push parsed records straight into the matching Pinia state property slot
                storeInstance.setItem(storeName, data || []);
            } catch (err) {
                console.error(`Error hydrating collection layer [${storeName}]:`, err);
            }
        }
    }

    /**
     * Universal write interceptor fired on application mutations
     * Saves either a single entity or handles whole collection overrides
     */
    public async save(collectionKey: string, data: any): Promise<void> {
        await this.initDB();
        if (!this.db) throw new Error('Database not initialized');

        // If the data is a clean collection array, write records sequentially
        if (Array.isArray(data)) {
            const tx = this.db.transaction(collectionKey, 'readwrite');
            const store = tx.objectStore(collectionKey);

            // Clear out obsolete storage objects first to maintain precise synchronization matching memory arrays
            store.clear();

            data.forEach(item => {
                if (item.id) store.put(item);
            });

            return new Promise((resolve, reject) => {
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        } else if (data && data.id) {
            // Single record upsert utility pathing shortcut
            return new Promise((resolve, reject) => {
                if (!this.db) return reject('No DB context');
                const tx = this.db.transaction(collectionKey, 'readwrite');
                const store = tx.objectStore(collectionKey);
                const request = store.put(data);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
    }

    /**
     * Private internal helper to read all objects from an IndexedDB store namespace
     */
    private getAllRecords(storeName: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject('Database context unavailable');
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}
