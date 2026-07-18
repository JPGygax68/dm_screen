import { defineStore } from 'pinia';

export const useDmScreenStore = defineStore('dmscreen', {
  state: () => ({
    data: {},
    formErrors: []
  }),
  actions: {
    update(change: { data: {}; }) {
      console.log('Store update:', change);
      this.data = change.data;
    },
  }
});

export default useDmScreenStore;