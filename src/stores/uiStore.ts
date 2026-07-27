import { defineStore } from 'pinia';
import schema from '../generated/models/data.schema.json';

export const useUiStore = defineStore('ui', {
  state: () => ({
    campaignDraft: null as null | { id: string; name: string; description: string },
    openCampaignAccordionId: null as null | string
  }),

  actions: {
    startCampaignDraft() {
      console.log('Starting new campaign draft');
      if (!this.campaignDraft) {
        this.campaignDraft = {
          id: crypto.randomUUID(),
          name: '',
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
