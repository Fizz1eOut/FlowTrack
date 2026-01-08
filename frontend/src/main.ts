import './assets/styles/main.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { useAuthStore } from '@/stores/authStore';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

const authStore = useAuthStore();

await authStore.initialize();

document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible') {
    await authStore.getCurrentUser();
  }
});

app.use(router);
app.mount('#app');
