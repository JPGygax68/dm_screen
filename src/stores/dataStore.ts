import { defineStore } from 'pinia';
import { I } from 'vue-router/dist/router-CWoNjPRp.mjs';
import { parse } from 'yaml';
import testCampaigns from './test-campaigns';

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

export const useDmScreenStore = defineStore('dmscreen', {
  state: () => ({
    bestiary: [] as any[],
    bestiaryLoaded: false,
    bestiaryError: null as string | null,
    campaigns: testCampaigns,
  }),
  actions: {

    addOrUpdateCampaign(campaign: any) {
      console.log('Adding or updating campaign:', campaign);
      this.$patch(state => {
        const existingCampaign = this.getCampaignById(campaign.id);
        if (existingCampaign) {
          // Update existing campaign
          const index = state.campaigns.findIndex(c => c.id === campaign.id);
          state.campaigns[index] = campaign;
          console.log('Updated campaign, new list:', this.$state.campaigns);
        } else {
          // Add new campaign
          state.campaigns = [campaign, ...state.campaigns];
          console.log('Added new campaign, new list:', this.$state.campaigns);
        }
      });
    },

    removeCampaign(campaignId: string) {
      this.$patch(state => {
        state.campaigns = state.campaigns.filter(c => c.id !== campaignId);
      });
      console.log('Removed campaign, new list:', this.$state.campaigns);
    },

    // REST Equivalent: GET /campaigns/:id
    getCampaignById(campaignId: string) {
      return this.campaigns.find(c => c.id === campaignId) || null;
    },

    // REST Equivalent: GET /campaigns/:campaignId/encounters/:encounterId
    getEncounterById(campaignId: string, encounterId: string) {
      const campaign = this.getCampaignById(campaignId);
      if (!campaign || !campaign.encounters) return null;

      return campaign.encounters.find((e: any) => e.id === encounterId) || null;
    },

    // REST Equivalent: PUT /campaigns/:campaignId/encounters/:encounterId
    saveEncounter(campaignId: string, finalizedEncounter: any) {
      const campaign = this.getCampaignById(campaignId);
      if (!campaign) throw new Error(`Parent Campaign ${campaignId} not found.`);
      if (!campaign.encounters) campaign.encounters = [];

      const index = campaign.encounters.findIndex((e: any) => e.id === finalizedEncounter.id);

      if (index !== -1) {
        // Update existing item
        campaign.encounters[index] = finalizedEncounter;
      } else {
        // Create brand new resource
        campaign.encounters.push(finalizedEncounter);
      }
    },

    async loadBestiary() {
      if (this.bestiaryLoaded) return this.bestiary;

      try {
        const response = await fetch('/assets/bestiary/bestiary.yaml');
        if (!response.ok) {
          throw new Error(`Failed to fetch bestiary: ${response.status}`);
        }

        const text = await response.text();
        const parsed = parse(text);
        this.bestiary = Array.isArray(parsed) ? parsed : [];
        this.bestiaryLoaded = true;
        this.bestiaryError = null;
        return this.bestiary;
      } catch (error) {
        this.bestiary = [];
        this.bestiaryLoaded = true;
        this.bestiaryError = error instanceof Error ? error.message : 'Unknown bestiary error';
        console.error('Unable to load the bestiary:', error);
        return this.bestiary;
      }
    }
  }
});

export default useDmScreenStore;
