const routes = [
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
    path: '/campaigns/:id',
    name: 'campaigns-detail',
    component: CampaignDetailView
  }
];

export default routes;