const fs = require("fs");
const fse = require("fs-extra");
const axios = require("axios");
const { exec } = require("child_process");
const express = require("express");
const bodyParser = require("body-parser");
const ssh2 = require("ssh2");
const archiver = require("archiver");
const unzip = require("unzip-stream");

const execRemote = require("./lib/exec-remote");

const {
  uploadNodejsRpm,
  uploadMysqlRpm,
  uploadMysqlServerRpm,
  uploadZblogTar,
  checkLinuxEnv,
  checkMysqlEnv,
  installMysql,
  checkNodeEnv,
  installNode,
  checkCnpm,
  installCnpm,
  checkPm2,
  installPm2,
  checkNginxEnv,
  installNginx,
  getMysqlInitialPassword,
  saveMysqlPassword,
  untarZblog,
  installDependencies,
  handleLn,
  importSql,
  startPm2,
  startNginx
} = require("./lib/linux-exec");

global.statusContent = "";
global.status = 0;
global.linxuEnv = "";

const app = express();
const client = ssh2.Client;

const startClient = () => {
  return new Promise((resolve, reject) => {
    exec(`cd interface & npm start`, err => {
      if (!err) {
        resolve();
      } else {
        reject(err);
      }
    });
  });
};

// (async () => {
//   // 正在启动安装客户端
//   console.log("正在启动安装客户端...");

//   try {
//     await startClient();
//   } catch (e) {
//     console.error(e);
//   }
// })();

// 正在启动安装服务
console.log("正在启动安装服务...");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/api/testConnect", (req, res) => {
  try {
    const data = req.body;
    const conn = new client();
    conn
      .on("ready", async () => {
        // 获取linux系统环境
        global.linxuEnv = await checkLinuxEnv(conn);
        conn.end();
        if (global.linxuEnv === "REDHAT") {
          return res.status(200).json({
            errno: 0,
            errmsg: "",
            data: "连接成功！"
          });
        } else {
          return res.status(500).json({
            errno: 3000,
            errmsg: "暂不支持redhat系列外的服务器安装！",
            data: ""
          });
        }
      })
      .on("error", function(e) {
        conn.end();
        return res.status(200).json({
          errno: 3000,
          errmsg: "远程服务器连接失败！",
          data: ""
        });
      })
      .connect({
        host: data.ip,
        port: 22,
        username: data.account,
        password: data.password
      });
  } catch (e) {
    return res.status(500).end(e.toString());
  }
});

