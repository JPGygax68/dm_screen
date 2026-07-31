import { defineStore } from 'pinia';

export const useDmScreenStore = defineStore('dmscreen', {
  state: () => ({
    campaigns: [
      { id: '123', name: 'Campaign 1', description: '' },
      { id: '456', name: 'Campaign 2 - heroes!', description: '' },
      { id: '789', name: 'Campaign 3', description: '' }
    ],
  }),
  actions: {

    updateByPath(path: string, value: any) {
      //console.log('Updating path:', path, 'with value:', value);
      this.$patch(state => {
        const { parent, key } = resolvePath(state, path);
        parent[key] = value;
        //console.log(parent[key], 'updated to', value);
      });
    },

    addOrUpdateCampaign(campaign: any) {
      console.log('Adding or updating campaign:', campaign);
      this.$patch(state => {
        const index = state.campaigns.findIndex(c => c.id === campaign.id);
        if (index !== -1) {
          // Update existing campaign
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
    }
  }
});

export default useDmScreenStore;

//-----------------------

function resolvePath(root: any, path: string) {
  //console.log('Resolving path:', path, 'on root:', root);
  const segments = path.split('/');
  let obj: any = root; // TODO: use a type obtained from the schema to type this properly

  for (let i = 0; i < segments.length - 1; i++) {
    obj = obj[segments[i]];
    if (obj === undefined) {
      throw new Error(`Invalid path: ${path}`);
    }
  }

  return { parent: obj, key: segments[segments.length - 1] };
}
