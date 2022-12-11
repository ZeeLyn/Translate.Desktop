import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import http from "@zeelyn/http";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import zh_Cn from "element-plus/es/locale/lang/zh-cn";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { createPinia } from "pinia";
const app = createApp(App);
app.config.globalProperties.$http = http;
app.use(ElementPlus, {
    locale: zh_Cn,
    // size: "small",
});
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
app.use(createPinia());
app.use(router).mount("#app");
