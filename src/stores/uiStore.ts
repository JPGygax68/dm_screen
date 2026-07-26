import { defineStore } from 'pinia';
import schema from '../generated/models/data.schema.json';

export const useUiStore = defineStore('ui', {
  state: () => ({
    campaignDraft: null as null | { name: string; description: string },
  }),

  actions: {
    startCampaignDraft() {
      console.log('Starting new campaign draft');
      this.campaignDraft = {
        name: '(New Campaign)',
        description: '',
      };
      return this.campaignDraft;
    },

    clearCampaignDraft() {
      this.campaignDraft = null;
    }
  }
});
