<template>
  <div class="page-code">
    <h1 class="page-code__title">输入内测码</h1>
    <el-form
      ref="form"
      class="page-code__form"
      :rules="rules"
      :model="form"
      size="mini"
      label-width="120px"
      v-loading="form.loading"
      element-loading-text="正在验证..."
    >
      <el-form-item label="内测码" prop="code">
        <el-input v-model="form.code"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="success" @click="testCode">验证</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "code",
  layout: "full",
  data() {
    return {
      form: {
        code: "",
        loading: false
      },
      rules: {
        code: [{ required: true, message: "请输入内测码", trigger: "blur" }]
      }
    };
  },
  created() {},
  methods: {
    async testCode() {
      this.$refs["form"].validate(async valid => {
        if (valid) {
          this.form.loading = true;
          const { status } = await this.$http("post", "/api/checkCode", {
            data: {
              code: this.form.code
            }
          });
          if (status === 1) {
            this.$store.commit("SET_CODE", this.form.code);
            this.$router.replace("/install");
          }
          this.form.loading = false;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.page-code {
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