app.post("/api/environment", (req, res) => {
  try {
    const data = req.body;
    const conn = new client();
    global.status = 0;
    global.statusContent = "";
    conn
      .on("ready", async () => {
        res.status(200).json({
          errno: 0,
          errmsg: "",
          data: "开始安装！"
        });

        global.linxuEnv = await checkLinuxEnv(conn);

        // node 安装
        global.statusContent += "<p>正在检测node环境...</p>";
        const status = await checkNodeEnv(conn);
        if (status === "COMMAND_NOT_FOUND") {
          // nodejs.rpm包上传
          global.statusContent += "<p>正在上传nodejs.rpm包...</p>";
          const uploadStatus = await uploadNodejsRpm(conn, global.linxuEnv);
          if (uploadStatus === "COMMAND_NOT_FOUND") {
            global.statusContent +=
              "<p style='color: #F56C6C;'>nodejs.rpm包上传失败，请重新尝试！</p>";
            conn.end();
            return (global.status = 2);
          } else {
            global.statusContent +=
              "<p style='color: #67C23A;'>nodejs.rpm包上传成功！</p>";
          }

          global.statusContent += "<p>正在安装node...</p>";
          const nodeStatus = await installNode(conn, global.linxuEnv);
          if (nodeStatus === "EXEC_FINISHED") {
            global.statusContent +=
              "<p style='color: #67C23A;'>node安装成功！</p>";
          } else {
            global.statusContent +=
              "<p style='color: #F56C6C;'>node安装失败，请重新尝试！</p>";
            conn.end();
            return (global.status = 2);
          }
        } else {
          global.statusContent +=
            "<p style='color: #E6A23C;'>node已存在，无需重复安装</p>";
        }

        // cnpm 安装
        global.statusContent += "<p>正在检测cnpm环境...</p>";
        const status2 = await checkCnpm(conn);
        if (status2 === "COMMAND_NOT_FOUND") {
          global.statusContent += "<p>正在安装cnpm...</p>";
          await installCnpm(conn);
          global.statusContent +=
            "<p style='color: #67C23A;'>cnpm安装成功！</p>";
        } else {
          global.statusContent +=
            "<p style='color: #E6A23C;'>cnpm已存在，无需重复安装</p>";
        }

        // pm2 安装
        global.statusContent += "<p>正在检测pm2环境...</p>";
        const status3 = await checkPm2(conn);
        if (status3 === "COMMAND_NOT_FOUND") {
          global.statusContent += "<p>正在安装pm2...</p>";
          await installPm2(conn);
          global.statusContent +=
            "<p style='color: #67C23A;'>pm2安装成功！</p>";
        } else {
          global.statusContent +=
            "<p style='color: #E6A23C;'>pm2已存在，无需重复安装</p>";
        }

        // nginx 安装
        global.statusContent += "<p>正在检测nginx环境...</p>";
        const status5 = await checkNginxEnv(conn, linxuEnv);
        if (status5 === "COMMAND_NOT_FOUND") {
          global.statusContent += "<p>正在安装nginx...</p>";
          await installNginx(conn, global.linxuEnv);
          global.statusContent +=
            "<p style='color: #67C23A;'>nginx安装成功！</p>";
        } else {
          global.statusContent +=
            "<p style='color: #E6A23C;'>nginx已存在，无需重复安装!</p>";
        }

        // mysql 安装
        global.statusContent += "<p>正在检测mysql环境...</p>";
        const status4 = await checkMysqlEnv(conn, global.linxuEnv);
        if (status4 === "COMMAND_NOT_FOUND") {
          // mysql.rpm包上传
          global.statusContent += "<p>正在上传mysql.rpm包...</p>";
          const uploadStatus = await uploadMysqlRpm(conn, global.linxuEnv);
          if (uploadStatus === "COMMAND_NOT_FOUND") {
            global.statusContent +=
              "<p style='color: #F56C6C;'>mysql.rpm包上传失败，请重新尝试！</p>";
            conn.end();
            return (global.status = 2);
          } else {
            global.statusContent +=
              "<p style='color: #67C23A;'>mysql.rpm包上传成功！</p>";
          }

          // mysql-server.rpm包上传
          global.statusContent += "<p>正在上传mysql-server.rpm包...</p>";
          const uploadStatus2 = await uploadMysqlServerRpm(
            conn,
            global.linxuEnv
          );
          if (uploadStatus2 === "COMMAND_NOT_FOUND") {
            global.statusContent +=
              "<p style='color: #F56C6C;'>mysql-server.rpm包上传失败，请重新尝试！</p>";
            conn.end();
            return (global.status = 2);
          } else {
            global.statusContent +=
              "<p style='color: #67C23A;'>mysql-server.rpm包上传成功！</p>";
          }

          global.statusContent += "<p>正在安装mysql...</p>";
          const status = await installMysql(conn, global.linxuEnv);
          if (status === "EXEC_FINISHED") {
            global.statusContent +=
              "<p style='color: #67C23A;'>mysql安装成功！</p>";
          } else {
            global.statusContent +=
              "<p style='color: #F56C6C;'>mysql安装失败，请重新尝试！</p>";
            conn.end();
            return (global.status = 2);
          }
        } else {
          global.statusContent +=
            "<p style='color: #E6A23C;'>mysql已存在，无需重复安装</p>";
        }

        global.statusContent +=
          "<p style='color: #67C23A;'>安装全部完成，去配置数据库...</p>";

        conn.end();

        return (global.status = 1);
      })
      .on("error", function(e) {
        conn.end();
        return res.status(200).json({
          errno: 3000,
          errmsg: "远程服务器连接失败！",
          data: ""
        });
      })
      .connect({
        host: data.ip,
        port: 22,
        username: data.account,
        password: data.password
      });
  } catch (e) {
    return res.status(500).end(e.toString());
  }
});

app.post("/api/checkState", (req, res) => {
  try {
    return res.status(200).json({
      errno: 0,
      errmsg: "",
      data: { content: global.statusContent, status: global.status }
    });
  } catch (e) {
    return res.status(500).end(e.toString());
  }
});

app.post("/api/configMysql", (req, res) => {
  try {
    const serverData = req.body.server;
    const mysqlData = req.body.mysql;
    const conn = new client();
    conn
      .on("ready", async () => {
        const { status, data } = await getMysqlInitialPassword(conn);
        if (status === "EXEC_FINISHED") {
          const originalPassword = data.replace(/.+localhost: /gi, "");
          try {
            await saveMysqlPassword(conn, {
              originalPassword,
              account: mysqlData.account,
              password: mysqlData.password
            });
            conn.end();
            return res.status(200).json({
              errno: 0,
              errmsg: "",
              data: ""
            });
          } catch (e) {
            conn.end();
            return res.status(200).json({
              errno: 3000,
              errmsg:
                "你的初始密码已经更改，请使用更改后的密码并且勾选复选框进入下一步！",
              data:
                "你的初始密码已经更改，请使用更改后的密码并且勾选复选框进入下一步！"
            });
          }
        } else {
          conn.end();
          return res.status(200).json({
            errno: 3000,
            errmsg: "未找到数据库初始密码，请确认数据库是否正确安装！",
            data: ""
          });
        }
      })
      .on("error", function(e) {
        console.log(e);
        conn.end();
        return res.status(200).json({
          errno: 3000,
          errmsg: "远程服务器连接失败！",
          data: ""
        });
      })
      .connect({
        host: serverData.ip,
        port: 22,
        username: serverData.account,
        password: serverData.password
      });
  } catch (e) {
    return res.status(500).end(e.toString());
  }
});

