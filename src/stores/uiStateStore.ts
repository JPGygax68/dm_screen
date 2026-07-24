import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    activeSlice: 'campaigns',
    activeCampaignIndex: 0,
    // activeSlice: 'campaigns',
    // activeCampaignIndex: -1
  }),

  actions: {
    openCampaign(index: number) {
      console.assert(this.activeSlice === 'campaigns', 'Active slice must be campaigns to open a campaign');
      this.activeSlice = 'campaign';
      this.activeCampaignIndex = index;
    },
    backToList() {
      this.activeSlice = 'campaigns';
      this.activeCampaignIndex = -1;
    }
  }
});
