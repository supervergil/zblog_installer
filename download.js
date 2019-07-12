// https://dev.mysql.com/get/Downloads/MySQL-5.7/mysql-community-server-5.7.26-1.el7.x86_64.rpm
// https://dev.mysql.com/get/Downloads/MySQL-5.7/mysql-community-client-5.7.26-1.el7.x86_64.rpm

const fs = require("fs");
const fse = require("fs-extra");
const axios = require("axios");

const downloadRpm = (url, name) => {
  return new Promise(async (resolve, reject) => {
    if (fse.pathExistsSync(`./package/redhat-linux7/${name}.rpm`)) {
      console.log(
        `./package/redhat-linux7/${name}.rpm已存在，不需要重复下载！`
      );
      return resolve();
    }
    const response = await axios({
      method: "get",
      url,
      responseType: "stream"
    });
    const stream = fs.createWriteStream(`./package/redhat-linux7/${name}.rpm`);
    stream.on("close", async () => {
      resolve();
    });
    stream.on("error", async err => {
      console.log(
        `下载失败，你也可以执行手动下载，下载地址为：${url},完成后将其拷贝到/package/redhat-linux7目录,并改名为${name}.rpm！`
      );
      reject();
    });
    response.data.pipe(stream);
  });
};

(async () => {
  try {
    console.log(
      "下载开始，下载过程可能需要5到10分钟，请耐心等待直到出现下载完成的提示！"
    );
    await Promise.all([
      downloadRpm(
        "https://dev.mysql.com/get/Downloads/MySQL-5.7/mysql-community-client-5.7.26-1.el7.x86_64.rpm",
        "mysql-client"
      ),
      downloadRpm(
        "https://dev.mysql.com/get/Downloads/MySQL-5.7/mysql-community-server-5.7.26-1.el7.x86_64.rpm",
        "mysql-server"
      )
    ]);
    console.log("下载完成！");
  } catch (e) {
    console.log("下载出错！");
  }
})();
