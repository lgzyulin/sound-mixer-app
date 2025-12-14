// src/main.js
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { inject } from "@vercel/analytics";

// 导入全局样式
import "./assets/styles/index.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.mount("#app");

// Initialize Vercel Web Analytics
inject();
