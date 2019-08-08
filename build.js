const { exec } = require("child_process");
const fs = require("fs");
const fse = require("fs-extra");
const archiver = require("archiver");

const remoteDir = "./zblog_installer";

const buildClient = dir => {
  return new Promise((resolve, reject) => {
    exec(`cd ${dir} & npm run build`, err => {
      if (!err) {
        resolve();
      } else {
        reject(err);
      }
    });
  });
};

(async () => {
  console.log("正在创建文件夹...");
  fse.ensureDirSync(remoteDir);
  fse.emptyDirSync(remoteDir);

  // 构建admin和ucenter至www目录
  console.log("正在构建客户端...");
  await buildClient("interface");

  // 提取对应的文件进入待上传文件夹
  console.log("正在提取对应的文件进入待压缩文件夹...");
  fse.copySync("./lib", `${remoteDir}/lib`);
  fse.copySync("./package", `${remoteDir}/package`);
  fse.copySync("./public", `${remoteDir}/public`);
  fse.copySync("./index.js", `${remoteDir}/index.js`);
  fse.copySync("./package.json", `${remoteDir}/package.json`);
  fse.copySync("./download", `${remoteDir}/download`);

  // 移除部分不需要的文件
  fse.removeSync(`${remoteDir}/package/redhat-linux7/.gitignore`);
  fse.removeSync(`${remoteDir}/package/redhat-linux7/mysql-client.rpm`);
  fse.removeSync(`${remoteDir}/package/redhat-linux7/mysql-server.rpm`);

  // 生成压缩包
  const output = fs.createWriteStream("./zblog_installer.zip");
  const archive = archiver("zip", {
    zlib: { level: 9 }
  });

  archive.pipe(output);
  archive.directory("./zblog_installer/", false);
  archive.finalize();
})();
