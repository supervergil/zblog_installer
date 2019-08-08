<template>
  <div class="page-welcome">
    <h1 class="page-welcome__title">欢迎进入ZBLOG安装程序</h1>
    <div class="page-welcome__notion">
      <p>安装前需要准备：</p>
      <p>1. 一台可远程连接的linux服务器，操作系统为centos7（其他操作系统暂未适配）</p>
      <p>2. 网站域名（可选），如果没有域名可暂时使用公网ip访问</p>
      <p style="text-align: center;">
        <img src="@/assets/image/qrcode.jpg" class="page-welcome__qrcode" />
      </p>
      <p style="text-align: center;">
        <small>如果zblog安装和使用过程中有任何问题可及时反馈</small>
      </p>
    </div>
    <div class="page-welcome__btn">
      <el-button type="primary" @click="$router.push('/server')">进入安装</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "welcome",
  layout: "full",
  data() {
    return {};
  },
  created() {},
  methods: {}
};
</script>

<style lang="scss" scoped>
.page-welcome {
  text-align: center;
  &__title {
    color: #409eff;
    font-size: 45px;
  }
  &__notion {
    margin: auto;
    width: 600px;
    font-size: 16px;
    color: #999;
    text-align: left;
  }
  &__qrcode {
    margin: auto;
    width: 200px;
  }
  &__btn {
    margin-top: 10px;
  }
}
</style>
