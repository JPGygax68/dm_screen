// db/campaignStore.js
import PouchDB from 'pouchdb'

// Creates or opens a single client-side database file
export let db = new PouchDB('dnd_campaigns_master')

// Mainly useful while developing or for bulk updates of all campaigns
export async function saveEverythingToDisk(all: any[]) {
  const bulkInsertPayload = all.map(campaign => ({ _id: campaign.id, ...campaign }))
  try {
    await db.bulkDocs(bulkInsertPayload)
  } catch (err) {
    console.error('Failed to save everything to storage:', err)
  }
}

// For now, this is identical to saveEverythingToDisk()
export async function saveAllCampaignsToDisk(campaigns: any[]) {
  const bulkInsertPayload = campaigns.map(campaign => ({ _id: campaign.id, ...campaign }))
  try {
    await db.bulkDocs(bulkInsertPayload)
  } catch (err) {
    console.error('Failed to save everything to storage:', err)
  }
}

// Save or overwrite an entire campaign document
export async function saveCampaignToDisk(campaign: any) {
  const doc = { _id: campaign.id, ...campaign }
  try {
    const existing = await db.get(campaign.id)
    doc._rev = existing._rev // PouchDB revision token mapping
  } catch (err) {
    // Document is brand new, safe to write without revision matching
  }
  return await db.put(doc)
}

// Fetch all campaigns saved on the device disk
export async function getAllCampaignsFromDisk() {
  try {
    const result = await db.allDocs({ include_docs: true })
    return result.rows.map(row => row.doc)
  } catch (err) {
    console.error('Failed to read local campaign disk:', err)
    return []
  }
}

export async function destroyAndRecreateDatabase() {
  // Completely drops the IndexedDB instance from the browser disk
  await db.destroy() 
  
  // Instantiates a pristine, empty instance under the exact same namespace
  db = new PouchDB('dnd_campaigns_master') 
}