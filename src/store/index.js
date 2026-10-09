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
