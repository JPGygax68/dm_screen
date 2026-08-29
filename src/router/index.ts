import CampaignListView from '../views/CampaignList.vue';
import CampaignEditor from '../views/CampaignEditor.vue';
import CharacterSheetView from '../views/CharacterSheetView.vue';
import EncounterEditor from '../views/EncounterEditor.vue';
import EncounterList from '../views/EncounterList.vue';
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
    name: 'campaign-new',
    component: CampaignEditor
  },
  {
    path: '/campaigns/:id',
    name: 'campaign-edit',
    component: CampaignEditor
  },
  {
    path: '/campaigns/:id/characters/new',
    name: 'campaign-character-new',
    component: CharacterSheetView
  },
  {
    path: '/campaigns/:id/characters/:characterId',
    name: 'campaign-character-edit',
    component: CharacterSheetView
  },
  {
    path: '/campaigns/:campaignId/encounters',
    name: 'campaign-encounters',
    component: EncounterList
  },
  {
    path: '/campaigns/:campaignId/encounters/:encounterId/edit',
    name: 'campaign-encounter-edit',
    component: EncounterEditor
  }
];

export default routes;