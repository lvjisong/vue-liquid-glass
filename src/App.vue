<template>
  <!-- 根组件：挂载路由出口 + 路由切换进度条 -->
  <div id="app">
    <!-- 切换路由时顶部显示加载反馈 -->
    <div v-if="routeLoading" class="route-progress-bar"></div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return { routeLoading: false };
  },
  computed: {},
  methods: {},
};
</script>

<style lang="scss">
/* 全局：reset + 主题已由 main.js 引入，这里只放布局级样式 */

/* 路由切换顶部进度条 */
.route-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  z-index: 9999;
  background: linear-gradient(90deg, #0071e3, #42a5f5); /* 示例色，按项目品牌色替换 */
  animation: route-progress 0.3s ease-out;
}
@keyframes route-progress {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
