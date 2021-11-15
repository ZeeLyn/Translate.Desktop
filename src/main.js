import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import request from "@g1100100/rest.request"

const app = createApp(App);
app.config.globalProperties.$http = request;
app.use(router).mount('#app');