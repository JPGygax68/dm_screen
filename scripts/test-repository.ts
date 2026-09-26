import assert from "node:assert/strict";
import dataSchema from "../src/generated/models/data.schema.json" with { type: "json" };
import { resolveSchema } from "../src/domain/schema/schema-resolver.ts";
import { Repository, ROOT_ID, ROOT_TYPE } from "../src/domain/persistence/repository.ts";
import { MemoryStorageAdapter } from "../src/domain/persistence/memory-storage-adapter.ts";

const schema = resolveSchema(dataSchema as Parameters<typeof resolveSchema>[0]);

// Resolver correctly tells entities (have a GlobalId `id`) apart from embedded data (Round/Turn have none).
assert.ok(schema.entities.has("Campaign"));
assert.ok(schema.entities.has("Participant"));
assert.ok(!schema.entities.has("Round"));
assert.deepEqual(schema.rootCollections, [{ field: "campaigns", entityType: "Campaign" }]);

const campaignEntity = schema.entities.get("Campaign")!;
const partyProperty = campaignEntity.properties.find((p) => p.name === "party")!;
assert.equal(partyProperty.isEntityCollection, true);
assert.equal(partyProperty.entityType, "PlayerCharacter");

const encounterEntity = schema.entities.get("Encounter")!;
const roundsProperty = encounterEntity.properties.find((p) => p.name === "rounds")!;
assert.equal(roundsProperty.isEntityCollection, false, "Round has no GlobalId, so rounds stay embedded");

const aliasedSchema = resolveSchema({
	"$defs": {
		GlobalId: { type: "string", format: "uuid" },
		EntityId: { "$ref": "#/$defs/GlobalId" },
		Thing: {
			type: "object",
			properties: { id: { "$ref": "#/$defs/EntityId" }, name: { type: "string" } },
			required: ["id"]
		},
		ThingAlias: { "$ref": "#/$defs/Thing", description: "Thing alias" },
		Things: { type: "array", items: { "$ref": "#/$defs/ThingAlias" } }
	},
	properties: { things: { "$ref": "#/$defs/Things" } }
} as Parameters<typeof resolveSchema>[0]);
assert.deepEqual(aliasedSchema.rootCollections, [{ field: "things", entityType: "Thing" }]);
assert.equal(aliasedSchema.entities.get("Thing")?.properties.length, 2);

assert.throws(
	() => resolveSchema({ "$defs": { Loop: { "$ref": "#/$defs/Loop" } } } as Parameters<typeof resolveSchema>[0]),
	/Cyclic schema reference/
);
assert.throws(
	() => resolveSchema({ "$defs": { Broken: { "$ref": "#/$defs/Missing" } } } as Parameters<typeof resolveSchema>[0]),
	/does not resolve to a definition/
);

// --- Repository round-trip ---

const adapter = new MemoryStorageAdapter();
const repository = new Repository(adapter, schema);
await repository.ensureRoot();

const campaign = { id: crypto.randomUUID(), name: "The Sunken Keep", party: [], encounters: [] };
await repository.createEntity("Campaign", campaign, { type: ROOT_TYPE, id: ROOT_ID, field: "campaigns" });

const pc = { id: crypto.randomUUID(), name: "Elandra", maxHitPoints: 30, hitPoints: 30, conditions: [] };
await repository.createEntity("PlayerCharacter", pc, { type: "Campaign", id: campaign.id, field: "party" });

const loadedCampaigns = await repository.loadRootCollection("campaigns");
assert.equal(loadedCampaigns.length, 1);
const loadedCampaign = loadedCampaigns[0] as typeof campaign;
assert.equal(loadedCampaign.name, "The Sunken Keep");
assert.equal((loadedCampaign.party as typeof pc[]).length, 1);
assert.equal((loadedCampaign.party as typeof pc[])[0].name, "Elandra");

// Child-before-parent ordering: the parent doc only ever references a child ID once persisted.
const parentDoc = await adapter.get(`Campaign:${campaign.id}`);
assert.deepEqual(parentDoc?.children.party, [pc.id]);
assert.ok(await adapter.get(`PlayerCharacter:${pc.id}`));

