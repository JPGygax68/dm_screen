import { defineStore } from 'pinia';

export const useDmScreenStore = defineStore('dmscreen', {
  state: () => ({
    data: {
      Campaigns: [],
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