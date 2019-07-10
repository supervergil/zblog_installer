const path = require("path");
module.exports = {
  devServer: {
    open: true,
    proxy: {
      "/api": {
        target: `${process.env.VUE_APP_HTTP_BASE_URI}/api`,
        ws: true,
        changOrigin: true,
        pathRewrite: {
          "^/api": "/"
        }
      }
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        "~": path.join(__dirname)
      }
    }
  }
};
