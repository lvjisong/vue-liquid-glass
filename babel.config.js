module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  // Element Plus 不需要 babel-plugin-component 按需加载，
  // 全量引入或用 unplugin-vue-components 自动按需（当前用全量引入）。
};
