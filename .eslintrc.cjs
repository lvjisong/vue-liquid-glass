/**
 * ============================================================
 * .eslintrc.js —— ESLint 配置
 * ------------------------------------------------------------
 * 必须用 vue/vue3-essential（Vue3 规则集）！vue/essential 是 Vue2 的，
 * 用它会在 Vue3 项目漏检 Vue3 专属问题（如 beforeDestroy 弃用）。
 * 三方统一（vue-apple-home / vue3-element-plus-app / agent 技能模板）。
 *
 * 【迁移说明】原用 @babel/eslint-parser，迁移到 Vite 后删掉了 babel.config.js，
 * 改用 vue-eslint-parser 内置的 espree 解析器（Vue3 项目官方推荐），
 * 不再依赖 Babel 配置文件。
 * ============================================================
 */
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true, // src 用到 import.meta.env / window / document
  },
  extends: ["plugin:vue/vue3-essential", "eslint:recommended", "plugin:prettier/recommended"],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "espree",
    ecmaVersion: 2022,
    sourceType: "module",
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    // 页面级组件常用单名（Home/Login/About），关闭多词限制
    "vue/multi-word-component-names": "off",
  },
};
