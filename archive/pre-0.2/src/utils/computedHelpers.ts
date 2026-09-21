export const computedHelpers = {

  campaignSummary: (campaign: { name: string; description?: string}, uischema?: any ) => {
    // console.log('campaignSummary', campaign, uischema);
    return `${campaign.name}: ${campaign.description ?? '(No description)'}`;
  },

  encounterSummary: (encounter: { currentRound: number; combatants: Record<string, any> }) => {
    return `Round ${encounter.currentRound}, ${Object.keys(encounter.combatants).length} combatants`;
  }
};
