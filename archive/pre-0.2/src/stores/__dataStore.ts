// stores/useDmScreenStore.ts
import { defineStore } from 'pinia'
import { ref, watch, toRaw } from 'vue'
import { db, saveCampaignToDisk, getAllCampaignsFromDisk, destroyAndRecreateDatabase } from '@/db/dmScreenDb'
import testCampaigns from './test-campaigns'
import { parse } from 'yaml'
import _ from 'lodash'

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

export const useDmScreenStore = defineStore('campaigns_master', () => {
  // --- STATE LAYER ---
  const allCampaigns = ref<any[]>([])       // DM Screen data: all available campaigns
  const currentCampaign = ref<any>({})      // The active campaign document being explored
  const currentEncounter = ref<any>({})     // The active encounter document being explored
  const bestiary = ref<any[]>([])

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
  const debouncedDiskSave = _.debounce(async (campaignToSave) => {
    if (!campaignToSave || !campaignToSave.id) return
    
    const snapshot = structuredClone(toRaw(campaignToSave))
    await saveCampaignToDisk(snapshot)
    console.log(`💾 Disk committed snapshot for: ${snapshot.name}`)
  }, 300)

  // Explicitly watch the active campaign tree for auto-saves
  watch(currentCampaign, (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      debouncedDiskSave(newData)
    }
  }, { deep: true })


  // --- PRODUCTION ACTIONS (MOVED ABOVE RETURN) ---

  async function loadBestiary() {
    if (bestiary.value?.length) return bestiary.value

    try {
      const response = await fetch('/assets/bestiary/bestiary.yaml')
      if (!response.ok) {
        throw new Error(`Failed to fetch bestiary: ${response.status}`)
      }

      const text = await response.text()
      const parsed = parse(text)
      bestiary.value = Array.isArray(parsed) ? parsed : []
      return bestiary.value
    } catch (error) {
      bestiary.value = []
      return []
    }
  }

  async function loadAllCampaigns() {
    allCampaigns.value = await getAllCampaignsFromDisk()
  }

  function selectCampaign(campaignId: string) {
    const campaign = allCampaigns.value.find(c => c.id === campaignId) || {}
    currentCampaign.value = campaign
  }

  function removeCampaign(campaignId: string) {
    const idx = allCampaigns.value.findIndex(c => c.id === campaignId)
    if (idx > -1) allCampaigns.value.splice(idx, 1)
    if (currentCampaign.value?.id === campaignId) currentCampaign.value = {}
  }

  function startNewEntity(type: string) {
    activeDraft.value = {
      id: crypto.randomUUID(),
      type: type, // 'campaign', 'encounter', 'combatant'
      isNew: true,
      name: ''
    }
    return activeDraft.value.id
  }

  // Deep clone an existing document into the sandbox wrapper
  function loadExistingEntityIntoDraft(entityId: string, type: string) {
    let existing = null
    if (type === 'campaign') existing = allCampaigns.value.find(c => c.id === entityId)
    if (type === 'encounter' && currentCampaign.value) existing = currentCampaign.value.encounters?.find((e: any) => e.id === entityId)
    if (type === 'combatant' && currentEncounter.value) existing = currentEncounter.value.enemies?.find((e: any) => e.id === entityId)

    if (existing) {
      activeDraft.value = {
        ...structuredClone(toRaw(existing)),
        type: type,
        isNew: false
      }
    }
  }

  function commitDraft() {
    if (!activeDraft.value) return

    const entity = { ...activeDraft.value }
    const type = entity.type
    delete entity.type
    delete entity.isNew

    if (activeDraft.value.isNew) {
      // SCENARIO A: Fresh creation
      if (type === 'campaign') {
        allCampaigns.value.push(entity)
        // Immediately trigger a disk write for a new root campaign
        debouncedDiskSave(entity)
      }
      if (type === 'encounter' && currentCampaign.value) {
        if (!currentCampaign.value.encounters) currentCampaign.value.encounters = []
        currentCampaign.value.encounters.push(entity)
      }
    } else {
      // SCENARIO B: Replace old record values
      if (type === 'campaign') {
        const idx = allCampaigns.value.findIndex((c: any) => c.id === entity.id)
        if (idx > -1) {
          allCampaigns.value[idx] = entity
          // Ensure changes to root properties (like campaign name) sync immediately
          debouncedDiskSave(entity)
        }
      }
      if (type === 'encounter' && currentCampaign.value) {
        const idx = currentCampaign.value.encounters.findIndex((c: any) => c.id === entity.id)
        if (idx > -1) currentCampaign.value.encounters[idx] = entity
      }
      if (type === 'combatant' && currentEncounter.value) {
        if (!currentEncounter.value.enemies) currentEncounter.value.enemies = []
        const idx = currentEncounter.value.enemies.findIndex((e: any) => e.id === entity.id)
        if (idx > -1) currentEncounter.value.enemies[idx] = entity
      }
    }

    activeDraft.value = null // Wipes sandbox, triggers watchers safely
  }

  function discardDraft() {
    activeDraft.value = null
  }

  async function forceOverwriteDatabaseWithTestingData() {
    console.warn('⚠️ Purging local instance and resetting test data streams...')

    // Destroy local DB instance completely to prevent index collision errors
    await destroyAndRecreateDatabase()

    // Map your mock array into PouchDB documents
    const bulkInsertPayload = testCampaigns.map(campaign => ({
      _id: campaign.id,
      ...campaign
    }))

    await db.bulkDocs(bulkInsertPayload)

    // Clear memory scopes cleanly
    activeDraft.value = null
    currentCampaign.value = {}
    currentEncounter.value = {}

    // Synchronize UI values with pristine disk records
    await loadAllCampaigns()
    console.log('✅ Local store and database successfully re-seeded.')
  }

  // --- EXPLICIT EXPORTS GATE (CLEANLY EVALUATED LAST) ---
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
    discardDraft,
    forceOverwriteDatabaseWithTestingData
  }
})

export default useDmScreenStore;
