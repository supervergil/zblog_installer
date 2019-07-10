<template>
  <div class="page-environment">
    <h1 class="page-environment__title">安装系统环境</h1>
    <div class="page-environment__tip" v-if="launched">
      <i class="fas fa-sync-alt fa-spin fa-fw"></i> 安装可能需要5-10分钟，请耐心等待，安装过程请勿刷新页面或退出浏览器。
    </div>
    <div class="page-environment__launch" v-else>
      <div>
        <i class="fas fa-info-circle fa-fw"></i> 警告：安装可能会覆盖服务器部分文件，请保证服务器没有存留重要数据。如有重要数据，请务必做好备份工作再进行安装！
      </div>
      <div style="margin-top:20px;">
        <el-button type="danger" @click="installLaunched">安装</el-button>
      </div>
    </div>
    <div class="page-environment__status" v-html="statusContent"></div>
    <div style="margin-top: 5px;text-align: center;">
      <el-button type="danger" @click="reInstall" v-if="status===2">重新安装</el-button>
      <el-button type="success" @click="$router.replace('/mysql')" v-if="status===1">去配置数据库</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "environment",
  layout: "full",
  data() {
    return {
      timer: null,
      statusContent: "",
      status: 0,
      launched: false
    };
  },
  created() {
    
  },
  methods: {
    async install() {
      const { status } = await this.$http("post", "/api/environment", {
        data: {
          ip: this.$store.state.server.ip,
          account: this.$store.state.server.account,
          password: this.$store.state.server.password
        }
      });
      if (status === 1) {
        this.repeate();
        // this.$message.success("安装完成，3秒后进入数据库配置页面！");
        // setTimeout(() => {
        //   this.$router.replace("/mysql");
        // }, 3000);
      }
    },
    async checkState() {
      const { status, data } = await this.$http("post", "/api/checkState");
      if (status === 1) {
        this.statusContent = data.content;
        this.status = data.status;
        return data.status == 0;
      }
      return true;
    },
    repeate() {
      this.timer = window.setTimeout(async () => {
        const working = await this.checkState();
        if (!working) {
          window.clearTimeout(this.timer);
          this.timer = null;
        } else {
          this.repeate();
        }
      }, 1000);
    },
    async installLaunched() {
      try {
        await this.$confirm(
          "即将进入安装，请一定备份好你服务器的重要数据！",
          "提示",
          {
            confirmButtonText: "进入安装",
            cancelButtonText: "取消",
            type: "warning"
          }
        );
        this.launched = true;
        this.install();
      } catch (e) {
        throw e;
      }
    },
    async reInstall() {
      this.status = 0;
      this.install();
    }
  }
};
</script>

<style lang="scss" scoped>
.page-environment {
  text-align: center;
  &__title {
    color: #409eff;
    font-size: 45px;
  }
  &__tip {
    color: #999;
    font-size: 13px;
  }
  &__launch {
    color: #f56c6c;
    font-size: 13px;
  }
  &__status {
    margin: auto;
    width: 400px;
    text-align: left;
    color: #999;
    font-size: 13px;
  }
}
</style>
