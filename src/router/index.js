/**
 * 路由配置 + 全局守卫（Vue Router 4 写法）
 * Vue 3 用 createRouter() + createWebHistory() 替代 Vue 2 的 new VueRouter()。
 */
import { createRouter, createWebHistory } from "vue-router";
import auth from "@/utils/auth";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home.vue"), // 懒加载：进入该页才下载对应 JS
    meta: {
      title: "<-- 按项目替换：首页标题 -->",
      description: "<-- 按项目替换：首页描述 -->",
      requireAuth: false, // true 则该页需登录
    },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
    meta: { title: "登录" },
  },
  // ... 更多路由
  // 404 兜底（Vue Router 4 通配符写法）
  { path: "/:pathMatch(.*)*", component: () => import("@/views/NotFound.vue") },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL), // 需 Nginx try_files 配合
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition; // 前进后退保留滚动位置
    return { x: 0, y: 0 }; // 切路由回顶部
  },
});

// ===== SEO：根据路由 meta 更新页面 meta 标签 =====
function updateMeta(to) {
  if (to.meta.title) document.title = to.meta.title;
  for (const [attr, value, prop] of [
    ["name", "description", to.meta.description],
    ["property", "og:title", to.meta.title],
  ]) {
    if (!value) continue;
    let el = document.querySelector(`meta[${attr}="${prop}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, prop);
      document.head.appendChild(el);
    }
    el.setAttribute("content", value);
  }
}

// ===== 全局前置守卫 =====
router.beforeEach((to, from, next) => {
  updateMeta(to); // 1. SEO 更新
  if (to.meta.requireAuth && !auth.isLoggedIn()) {
    next({ name: "Login", query: { redirect: to.fullPath } }); // 未登录跳登录，带回跳地址
    return;
  }
  if (to.name === "Login" && auth.isLoggedIn()) {
    next({ path: "/" }); // 已登录访问登录页 → 首页
    return;
  }
  next();
});

// 全局后置钩子：可埋点 PV
router.afterEach(() => {});

export default router;
