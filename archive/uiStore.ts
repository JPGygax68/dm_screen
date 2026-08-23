import { defineStore } from 'pinia';
import schema from '../generated/models/data.schema.json';

//const pcSchema = { ...schema.$defs.PlayerCharacter, $defs: schema.$defs };

export const useUiStore = defineStore('ui', {
  state: () => ({
    //openCampaignAccordions: [] as string[]
  }),

  actions: {
    // setOpenCampaignAccordions(accordionIds: string[]) {
    //   console.log('Setting open campaign accordions:', accordionIds);
    //   this.openCampaignAccordions = accordionIds;
    // },
  }
});

export default useUiStore;
