/**
 * ============================================================
 * babel.config.js —— Babel 编译配置
 * ------------------------------------------------------------
 * Vue CLI 5 默认用 @vue/cli-plugin-babel/preset，无需手写 preset。
 * Element Plus 走全量引入，不需要 babel-plugin-component 按需加载；
 * 若后续要按需引入，改走 unplugin-vue-components，不要加 babel 插件。
 * ============================================================
 */
module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  // Element Plus 不需要 babel-plugin-component 按需加载，
  // 全量引入或用 unplugin-vue-components 自动按需（当前用全量引入）。
};
