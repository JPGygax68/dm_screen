// db/campaignStore.js
import PouchDB from 'pouchdb'

// Creates or opens a single client-side database file
export const db = new PouchDB('dnd_campaigns_master')

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
