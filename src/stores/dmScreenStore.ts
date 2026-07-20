import { defineStore } from 'pinia';

export const useDmScreenStore = defineStore('dmscreen', {
  state: () => ({
    data: {
      campaigns: [
        { name: 'Campaign 1' },
        { name: 'Campaign 2' },
        { name: 'Campaign 3' }
      ],
    }
  }),
  actions: {
    update(change: { data: any; formErrors: any }) {
      console.log('Store update:', change);
      this.data = change.data;
    },
  }
});

export default useDmScreenStore;