app.post("/api/checkCode", async (req, res) => {
  try {
    const info = await axios.post("http://test.zhangyangjun.com/op/checkCode", {
      code: req.body.code
    });
    return res.status(info.status).json(info.data);
  } catch (e) {
    return res.status(500).end(e.toString());
  }
});

app.post("/api/downloadPackage", async (req, res) => {
  try {
    const info = await axios({
      method: "post",
      url: "http://test.zhangyangjun.com/op/downloadPackage",
      responseType: "stream",
      data: {
        code: req.body.code
      },
      validateStatus: () => {
        return true;
      }
    });
    if (info.status.toString().startsWith("20")) {
      const stream = fs.createWriteStream(`./download/blog.zip`);
      stream.on("close", () => {
        return res.status(200).json({ errno: 0, errmsg: "", data: "" });
      });
      info.data.pipe(stream);
    } else {
      if (info.status == 400) {
        let str = "";
        info.data.on("data", data => {
          str += data.toString("utf-8");
        });
        info.data.on("close", () => {
          return res.status(200).json(JSON.parse(str));
        });
      } else {
        return res.status(info.status).json(info.data);
      }
    }
  } catch (e) {
    return res.status(500).end(e.toString());
  }
});

app.post("/api/handleZblog", async (req, res) => {
  const data = req.body;
  try {
    const stream = fs.createReadStream("./download/blog.zip");
    stream.pipe(unzip.Extract({ path: "./download/blog" }));
    stream
      .on("error", err => {
        console.log(err);
        return res
          .status(200)
          .json({ errno: 3000, errmsg: err.toString(), data: err.toString() });
      })
      .on("close", () => {
        setTimeout(() => {
          // 删除原zip
          fse.removeSync("./download/blog.zip");

          /* 替换关键内容 */

          // 设置mysql密码
          const adapterFile = "./download/blog/app/common/config/adapter.js";
          fs.writeFileSync(
            adapterFile,
            fs
              .readFileSync(adapterFile, {
                encoding: "utf-8"
              })
              .replace(`password:""`, `password:"${data.mysql.password}"`),
            {
              encoding: "utf-8"
            }
          );

          // 修改nginx.conf文件
          if (!!data.server.domain) {
            const nginxConfFile = "./download/blog/nginx.conf";
            fs.writeFileSync(
              nginxConfFile,
              fs
                .readFileSync(nginxConfFile, {
                  encoding: "utf-8"
                })
                .replace(`domain.com""`, data.server.domain),
              {
                encoding: "utf-8"
              }
            );
          }

          // 压缩为tar包
          const outputStream = fs.createWriteStream("./download/blog.tar");
          const archive = archiver("tar");

          outputStream.on("close", function() {
            // 删除原文件夹
            setTimeout(() => {
              fse.removeSync("./download/blog");

              // 上传tar包

              const conn = new client();
              conn
                .on("ready", async () => {
                  const status = await uploadZblogTar(conn);
                  conn.end();
                  fse.removeSync("./download/blog.tar");
                  if (status === "COMMAND_NOT_FOUND") {
                    return res.status(200).json({
                      errno: 3000,
                      errmsg: "上传失败！",
                      data: "上传失败！"
                    });
                  } else {
                    return res.status(200).json({
                      errno: 0,
                      errmsg: "",
                      data: ""
                    });
                  }
                })
                .on("error", function(e) {
                  conn.end();
                  return res.status(200).json({
                    errno: 3000,
                    errmsg: "远程服务器连接失败！",
                    data: ""
                  });
                })
                .connect({
                  host: data.server.ip,
                  port: 22,
                  username: data.server.account,
                  password: data.server.password
                });
            }, 800);
          });

          archive.on("error", function(err) {
            console.log(err);
            return res.status(200).json({
              errno: 3000,
              errmsg: err.toString(),
              data: err.toString()
            });
          });

          archive.pipe(outputStream);
          archive.directory("./download/blog/", false);
          archive.finalize();
        }, 800);
      });
  } catch (e) {
    return res.status(500).end(e.toString());
  }
});

app.post("/api/deployZblog", async (req, res) => {
  const data = req.body;
  try {
    const conn = new client();
    conn
      .on("ready", async () => {
        await untarZblog(conn);
        await installDependencies(conn);
        await handleLn(conn);
        // 导入数据库
        await importSql(conn, data.mysql);
        // 启动pm2
        await startPm2(conn);
        // 重启nginx
        await startNginx(conn);
        conn.end();
        return res.status(200).json({
          errno: 0,
          errmsg: "",
          data: ""
        });
      })
      .on("error", function(e) {
        conn.end();
        return res.status(200).json({
          errno: 3000,
          errmsg: "远程服务器连接失败！",
          data: ""
        });
      })
      .connect({
        host: data.server.ip,
        port: 22,
        username: data.server.account,
        password: data.server.password
      });
  } catch (e) {
    return res.status(500).end(e.toString());
  }
});

app.listen(3000);