// updateEntity persists scalar changes without touching child linkage.
const renamedPc = { ...pc, name: "Elandra Brightwood" };
await repository.updateEntity("PlayerCharacter", renamedPc);
const reloadedAfterRename = (await repository.loadRootCollection("campaigns"))[0] as typeof campaign;
assert.equal((reloadedAfterRename.party as typeof pc[])[0].name, "Elandra Brightwood");

// removeChild unlinks from the parent and deletes the child's own record.
await repository.removeChild({ type: "Campaign", id: campaign.id, field: "party" }, "PlayerCharacter", pc.id);
const reloadedAfterRemoval = (await repository.loadRootCollection("campaigns"))[0] as typeof campaign;
assert.equal((reloadedAfterRemoval.party as typeof pc[]).length, 0);
assert.equal(await adapter.get(`PlayerCharacter:${pc.id}`), undefined);

const orphanId = crypto.randomUUID();
await adapter.put({
	_id: `PlayerCharacter:${orphanId}`,
	type: "PlayerCharacter",
	entityId: orphanId,
	data: { name: "Orphaned record", maxHitPoints: 1 },
	children: {}
});

const dryRunCleanup = await repository.cleanup();
assert.deepEqual(dryRunCleanup.orphanedDocumentIds, [`PlayerCharacter:${orphanId}`]);
assert.deepEqual(dryRunCleanup.deletedDocumentIds, []);
assert.ok(await adapter.get(`PlayerCharacter:${orphanId}`));

const deletingCleanup = await repository.cleanup({ dryRun: false });
assert.deepEqual(deletingCleanup.deletedDocumentIds, [`PlayerCharacter:${orphanId}`]);
assert.equal(await adapter.get(`PlayerCharacter:${orphanId}`), undefined);

// --- Concurrent local writes: linkChild must retry on a stale parent revision ---
// instead of silently losing whichever child lost the race. The app only ever
// runs one Repository instance per tab; a second instance is used here purely
// as a deterministic way to force the interleaving (real races instead come
// from another tab, overlapping async calls on the same instance, or future
// replication) — the fix is about concurrent writers to a document, not about
// concurrent Repository instances.

const raceAdapter = new MemoryStorageAdapter();
const raceRepository = new Repository(raceAdapter, schema);
const otherActorRepository = new Repository(raceAdapter, schema);
await raceRepository.ensureRoot();

const raceCampaign = { id: crypto.randomUUID(), name: "Racing Keep", party: [], encounters: [] };
await raceRepository.createEntity("Campaign", raceCampaign, { type: ROOT_TYPE, id: ROOT_ID, field: "campaigns" });

const pcA = { id: crypto.randomUUID(), name: "Actor A", maxHitPoints: 10, hitPoints: 10, conditions: [] };
const pcB = { id: crypto.randomUUID(), name: "Actor B", maxHitPoints: 10, hitPoints: 10, conditions: [] };

let interfered = false;
const originalPut = raceAdapter.put.bind(raceAdapter);
raceAdapter.put = async (doc) => {
	if (!interfered && doc.type === "Campaign") {
		interfered = true;
		// A second, fully independent write to the same parent completes here,
		// between raceRepository's read and write of the Campaign document.
		await otherActorRepository.createEntity("PlayerCharacter", pcB, {
			type: "Campaign",
			id: raceCampaign.id,
			field: "party"
		});
	}
	return originalPut(doc);
};

await raceRepository.createEntity("PlayerCharacter", pcA, { type: "Campaign", id: raceCampaign.id, field: "party" });

const reloadedRaceCampaign = (await raceRepository.loadRootCollection("campaigns"))[0] as typeof raceCampaign;
const partyIds = (reloadedRaceCampaign.party as typeof pcA[]).map((member) => member.id).sort();
assert.deepEqual(partyIds, [pcA.id, pcB.id].sort(), "Both concurrently-linked children must survive the retry");

console.log("Repository round-trip tests passed.");
