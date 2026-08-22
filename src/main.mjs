import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css';
import { createPinia } from 'pinia';

import './styles/tailwind.css';
import './styles/theme/variables.scss';
import './styles/theme/rpg-components.scss';
import './styles/main.scss';

import App from './App.vue';
import routes from './router';

const THEME_STORAGE_KEY = 'dm-screen-theme';
const VALID_THEMES = new Set(['light', 'dark', 'auto']);
const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
const initialTheme = VALID_THEMES.has(storedTheme) ? storedTheme : 'light';
document.documentElement.dataset.theme = initialTheme;
document.documentElement.style.colorScheme = initialTheme === 'dark' ? 'dark' : 'light';

const router = createRouter({
  history: createWebHistory(),
  routes: routes
});

const app = createApp(App)
  .use(router)
  .use(createPinia())
  .use(PrimeVue, {
    unstyled: true,
    theme: {
      preset: Aura,
      options: {
        prefix: 'p',
        darkModeSelector: '[data-theme="dark"]',
        cssLayer: false
      }
    }
  });

await router.isReady();
app.mount('#app');
