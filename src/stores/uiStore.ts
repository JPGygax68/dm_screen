import { defineStore } from 'pinia';
import schema from '../generated/models/data.schema.json';

export const useUiStore = defineStore('ui', {
  state: () => ({
    campaignDraft: null as null | { name: string; description: string },
  }),

  actions: {
    startCampaignDraft() {
      console.log('Starting new campaign draft');
      if (!this.campaignDraft) {
        this.campaignDraft = {
          name: '(New Campaign)',
          description: '',
        };
      }
      return this.campaignDraft;
    },

    clearCampaignDraft() {
      console.assert(!!this.campaignDraft, 'No campaign draft to clear');
      console.log('Clearing campaign draft');
      this.campaignDraft = null;
    }
  }
});
