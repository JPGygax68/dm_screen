import { createApp } from 'vue';
import { IonicVue } from '@ionic/vue';

import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

import './styles/main.scss';
import App from './App.vue';

const THEME_STORAGE_KEY = 'dm-screen-theme';
const VALID_THEMES = new Set(['light', 'dark', 'auto']);
const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
const initialTheme = VALID_THEMES.has(storedTheme) ? storedTheme : 'auto';
document.documentElement.dataset.theme = initialTheme;

createApp(App).use(IonicVue).mount('#app');
