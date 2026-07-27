import { defineStore } from 'pinia';

export const useDmScreenStore = defineStore('dmscreen', {
  state: () => ({
    campaigns: [
      { id: crypto.randomUUID(), name: 'Campaign 1', description: '' },
      { id: crypto.randomUUID(), name: 'Campaign 2 - heroes!', description: '' },
      { id: crypto.randomUUID(), name: 'Campaign 3', description: '' }
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

    // Dedicated function to add a new campaign to the campaigns array
    // TODO: try to obtain a type for the campaign from the schema instead of using 'any'
    addCampaign(campaign: any) {
      this.$patch(state => {
        state.campaigns = [ campaign, ...state.campaigns];
      });
      console.log('Added new campaign, new list:', this.$state.campaigns);
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
