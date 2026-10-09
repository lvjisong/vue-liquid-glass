<!--
============================================================
 src/components/common/ErrorBoundary.vue —— 局部错误边界
------------------------------------------------------------
 包裹可能出错的子树：子组件渲染/生命周期抛错时，这里兜底渲染
 错误提示而不是让整个页面白屏。errorCaptured 返回 false 阻止
 错误继续向上冒泡。使用：<ErrorBoundary><Xxx/></ErrorBoundary>。
 接监控后：在 errorCaptured 里上报错误堆栈。
============================================================
-->
<template>
  <div v-if="hasError" class="error-boundary">
    <h3>页面出错了</h3>
    <p>{{ errorMessage }}</p>
    <button @click="reload">重新加载</button>
  </div>
  <slot v-else />
</template>

<script>
export default {
  name: "ErrorBoundary",
  data() {
    return { hasError: false, errorMessage: "" };
  },
  errorCaptured(err) {
    this.hasError = true;
    this.errorMessage = err.message || "发生未知错误";
    // 可选：上报错误
    return false; // 阻止继续向上传播
  },
  methods: {
    reload() {
      this.hasError = false;
      this.errorMessage = "";
    },
  },
};
</script>

<style scoped>
.error-boundary {
  text-align: center;
  padding: 40px;
}
</style>
