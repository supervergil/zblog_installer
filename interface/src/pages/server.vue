<template>
  <div class="page-server">
    <h1 class="page-server__title">填写你的服务器信息</h1>
    <div class="page-server__notion">服务器连接服务为本地运行，请放心填写！</div>
    <el-form
      ref="form"
      class="page-server__form"
      :rules="rules"
      :model="form"
      size="mini"
      label-width="120px"
      v-loading="form.loading"
      element-loading-text="正在连接远程服务器..."
    >
      <el-form-item label="服务器ip" prop="ip">
        <el-input v-model="form.ip" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="用户名" prop="account">
        <el-input v-model="form.account" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="form.password" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="网站域名" prop="domain" v-if="form.hasDomain">
        <el-input v-model="form.domain" placeholder="如domain.com，不用加http和www" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="form.hasDomain">我有域名</el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-button type="success" @click="testConnect">连接</el-button>
        <el-button @click="$router.go(-1)">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "server",
  layout: "full",
  data() {
    return {
      form: {
        ip: "",
        account: "",
        password: "",
        domain: "",
        hasDomain: false,
        loading: false
      },
      rules: {
        ip: [{ required: true, message: "请输入服务器ip", trigger: "blur" }],
        account: [
          { required: true, message: "请输入登录用户名", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入登录密码", trigger: "blur" }
        ],
        domain: [{ required: true, message: "请输入网站域名", trigger: "blur" }]
      }
    };
  },
  created() {},
  methods: {
    async testConnect() {
      this.$refs["form"].validate(async valid => {
        if (valid) {
          this.form.loading = true;
          const { status } = await this.$http("post", "/api/testConnect", {
            data: {
              ip: this.form.ip,
              account: this.form.account,
              password: this.form.password
            }
          });
          if (status === 1) {
            this.$message({
              message: "连接成功！",
              type: "success",
              duration: 1200
            });
            this.$store.commit("SET_SERVER", {
              ip: this.form.ip,
              account: this.form.account,
              password: this.form.password,
              domain: this.form.hasDomain ? this.form.domain : ""
            });
            this.$router.push("/environment");
          }
          this.form.loading = false;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.page-server {
  &__title {
    text-align: center;
  }
  &__form {
    margin: auto;
    margin-top: 20px;
    width: 700px;
  }
  &__notion {
    text-align: center;
    color: #67c23a;
    font-size: 12px;
  }
}
</style>
