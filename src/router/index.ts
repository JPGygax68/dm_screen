import CampaignListView from '../views/CampaignList.vue';
import CampaignEditor from '../views/CampaignEditor.vue';
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
    name: 'campaign-new',
    component: CampaignEditor
  },
  {
    path: '/campaigns/:id/edit',
    name: 'campaign-edit',
    component: CampaignEditor
  },
];

export default routes;