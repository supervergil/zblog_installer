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
  uploadNginxRpm,
  uploadMysqlCommonRpm,
  uploadMysqlLibsRpm,
  uploadMysqlClientRpm,
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
        return res.status(200).json({
          errno: global.linxuEnv === "REDHAT" ? 0 : 3000,
          errmsg:
            global.linxuEnv === "REDHAT"
              ? ""
              : "暂不支持redhat系列外的服务器安装！",
          data: global.linxuEnv === "REDHAT" ? "连接成功！" : ""
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

        // node 安装
        global.statusContent += "<p>正在检测node环境...</p>";
        const checkNodeStatus = await checkNodeEnv(conn);
        if (checkNodeStatus === 0) {
          // nodejs.rpm包上传
          global.statusContent += "<p>正在上传nodejs.rpm包...</p>";
          const status = await uploadNodejsRpm(conn);
          if (status === 0) {
            global.statusContent +=
              "<p style='color: #F56C6C;'>nodejs.rpm包上传失败，请重新尝试！</p>";
            conn.end();
            return (global.status = 2);
          } else if (status === 1) {
            global.statusContent +=
              "<p style='color: #67C23A;'>nodejs.rpm包上传成功！</p>";
          }

          global.statusContent += "<p>正在安装node...</p>";
          const installStatus = await installNode(conn, global.linxuEnv);
          if (installStatus === 1) {
            global.statusContent +=
              "<p style='color: #67C23A;'>node安装成功！</p>";
          } else if (installStatus === 0) {
            global.statusContent +=
              "<p style='color: #F56C6C;'>node安装失败，请重新尝试！</p>";
            conn.end();
            return (global.status = 2);
          }
        } else if (checkNodeStatus === 1) {
          global.statusContent +=
            "<p style='color: #E6A23C;'>node已存在，无需重复安装</p>";
        }

        // cnpm 安装
        global.statusContent += "<p>正在检测cnpm环境...</p>";
        const checkCnpmStatus = await checkCnpm(conn);
        if (checkCnpmStatus === 0) {
          global.statusContent += "<p>正在安装cnpm...</p>";
          const status = await installCnpm(conn);
          if (status === 0) {
            global.statusContent +=
              "<p style='color: #F56C6C;'>cnpm安装失败，请重新尝试！</p>";
            conn.end();
            return (global.status = 2);
          } else if (status === 1) {
            global.statusContent +=
              "<p style='color: #67C23A;'>cnpm安装成功！</p>";
          }
        } else if (checkCnpmStatus === 1) {
          global.statusContent +=
            "<p style='color: #E6A23C;'>cnpm已存在，无需重复安装</p>";
        }

        // pm2 安装
        global.statusContent += "<p>正在检测pm2环境...</p>";
        const checkPm2Status = await checkPm2(conn);
        if (checkPm2Status === 0) {
          global.statusContent += "<p>正在安装pm2...</p>";
          const status = await installPm2(conn);
          if (status === 0) {
            global.statusContent +=
              "<p style='color: #F56C6C;'>pm2安装失败，请重新尝试！</p>";
            conn.end();
            return (global.status = 2);
          } else if (status === 1) {
            global.statusContent +=
              "<p style='color: #67C23A;'>pm2安装成功！</p>";
          }
        } else if (checkPm2Status === 1) {
          global.statusContent +=
            "<p style='color: #E6A23C;'>pm2已存在，无需重复安装</p>";
        }

        // nginx 安装
        global.statusContent += "<p>正在检测nginx环境...</p>";
        const checkNginxEnvStatus = await checkNginxEnv(conn, linxuEnv);
        if (checkNginxEnvStatus === 0) {
          // nginx包上传
          global.statusContent += "<p>正在上传nginx.rpm包...</p>";
          const status = await uploadNginxRpm(conn);
          if (status === 0) {
            global.statusContent +=
              "<p style='color: #F56C6C;'>nginx.rpm包上传失败，请重新尝试！</p>";
            conn.end();
            return (global.status = 2);
          } else if (status === 1) {
            global.statusContent +=
              "<p style='color: #67C23A;'>nginx.rpm包上传成功！</p>";
          }

          global.statusContent += "<p>正在安装nginx...</p>";
          const installStatus = await installNginx(conn, global.linxuEnv);
          if (installStatus === 0) {
            global.statusContent +=
              "<p style='color: #F56C6C;'>nginx安装失败，请重新尝试！</p>";
            conn.end();
            return (global.status = 2);
          } else if (installStatus === 1) {
            global.statusContent +=
              "<p style='color: #67C23A;'>nginx安装成功！</p>";
          }
        } else if (checkNginxEnvStatus === 1) {
          global.statusContent +=
            "<p style='color: #E6A23C;'>nginx已存在，无需重复安装!</p>";
        }

        // mysql 安装
        global.statusContent += "<p>正在检测mysql环境...</p>";
        const checkMysqlEnvStatus = await checkMysqlEnv(conn, global.linxuEnv);
        if (checkMysqlEnvStatus === 0) {
          // mysql相关rpm包上传
          global.statusContent += "<p>正在上传mysql相关的rpm包...</p>";

          const resp = await Promise.all([
            uploadMysqlCommonRpm(conn),
            uploadMysqlLibsRpm(conn),
            uploadMysqlClientRpm(conn),
            uploadMysqlServerRpm(conn)
          ]);

          if (resp.every(item => item === 1)) {
            global.statusContent +=
              "<p style='color: #67C23A;'>mysql包上传成功！</p>";
          } else {
            global.statusContent +=
              "<p style='color: #F56C6C;'>mysql包上传失败，请重新尝试！</p>";
            conn.end();
            return (global.status = 2);
          }

          global.statusContent += "<p>正在安装mysql...</p>";
          const status = await installMysql(conn, global.linxuEnv);
          if (status === 1) {
            global.statusContent +=
              "<p style='color: #67C23A;'>mysql安装成功！</p>";
          } else if (status === 0) {
            global.statusContent +=
              "<p style='color: #F56C6C;'>mysql安装失败，请重新尝试！</p>";
            conn.end();
            return (global.status = 2);
          }
        } else if (checkMysqlEnvStatus === 1) {
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
        const originalPassword = data.replace(/.+localhost: /gi, "");
        console.log(data, originalPassword);
        try {
          await saveMysqlPassword(conn, {
            originalPassword,
            account: mysqlData.account,
            password: mysqlData.password
          });
          conn.end();
          return res.status(200).json({
            errno: status === 1 ? 0 : 3000,
            errmsg:
              status === 1
                ? ""
                : "未找到数据库初始密码，请确认数据库是否正确安装！",
            data:
              status === 1
                ? ""
                : "未找到数据库初始密码，请确认数据库是否正确安装！"
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
          const nginxConfFile = "./download/blog/nginx.conf";
          if (!!data.server.domain) {
            fs.writeFileSync(
              nginxConfFile,
              fs
                .readFileSync(nginxConfFile, {
                  encoding: "utf-8"
                })
                .replace(`domain.com`, data.server.domain),
              {
                encoding: "utf-8"
              }
            );
          } else {
            fs.writeFileSync(
              nginxConfFile,
              fs
                .readFileSync(nginxConfFile, {
                  encoding: "utf-8"
                })
                .replace(`server_name domain.com www.domain.com;`, ""),
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
                  return res.status(200).json({
                    errno: status === 0 ? 3000 : 0,
                    errmsg: status === 0 ? "上传失败！" : "",
                    data: status === 0 ? "上传失败！" : ""
                  });
                })
                .on("error", function() {
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
        const untartStatus = await untarZblog(conn);
        const depStatus = await installDependencies(conn);
        const lnStatus = await handleLn(conn);
        const sqlStatus = await importSql(conn, data.mysql);
        const pm2Status = await startPm2(conn);
        const nginxStatus = await startNginx(conn);
        conn.end();
        if (
          untartStatus &&
          depStatus &&
          lnStatus &&
          sqlStatus &&
          pm2Status &&
          nginxStatus
        ) {
          return res.status(200).json({
            errno: 0,
            errmsg: "",
            data: ""
          });
        } else {
          return res.status(200).json({
            errno: 3000,
            errmsg: "远程部署失败！",
            data: "远程部署失败！"
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
  } catch (e) {
    return res.status(500).end(e.toString());
  }
});

app.listen(3000);
