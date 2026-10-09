<template>
  <!-- 首页：占位模板，按业务替换 -->
  <div class="home-page">
    <h1>Vue 3 + Element Plus 工程化模板</h1>
    <p>脚手架、路由、登录态、request、SCSS、部署均已配好。</p>
    <el-button type="primary">Element Plus 按钮示例</el-button>
  </div>
</template>

<script>
export default {
  name: "Home",
  components: {},
  props: {},
  data() {
    return {};
  },
  computed: {},
  methods: {},
};
</script>

<style scoped lang="scss">
.home-page {
  @include flex-center;
  flex-direction: column;
  min-height: 60vh;
  gap: 16px;
}
</style>
