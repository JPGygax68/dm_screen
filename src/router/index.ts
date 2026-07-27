import CampaignListView from '../views/CampaignListView.vue';
import CampaignCreateView from '../views/CampaignCreateView.vue';
import PartyEditor from '../views/PartyEditor.vue';
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
  }
];

export default routes;