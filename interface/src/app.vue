<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "app",
  created() {}
};
</script>

<style lang="scss">
html {
  padding: 0;
  margin: 0;
  height: 100%;
}
body {
  padding: 0;
  margin: 0;
  height: 100%;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
}
* {
  box-sizing: border-box;
}
#app {
  height: 100%;
}
</style>
