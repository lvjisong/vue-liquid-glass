/**
 * ============================================================
 * store/index.js —— Vuex 4 全局状态（登录态 + 通用持久化）
 * ------------------------------------------------------------
 * 全局唯一 store，被 main.js 的 app.use(store) 注册。
 * 约定：
 *   - 需要跨页共享/刷新不丢的状态放这里，用 createPersist(key) 持久化。
 *   - key 用语义化命名（app_user / app_prefs），不用拼音缩写。
 *   - fetchUser / logout 留 TODO-AUTH，接后端后换成真实 axios 调用。
 * ============================================================
 */
import { createStore } from "vuex";
import { createPersist } from "@/utils/persist";

// 每个需要持久化的模块声明一个 persist 实例（key 用模块语义命名）
const persistUser = createPersist("app_user", null);

export default createStore({
  state: {
    user: null,
    token: "",
    // 示例：需要刷新不丢的数据，初始化时用 persist.load() 读回
    // userPrefs: persistPrefs.load(),
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
      // 变更后立刻持久化，刷新页面不丢
      persistUser.save(user);
    },
    SET_TOKEN(state, token) {
      state.token = token;
    },
    RESET_AUTH(state) {
      state.user = null;
      state.token = "";
      persistUser.clear();
    },
  },
  actions: {
    // TODO-AUTH: 接后端后替换为真实 axios 调用（fetchUser / logout）
    async fetchUser() {},
    async logout({ commit }) {
      commit("RESET_AUTH");
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.user || !!state.token,
  },
});
