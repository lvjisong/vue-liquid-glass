module.exports = {
  root: true,
  env: {
    node: true,
    browser: true, // src 用到 process.env / window / document
  },
  extends: ["plugin:vue/vue3-essential", "eslint:recommended", "plugin:prettier/recommended"],
  parserOptions: {
    parser: "@babel/eslint-parser",
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    // 页面级组件常用单名（Home/Login/About），关闭多词限制
    "vue/multi-word-component-names": "off",
  },
};
