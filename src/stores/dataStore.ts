import { defineStore } from 'pinia';

export const useDmScreenStore = defineStore('dmscreen', {
  state: () => ({
    campaigns: [
      // Mock Campaign 1: A rich dataset to test layouts, text truncation, and deep looping
      {
        id: "mock-campaign-1",
        name: "Critical Role: Phandelver",
        description: `A gritty exploration into the Lost Mine. Testing long paragraphs here to see if the accordion text wraps nicely on tablet layouts without breaking line heights.\
          This is a second paragraph to test the wrapping and line height behavior of the accordion text. It should be long enough to wrap onto multiple lines, and we want to ensure\
          that it doesn't break the layout or cause any unexpected overflow issues. The goal is to simulate a real-world scenario where a campaign description might be quite verbose\
          and require careful handling in the UI.`,
        party: [
          {
            id: "pc-1",
            name: "Growl Stormjaw",
            maxHitPoints: 45,
            classes: ["Fighter", "Barbarian"] // Tests your multi-chip rendering logic!
          },
          {
            id: "pc-2",
            name: "Elrond Half-Elven",
            maxHitPoints: 28,
            classes: ["Wizard"]
          }
        ]
      },
      // Mock Campaign 2: An empty dataset to explicitly test your "Empty State" UI screens
      {
        id: "mock-campaign-2",
        name: "Empty Sandbox Campaign",
        description: "No party members here. Used to verify that the 'No characters added yet' text displays cleanly.",
        party: []
      }
    ] as any[],
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
