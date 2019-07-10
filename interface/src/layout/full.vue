<template>
  <div class="layout-full">
    <div class="layout-full__top">
      <transition name="el-fade-in" mode="out-in">
        <router-view></router-view>
      </transition>
    </div>
    <div class="layout-full__bottom">广告赞助、业务合作请联系：admin@zhangyangjun.com</div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  }
};
</script>

<style lang="scss" scoped>
.layout-full {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
  overflow: auto;
  padding-bottom: 10px;
  &__top {
    flex: 1;
  }
  &__bottom {
    text-align: center;
    margin-top: 30px;
    color: #666;
    font-size: 13px;
  }
}
</style>
