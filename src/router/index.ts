import CampaignListView from '../views/CampaignListView.vue';
import CampaignCreateView from '../views/CampaignCreateView.vue';
//import CampaignDetailView from '../views/CampaignDetailView.vue';
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
  // {
  //   path: '/campaigns/new',
  //   name: 'campaigns-new',
  //   component: CampaignCreateView
  // },
  // {
  //   path: '/campaigns/:id',
  //   name: 'campaigns-detail',
  //   component: CampaignDetailView
  // }
];

export default routes;