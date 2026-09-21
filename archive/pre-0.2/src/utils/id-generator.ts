import type PouchDB from 'pouchdb';

/**
 * Generates an 8-character hexadecimal string natively using the browser's crypto engine.
 * 16^8 provides 4.29 Billion unique combinations.
 */
function getHexToken(): string {
    // Take the first segment of a native UUID
    return crypto.randomUUID().split('-')[0];
}

/**
 * "Trust but Verify" ID Generator
 * Generates a short hex token and verifies its absolute uniqueness against the database.
 * If a collision occurs, it automatically retries with a new token recursively.
 */
export async function generateUniqueId(db: PouchDB.Database, typeNamespace: string): Promise<string> {
    const shortId = getHexToken();
    const fullDatabaseKey = `${typeNamespace.toLowerCase()}:${shortId}`;

    try {
        // Attempt a direct head lookup on the primary key index
        await db.get(fullDatabaseKey);

        // COLLISION DETECTED: If db.get succeeds, this ID already exists!
        console.warn(`Collision detected for key: ${fullDatabaseKey}. Retrying structural allocation...`);

        // Recursively retry until a completely unique slot is secured
        return await generateUniqueId(db, typeNamespace);
    } catch (err: any) {
        if (err.status === 404) {
            // VERIFIED UNIQUE: The ID does not exist in the database. It is safe to use.
            return shortId;
        }
        // Re-throw any critical system or read errors
        throw err;
    }
}
