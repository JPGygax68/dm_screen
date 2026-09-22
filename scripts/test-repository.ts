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

console.log("Repository round-trip tests passed.");
