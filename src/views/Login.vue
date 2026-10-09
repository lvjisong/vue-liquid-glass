<template>
  <!-- 登录页：TODO-AUTH 接后端后补真实登录逻辑 -->
  <div class="login-page">
    <h2>登录</h2>
    <el-input v-model="username" placeholder="用户名" />
    <el-input v-model="password" type="password" placeholder="密码" show-password />
    <el-button type="primary" @click="handleLogin">登录</el-button>
  </div>
</template>

<script>
export default {
  name: "Login",
  components: {},
  props: {},
  data() {
    return { username: "", password: "" };
  },
  computed: {},
  methods: {
    handleLogin() {
      // TODO-AUTH: 接后端后调 login 接口，成功 setToken + fetchUser
    },
  },
};
</script>

<style scoped lang="scss">
.login-page {
  @include flex-center;
  flex-direction: column;
  min-height: 60vh;
  gap: 12px;
  max-width: 320px;
  margin: 0 auto;
}
</style>
