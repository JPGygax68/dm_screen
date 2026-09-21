import assert from "node:assert/strict";
import { createPinia, setActivePinia } from "pinia";
import dataSchema from "../src/generated/models/data.schema.json" with { type: "json" };
import { configureDataStore, useDataStore } from "../src/stores/data-store.ts";
import { MemoryStorageAdapter } from "../src/domain/persistence/memory-storage-adapter.ts";

setActivePinia(createPinia());
const adapter = new MemoryStorageAdapter();
configureDataStore(dataSchema, adapter);

const store = useDataStore();
await store.load();
assert.deepEqual(store.roots.campaigns, []);

// Draft lifecycle: BeginDraft/UpdateDraft/CommitDraft for a root-level entity.
const campaignDraftId = store.beginDraft("Campaign", { name: "The Sunken Keep" });
assert.ok(store.drafts[campaignDraftId]);
store.updateDraft(campaignDraftId, { description: "A flooded ruin" });
const campaign = await store.commitDraft(campaignDraftId, "Campaign");
assert.equal(store.drafts[campaignDraftId], undefined);
assert.equal(store.roots.campaigns.length, 1);
assert.equal((store.roots.campaigns[0] as { description: string }).description, "A flooded ruin");

// CancelDraft discards without persisting.
const cancelledDraftId = store.beginDraft("PlayerCharacter", { name: "Discarded" });
store.cancelDraft(cancelledDraftId);
assert.equal(store.drafts[cancelledDraftId], undefined);

// Committing a child links it into the parent's reactive collection and into storage.
const pcDraftId = store.beginDraft("PlayerCharacter", { name: "Elandra", maxHitPoints: 30 });
const pc = await store.commitDraft(pcDraftId, "PlayerCharacter", {
  type: "Campaign",
  id: (campaign as { id: string }).id,
  field: "party",
  collection: (campaign as { party: unknown[] }).party
});
assert.equal((campaign as { party: unknown[] }).party.length, 1);
assert.equal(((campaign as { party: unknown[] }).party[0] as { id: string }).id, (pc as { id: string }).id);

// A fresh store instance backed by the same adapter reconstructs the identical nested graph.
setActivePinia(createPinia());
configureDataStore(dataSchema, adapter);
const reloadedStore = useDataStore();
await reloadedStore.load();
assert.equal(reloadedStore.roots.campaigns.length, 1);
const reloadedCampaign = reloadedStore.roots.campaigns[0] as { party: { name: string }[] };
assert.equal(reloadedCampaign.party.length, 1);
assert.equal(reloadedCampaign.party[0].name, "Elandra");

// removeChild unlinks from the in-memory graph and from storage.
const reloadedPcId = (reloadedCampaign as unknown as { party: { id: string }[] }).party[0].id;
await reloadedStore.removeChild("PlayerCharacter", reloadedPcId, {
  type: "Campaign",
  id: (reloadedStore.roots.campaigns[0] as { id: string }).id,
  field: "party",
  collection: reloadedCampaign.party
});
assert.equal(reloadedCampaign.party.length, 0);

console.log("Data store draft lifecycle tests passed.");
