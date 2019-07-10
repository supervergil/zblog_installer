<template>
  <div class="page-install">
    <h1 class="page-install__title">安装ZBLOG</h1>
    <div class="page-install__tip" v-if="launched">
      <i class="fas fa-sync-alt fa-spin fa-fw"></i> 安装可能需要5-10分钟，请耐心等待，安装过程请勿刷新页面或退出浏览器。
    </div>
    <div class="page-install__launch" v-else>
      <div style="margin-top:20px;">
        <el-button type="danger" @click="installLaunched">安装zblog</el-button>
      </div>
    </div>
    <div class="page-install__status" v-if="launched">
      <p style="color: #E6A23C;">安装进度：</p>
      <p>{{statusContent}}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "code",
  layout: "full",
  data() {
    return {
      launched: false,
      statusContent: "还没开始"
    };
  },
  created() {},
  methods: {
    async install() {
      this.statusContent = "正在下载zblog软件包...";
      const { status } = await this.$http("post", "/api/downloadPackage", {
        data: {
          code: this.$store.state.code
        }
      });
      if (status === 1) {
        this.statusContent = "zblog软件包下载完成！";
      } else {
        this.statusContent = "下载出错，请重新尝试！";
      }
    },
    async handleZblog() {
      this.statusContent = "正在处理zblog软件包...";
      const { status } = await this.$http("post", "/api/handleZblog", {
        data: {
          server: {
            ip: this.$store.state.server.ip,
            account: this.$store.state.server.account,
            password: this.$store.state.server.password,
            domain: this.$store.state.server.domain
          },
          mysql: {
            account: this.$store.state.mysql.account,
            password: this.$store.state.mysql.password
          }
        }
      });
      if (status === 1) {
        this.statusContent = "zblog软件包处理完成！";
      } else {
        this.statusContent = "处理出错，请重新尝试！";
      }
    },
    async deployZblog() {
      this.statusContent = "正在部署zblog...";
      const { status } = await this.$http("post", "/api/deployZblog", {
        data: {
          server: {
            ip: this.$store.state.server.ip,
            account: this.$store.state.server.account,
            password: this.$store.state.server.password,
            domain: this.$store.state.server.domain
          },
          mysql: {
            account: this.$store.state.mysql.account,
            password: this.$store.state.mysql.password
          }
        }
      });
      if (status === 1) {
        this.statusContent = "zblog部署完成！";
      } else {
        this.statusContent = "处理出错，请重新尝试！";
      }
    },
    async installLaunched() {
      try {
        await this.$confirm(
          "即将进入安装，安装过程请勿刷新页面或退出浏览器！",
          "提示",
          {
            confirmButtonText: "进入安装",
            cancelButtonText: "取消",
            type: "warning"
          }
        );
        this.launched = true;
        await this.install();
        await this.handleZblog();
        await this.deployZblog();
      } catch (e) {
        throw e;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.page-install {
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
