/**
 * ============================================================
 * utils/auth.js —— 登录态统一入口（Cookie 持久化 + Vuex 兜底）
 * ------------------------------------------------------------
 * 全项目唯一允许读写 token 的地方：组件、路由守卫、request 拦截器
 * 一律调本文件的方法，禁止直接碰 Cookie / localStorage。
 *   - getToken()/setToken()/getRefreshToken()/logout()
 *   - isLoggedIn()：Cookie 有 token 或 refresh_token 即视为已登录。
 * 接后端：登录成功后调 setToken() 再 dispatch('fetchUser')；
 *        401 拦截器调 logout() 后跳登录页。
 * ============================================================
 */
import store from "@/store";

const TOKEN_KEY = "app_token";
const REFRESH_TOKEN_KEY = "app_refresh_token"; // 后端支持 refresh_token 时用

// ---- Cookie 小工具（无依赖，可按需换 js-cookie）----
function setCookie(name, value, days = 7) {
  const d = new Date();
  d.setTime(d.getTime() + days * 864e5);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}
function getCookie(name) {
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : "";
}
function delCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

export default {
  isLoggedIn() {
    return !!this.getToken() || !!this.getRefreshToken();
  },
  getToken() {
    return getCookie(TOKEN_KEY) || store.state.token;
  }, // Cookie 优先，Vuex 兜底
  setToken(t) {
    setCookie(TOKEN_KEY, t);
  },
  getRefreshToken() {
    return getCookie(REFRESH_TOKEN_KEY) || "";
  },
  logout() {
    delCookie(TOKEN_KEY);
    delCookie(REFRESH_TOKEN_KEY);
  },
};
