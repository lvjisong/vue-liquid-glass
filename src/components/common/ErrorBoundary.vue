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
