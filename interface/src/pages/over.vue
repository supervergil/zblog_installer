<template>
  <div class="page-over">
    <h1 class="page-over__title">zblog安装完成</h1>
    <div class="page-over__notion" v-if="$store.state.server.domain===''">
      请访问
      <a :href="'http://'+$store.state.server.ip" target="_blank">{{$store.state.server.ip}}</a>
    </div>
    <div class="page-over__notion" v-else>
      请访问
      <a
        :href="'http://'+$store.state.server.domain"
        target="_blank"
      >{{$store.state.server.domain}}</a>
    </div>
  </div>
</template>

<script>
export default {
  name: "over",
  layout: "full",
  data() {
    return {};
  },
  created() {},
  methods: {}
};
</script>

<style lang="scss" scoped>
.page-over {
  text-align: center;
  &__title {
    color: #409eff;
    font-size: 45px;
  }
  &__notion {
    margin: auto;
    font-size: 16px;
    color: #999;
  }
}
</style>
