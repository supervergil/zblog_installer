<template>
  <div class="page-mysql">
    <h1 class="page-mysql__title">配置你的数据库</h1>
    <el-form
      ref="form"
      class="page-mysql__form"
      :rules="rules"
      :model="form"
      size="mini"
      label-width="120px"
      v-loading="form.loading"
      element-loading-text="正在保存配置..."
    >
      <el-form-item label="数据库用户名" prop="account">
        <el-input v-model="form.account"></el-input>
      </el-form-item>
      <el-form-item label="数据库密码" prop="password">
        <el-input type="password" v-model="form.password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="form.type">如果你的数据库之前已经存在，并且不需要改动账户密码，请勾选此项。</el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-button type="success" @click="saveMysql">保存</el-button>
        <el-button @click="$router.go(-1)">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "mysql",
  layout: "full",
  data() {
    return {
      form: {
        account: "root",
        password: "",
        type: false,
        loading: false
      },
      rules: {
        account: [
          { required: true, message: "请输入数据库用户名", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入数据库密码", trigger: "blur" }
        ]
      }
    };
  },
  created() {},
  methods: {
    async saveMysql() {
      if (!this.form.type) {
        this.$refs["form"].validate(async valid => {
          if (valid) {
            this.form.loading = true;
            const { status } = await this.$http("post", "/api/configMysql", {
              data: {
                server: {
                  ip: this.$store.state.server.ip,
                  account: this.$store.state.server.account,
                  password: this.$store.state.server.password
                },
                mysql: {
                  account: this.form.account,
                  password: this.form.password
                }
              }
            });
            if (status === 1) {
              this.$store.commit("SET_MYSQL", {
                account: this.form.account,
                password: this.form.password
              });
              this.$router.push("/code");
            }
            this.form.loading = false;
          }
        });
      } else {
        this.$store.commit("SET_MYSQL", {
          account: this.form.account,
          password: this.form.password
        });
        this.$router.replace("/code");
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.page-mysql {
  text-align: center;
  &__title {
    color: #409eff;
    font-size: 45px;
  }
  &__form {
    margin: auto;
    margin-top: 20px;
    width: 700px;
    text-align: left;
  }
}
</style>
