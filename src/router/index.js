/**
 * ============================================================
 * router/index.js —— 路由配置 + 全局守卫（Vue Router 4）
 * ------------------------------------------------------------
 * 被 main.js 的 app.use(router) 注册，是整个应用的路由入口。
 * 职责：
 *   1. 路由表（页面组件懒加载 import()，404 通配兜底）。
 *   2. beforeEach：按 meta 写页面 title/description（SEO）；
 *      requireAuth 路由未登录跳 Login 并带回跳地址。
 * history 模式部署必须配 Nginx try_files，否则刷新 404。
 * ============================================================
 */
import { createRouter, createWebHistory } from "vue-router";
import auth from "@/utils/auth";

const routes = [
  {
    // 默认进入路由：直接重定向到 Liquid Glass 演示页
    path: "/",
    redirect: "/liquid-glass",
  },
  {
    path: "/liquid-glass",
    name: "LiquidGlass",
    component: () => import("@/views/LiquidGlassDemo.vue"),
    meta: { title: "Liquid Glass Demo" },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
    meta: { title: "登录" },
  },
  {
    path: "/liquid-glass",
    name: "LiquidGlass",
    component: () => import("@/views/LiquidGlassDemo.vue"),
    meta: { title: "Liquid Glass Demo" },
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
