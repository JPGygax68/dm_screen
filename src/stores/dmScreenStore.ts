import { defineStore } from 'pinia';

export const useDmScreenStore = defineStore('dmscreen', {
  state: () => ({
    campaigns: [
      { name: 'Campaign 1', description: '' },
      { name: 'Campaign 2 - heroes!', description: '' },
      { name: 'Campaign 3', description: '' }
    ],
  }),
  actions: {

    updateByPath(path: string, value: any) {
      console.log('Updating path:', path, 'with value:', value);
      this.$patch(state => {
        const { parent, key } = resolvePath(state, path);
        parent[key] = value;
        console.log(parent[key], 'updated to', value);
      });
    },

    pushByPath(path: string, item: any) {
      this.$patch(state => {
        const { parent, key } = resolvePath(state, path);
        parent[key].push(item);
      });
    },

    removeByPath(path: string, index: number) {
      this.$patch(state => {
        const { parent, key } = resolvePath(state, path);
        parent[key].splice(index, 1);
      });
    },
  }
});

export default useDmScreenStore;

//-----------------------

function resolvePath(root: any, path: string) {
  console.log('Resolving path:', path, 'on root:', root);
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
