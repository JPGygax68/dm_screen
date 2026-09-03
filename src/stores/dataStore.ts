export type EncounterStatus = "Draft" | "Ready" | "Running" | "Completed";

export function getEncounterStatusInEnglish(status: EncounterStatus) {
  switch (status) {
    case "Draft":
      return "Draft";
    case "Ready":
      return "Ready";
    case "Running":
      return "Running";
    case "Completed":
      return "Completed";
    default:
      return "Unknown";
  }
}

import { defineStore } from 'pinia'
import { ref, watch, toRaw } from 'vue'
import { db, saveCampaignToDisk, getAllCampaignsFromDisk, destroyAndRecreateDatabase } from '@/db/dmScreenDb'
import testCampaigns from './test-campaigns'
import { parse } from 'yaml'
import _ from 'lodash'

export const useDmScreenStore = defineStore('campaigns_master', () => {
  // --- STATE LAYER ---
  const allCampaigns = ref<any[]>([])       // DM Screen data: all available campaigns
  const currentCampaign = ref<any>({})      // The active campaign document being explored
  const currentEncounter = ref<any>({})     // The active encounter document being explored

  const bestiary = ref<any[]>([]);

  // Single generic sandbox cache slot, pre-hydrated on F5 reload
  const cachedDraft = localStorage.getItem('dnd_active_draft')
  const activeDraft = ref(cachedDraft ? JSON.parse(cachedDraft) : null)

  // --- AUTOMATED WATCHERS (PERFORMANCE SECURED) ---

  // 1. LocalStorage Draft Synchronizer
  watch(activeDraft, (newDraft) => {
    if (newDraft) {
      localStorage.setItem('dnd_active_draft', JSON.stringify(newDraft))
    } else {
      localStorage.removeItem('dnd_active_draft')
    }
  }, { deep: true })

  // 2. Debounced PouchDB Disk Writer
  // Clones and serializes data EXACTLY ONCE when the DM pauses typing for 300ms
  const debouncedDiskSave = _.debounce(async () => {
    if (!currentCampaign.value) return
    const snapshot = structuredClone(toRaw(currentCampaign.value))
    await saveCampaignToDisk(snapshot)
    console.log(`💾 Disk committed snapshot for: ${snapshot.name}`)
  }, 300)

  // watch(allCampaigns, (newData) => {
  //   if (newData) {
  //     debouncedDiskSave(newData)
  //   }
  // }, { deep: true })

  return {
    allCampaigns,
    currentCampaign,
    currentEncounter,
    bestiary,
    cachedDraft,
    activeDraft,
    loadBestiary,
    loadAllCampaigns,
    selectCampaign,
    removeCampaign,
    startNewEntity,
    loadExistingEntityIntoDraft,
    commitDraft,
    forceOverwriteDatabaseWithTestingData
  }

  // --- PRODUCTION ACTIONS ---

  async function loadBestiary() {
    if (bestiary.value?.length) return bestiary.value;

    try {
      const response = await fetch('/assets/bestiary/bestiary.yaml');
      if (!response.ok) {
        throw new Error(`Failed to fetch bestiary: ${response.status}`);
      }

      const text = await response.text();
      const parsed = parse(text);
      bestiary.value = Array.isArray(parsed) ? parsed : [];
      return bestiary.value;
    } catch (error) {
      bestiary.value = [];
    }
  }

  async function loadAllCampaigns() {
    allCampaigns.value = await getAllCampaignsFromDisk()
  }

  function selectCampaign(campaignId: string) {
    const campaign = allCampaigns.value.find(c => c.id === campaignId) || null
    currentCampaign.value = campaign
  }

  function removeCampaign(campaignId: string) {
    const idx = allCampaigns.value.findIndex(c => c.id === campaignId)
    if (idx > -1) allCampaigns.value.splice(idx, 1)
    if (currentCampaign.value?.id === campaignId) currentCampaign.value = null
  }

  // Initialize a pristine document skeleton into the sandbox wrapper
  function startNewEntity(type: string) {
    activeDraft.value = {
      id: crypto.randomUUID(),
      type: type, // e.g. 'npc', 'location', 'encounter'
      isNew: true,
      name: ''
    }
    return activeDraft.value.id
  }

  // Deep clone an existing document into the sandbox wrapper
  function loadExistingEntityIntoDraft(entityId: string, type: string) {
    if (!currentCampaign.value) return

    let existing = null
    if (type === 'campaign') existing = allCampaigns.value.find(c => c.id === entityId);
    if (type === 'encounter') existing = currentCampaign.value.encounters?.find((e: any) => e.id === entityId)
    if (type === 'combatant') existing = currentEncounter.value.enemies?.find((e: any) => e.id === entityId)

    if (existing) {
      activeDraft.value = {
        ...structuredClone(toRaw(existing)),
        type: type,
        isNew: false
      }
    }
  }

  // Cross the threshold gate into production records
  function commitDraft() {
    if (!activeDraft.value || !currentCampaign.value) return

    const entity = { ...activeDraft.value }
    const type = entity.type
    delete entity.type
    delete entity.isNew

    if (activeDraft.value.isNew) {
      // SCENARIO A: Push fresh creation
      if (type === 'campaign') allCampaigns.value.push(entity)
      if (type === 'encounter') {
        currentCampaign.value.encounters = currentCampaign.value.encounters || [];
        currentCampaign.value.encounters.push(entity);
      }
    } else {
      // SCENARIO B: Replace old record values
      if (type === 'campaign') {
        const idx = allCampaigns.value.findIndex((c: any) => c.id === entity.id)
        if (idx > -1) allCampaigns.value[idx] = entity
      }
      if (type === 'encounter') {
        const idx = currentCampaign.value.encounters.findIndex((c: any) => c.id === entity.id)
        if (idx > -1) currentCampaign.value.encounters[idx] = entity
      }
      if (type === 'combatant') {
        const idx = currentEncounter.value.enemies.findIndex((e: any) => e.id === entity.id)
        if (idx > -1) currentEncounter.value.enemies[idx] = entity
      }
    }

    activeDraft.value = null // Wipes sandbox and triggers the PouchDB watch loop
  }

  function discardDraft() {
    activeDraft.value = null
  }

  // --- TESTING HARNESS OVERWRITE UTILITY ---
  async function forceOverwriteDatabaseWithTestingData() {
    console.warn('⚠️ Purging local instance and resetting test data streams...')

    // 1. Physically destroy the disk instance to clear out any bad indices
    await destroyAndRecreateDatabase()

    // 2. Insert your Mock JSON Array
    const bulkInsertPayload = testCampaigns.map(campaign => ({
      _id: campaign.id,
      ...campaign
    }))


    // Write the pristine testing array down to the clean database
    await db.bulkDocs(bulkInsertPayload)

    // 3. Clear reactive states to isolate fields from old memory traces
    activeDraft.value = null
    currentCampaign.value = null

    // 4. Rehydrate the UI array instantly
    await loadAllCampaigns()
    console.log('✅ Local store and database successfully re-seeded.')
  }
})

export default useDmScreenStore;
