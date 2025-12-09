import './assets/styles/main.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { vClickOutside } from './directives/clickOutside';  

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.directive('click-outside', vClickOutside);

app.mount('#app');
