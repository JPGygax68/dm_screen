import CampaignListView from '../views/CampaignList.vue';
import CampaignCreateView from '../views/CampaignCreate.vue';
import PartyEditor from '../views/PartyEditor.vue';
import PlayerCharacterCreate from '../views/PlayerCharacterCreate.vue';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/campaigns'
  },
  {
    path: '/campaigns',
    name: 'campaigns-list',
    component: CampaignListView
  },
  {
    path: '/campaigns/new',
    name: 'campaigns-new',
    component: CampaignCreateView
  },
  {
    path: '/campaigns/:id/edit',
    name: 'campaigns-detail',
    // TODO: a Campaign is more than just a Party, so we should probably have a CampaignDetailView 
    // that includes the PartyEditor as a sub-component. For now, we'll just use the PartyEditor directly.
    component: PartyEditor
  },
  {
    path: '/campaigns/:id/player-characters/new',
    name: 'player-character-new',
    // TODO: a Campaign is more than just a Party, so we should probably have a CampaignDetailView 
    // that includes the PartyEditor as a sub-component. For now, we'll just use the PartyEditor directly.
    component: PlayerCharacterCreate
  },
];

export default routes;