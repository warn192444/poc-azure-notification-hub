import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';

const initializeApp = async () => {
  createApp(App).mount('#app');
};

initializeApp();
