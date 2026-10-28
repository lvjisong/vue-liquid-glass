/**
 * ============================================================
 * vite-plugin-vue-app-env —— 让 Vite 暴露 VUE_APP_ 前缀的环境变量
 * ------------------------------------------------------------
 * 背景：原项目用 Vue CLI，环境变量写 process.env.VUE_APP_XXX。
 *       Vite 默认只暴露 VITE_ 前缀的变量，为了沿用既有的
 *       .env.development / .env.production / .env.staging 命名与
 *       VUE_APP_ 前缀约定，这里把 VUE_APP_ 加入 envPrefix。
 *
 * 说明：业务代码已改用 import.meta.env.VUE_APP_XXX
 *      （Vite dev 模式不会替换 process.env.*，故不能用 process.env）。
 *
 * 用法：vite.config.js 里放进 plugins：
 *       plugins: [vue(), vueAppEnv()]
 * ============================================================
 */
export default function vueAppEnv(options = {}) {
  const prefix = options.prefix || "VUE_APP_";

  return {
    name: "vite-plugin-vue-app-env",
    config() {
      return {
        // import.meta.env.VUE_APP_XXX 可用
        envPrefix: [prefix],
      };
    },
  };
}
