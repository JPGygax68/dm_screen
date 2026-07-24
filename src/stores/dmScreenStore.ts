import { defineStore } from 'pinia';

export const useDmScreenStore = defineStore('dmscreen', {
  state: () => ({
    data: {
      campaigns: [
        { name: 'Campaign 1', description: '' },
        { name: 'Campaign 2', description: '' },
        { name: 'Campaign 3', description: '' }
      ],
      dummy: 'This is a dummy property for testing purposes'
    }
  }),
  actions: {

    updateByPath(path: string, value: any) {
      const { parent, key } = resolvePath(this, path);
      parent[key] = value; // Vue reactivity handles this
    },
    
    updateCampaign(change: any) {
      //console.log('Store update:', change);
      this.data = change.data;
    },
  }
});

export default useDmScreenStore;

//-----------------------

function resolvePath(root: any, path: string) {
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
