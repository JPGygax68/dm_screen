import { assign, setup } from 'xstate';

export const initialCampaignData = {
  name: 'New Campaign',
  party: [],
  encounters: []
};

export const campaignEditorMachine = setup({
  actions: {
    setFormData: assign({
      campaignData: ({ event }) => event.data
    }),
    setFormErrors: assign({
      formErrors: ({ event }) => Array.isArray(event.errors) ? event.errors : []
    }),
    resetCampaignData: assign({
      campaignData: () => ({ ...initialCampaignData }),
      formErrors: () => []
    })
  }
}).createMachine({
  id: 'campaign-editor',
  initial: 'editing',
  context: {
    campaignData: { ...initialCampaignData },
    formErrors: []
  },
  states: {
    editing: {
      on: {
        FORM_CHANGED: {
          actions: ['setFormData', 'setFormErrors']
        },
        RESET_CAMPAIGN: {
          actions: ['resetCampaignData']
        }
      }
    }
  }
});
