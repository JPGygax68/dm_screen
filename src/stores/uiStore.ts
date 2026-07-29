import { defineStore } from 'pinia';
import schema from '../generated/models/data.schema.json';

export const useUiStore = defineStore('ui', {
  state: () => ({
    // TODO: try to obtain a type for the campaign from the schema instead of using 'any'
    campaignDraft: null as any, // used for both creating and editing campaigns
    playerCharacterDraft: null as any, // used for both creating and editing player characters
    openCampaignAccordions: [] as string[]
  }),

  actions: {
    startCampaignDraft() {
      console.log('Starting new campaign draft');
      if (!this.campaignDraft) {
        this.campaignDraft = {
          id: crypto.randomUUID(),
          name: '',
          description: '',
        };
      }
      return this.campaignDraft;
    },

    clearCampaignDraft() {
      console.assert(!!this.campaignDraft, 'No campaign draft to clear');
      console.log('Clearing campaign draft');
      this.campaignDraft = null;
    },

    setOpenCampaignAccordions(ids: string[] | null) {
      console.log('Setting open campaign accordions to:', ids);
      this.openCampaignAccordions = ids ?? [];
    },

    loadCampaignIntoDraft(campaign: any) {
      console.log('Loading campaign draft for campaign ID:', campaign.id);
      this.campaignDraft = { ...campaign };
    },

    removeCharacterFromParty(characterId: string) {
      console.log(`Removing character with ID ${characterId} from campaign draft`);
      console.assert(!!this.campaignDraft, 'No campaign draft to remove character from');
      console.assert(!!this.campaignDraft?.party, 'No party found in campaign draft');
      this.campaignDraft.party = this.campaignDraft.party.filter((char: any) => char.id !== characterId);
    },

    startPlayerCharacterDraft() {
      console.log('Starting new player character draft');
      if (!this.playerCharacterDraft) {
        this.playerCharacterDraft = {
          id: crypto.randomUUID(),
          name: '',
          description: '',
          classes: []
        };
      }
      return this.playerCharacterDraft;
    },
    clearPlayerCharacterDraft() {
      console.assert(!!this.playerCharacterDraft, 'No player character draft to clear');
      console.log('Clearing player character draft');
      this.playerCharacterDraft = null;
    },
  }
});

export default useUiStore;
