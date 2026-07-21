import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue'; // Your current view with App.vue layout
import CampaignDetailView from '@/views/CampaignDetailView.vue'; // The new detail view

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AppFormView
    },
    {
      path: '/campaigns/:index',
      name: 'campaign-detail',
      component: CampaignDetailView,
      props: true // Automatically passes ':index' as a prop to the component
    }
  ]
});

export default router;
