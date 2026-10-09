import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import store from "@/store";

// Element Plus（Vue 3 版组件库）
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

// 全局样式入口（reset + 变量 + mixins）+ 主题变量（跟随系统深浅色）
import "@/styles/main.scss";
import "@/styles/theme.scss";

const app = createApp(App);

// ======== 全局错误捕获（生产必备） ========
// 组件渲染/事件/生命周期出错都会在这里被捕获，避免用户白屏、开发找不到错
app.config.errorHandler = (err, vm, info) => {
  console.error("【全局错误】", err);
  console.error("【出错位置】", info); // "render function" / "event handler" / "created hook"
  // TODO-PRODUCTION: 接后端后上报监控系统（如 Sentry.captureException）
};

// 全局警告（开发环境有用，生产可删）
app.config.warnHandler = (msg, vm, trace) => {
  console.warn("【Vue 警告】", msg);
  console.warn("【组件栈】", trace);
};

app.use(router);
app.use(store);
app.use(ElementPlus);
app.mount("#app");
