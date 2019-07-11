const execRemote = require("./exec-remote");

// 检测linux环境
const checkLinuxEnv = async conn => {
  try {
    await execRemote(conn, "sudo rm -f /var/run/yum.pid");
    const { status, data } = await execRemote(conn, "yum --version");
    if (status === 0) {
      return "DEBIAN";
    } else if (status === 1) {
      return "REDHAT";
    }
  } catch (e) {
    console.log(e);
  }
};

// 检测node环境
const checkNodeEnv = async conn => {
  try {
    const { status } = await execRemote(conn, "node -v");
    return status;
  } catch (e) {
    console.log(e);
  }
};

// 上传nodejs.rpm包
const uploadNodejsRpm = async conn => {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftpStream) => {
      if (!err) {
        sftpStream.stat("/nodejs.rpm", (err2, stats) => {
          if (err2) {
            sftpStream.fastPut(
              "./package/redhat-linux7/nodejs.rpm",
              "/nodejs.rpm",
              err3 => {
                if (!err3) {
                  resolve(1);
                } else {
                  reject(0);
                }
              }
            );
          } else {
            resolve(1);
          }
        });
      } else {
        reject(0);
      }
    });
  });
};

// 安装node
const installNode = async (conn, linuxEnv) => {
  try {
    if (linuxEnv === "REDHAT") {
      await execRemote(conn, "yum localinstall /nodejs.rpm -y --nogpgcheck");
      return 1;
    } else if (linuxEnv === "DEBIAN") {
    }
  } catch (e) {
    return 0;
  }
};

// 检测cnpm环境
const checkCnpm = async conn => {
  try {
    await execRemote(conn, "cnpm -v");
    return 1;
  } catch (e) {
    return 0;
  }
};

// 安装cnpm
const installCnpm = async conn => {
  try {
    await execRemote(
      conn,
      "npm install -g cnpm --registry https://registry.npm.taobao.org"
    );
    return 1;
  } catch (e) {
    return 0;
  }
};

// 检测pm2
const checkPm2 = async conn => {
  try {
    const { status } = await execRemote(conn, "pm2 -v");
    return status;
  } catch (e) {
    console.log(e);
  }
};

// 安装pm2
const installPm2 = async conn => {
  try {
    await execRemote(
      conn,
      "sudo npm install -g pm2  --registry https://registry.npm.taobao.org"
    );
    return 1;
  } catch (e) {
    return 0;
  }
};

// 检测nginx环境
const checkNginxEnv = async (conn, linuxEnv) => {
  try {
    const { data } = await execRemote(conn, "nginx -v");
    const status = data.startsWith("nginx version") ? 1 : 0;
    return status;
  } catch (e) {
    console.log(e);
  }
};

// 上传nginx.rpm包
const uploadNginxRpm = async conn => {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftpStream) => {
      if (!err) {
        sftpStream.stat("/nginx.rpm", (err2, stats) => {
          if (err2) {
            sftpStream.fastPut(
              "./package/redhat-linux7/nginx.rpm",
              "/nginx.rpm",
              err3 => {
                if (!err3) {
                  resolve(1);
                } else {
                  reject(0);
                }
              }
            );
          } else {
            resolve(1);
          }
        });
      } else {
        reject(0);
      }
    });
  });
};

// 安装nginx
const installNginx = async (conn, linuxEnv) => {
  try {
    if (linuxEnv === "REDHAT") {
      await execRemote(conn, "yum localinstall /nginx.rpm -y --nogpgcheck");
      return 1;
    }
  } catch (e) {
    return 0;
  }
};

// 检测mysql环境
const checkMysqlEnv = async (conn, linuxEnv) => {
  try {
    const { status } = await execRemote(conn, "mysql --help");
    return status;
  } catch (e) {
    console.log(e);
  }
};

// 上传mysql相关的rpm包
const uploadMysqlCommonRpm = async conn => {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftpStream) => {
      if (!err) {
        sftpStream.stat("/mysql-common.rpm", (err2, stats) => {
          if (err2) {
            sftpStream.fastPut(
              "./package/redhat-linux7/mysql-common.rpm",
              "/mysql-common.rpm",
              err3 => {
                if (!err3) {
                  resolve(1);
                } else {
                  reject(0);
                }
              }
            );
          } else {
            resolve(1);
          }
        });
      } else {
        reject(0);
      }
    });
  });
};

const uploadMysqlLibsRpm = async conn => {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftpStream) => {
      if (!err) {
        sftpStream.stat("/mysql-libs.rpm", (err2, stats) => {
          if (err2) {
            sftpStream.fastPut(
              "./package/redhat-linux7/mysql-libs.rpm",
              "/mysql-libs.rpm",
              err3 => {
                if (!err3) {
                  resolve(1);
                } else {
                  reject(0);
                }
              }
            );
          } else {
            resolve(1);
          }
        });
      } else {
        reject(0);
      }
    });
  });
};

const uploadMysqlClientRpm = async conn => {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftpStream) => {
      if (!err) {
        sftpStream.stat("/mysql-client.rpm", (err2, stats) => {
          if (err2) {
            sftpStream.fastPut(
              "./package/redhat-linux7/mysql-client.rpm",
              "/mysql-client.rpm",
              err3 => {
                if (!err3) {
                  resolve(1);
                } else {
                  reject(0);
                }
              }
            );
          } else {
            resolve(1);
          }
        });
      } else {
        reject(0);
      }
    });
  });
};

const uploadMysqlServerRpm = async conn => {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftpStream) => {
      if (!err) {
        sftpStream.stat("/mysql-server.rpm", (err2, stats) => {
          if (err2) {
            sftpStream.fastPut(
              "./package/redhat-linux7/mysql-server.rpm",
              "/mysql-server.rpm",
              err3 => {
                if (!err3) {
                  resolve(1);
                } else {
                  reject(0);
                }
              }
            );
          } else {
            resolve(1);
          }
        });
      } else {
        reject(0);
      }
    });
  });
};

// 安装mysql
const installMysql = async (conn, linuxEnv) => {
  try {
    if (linuxEnv === "REDHAT") {
      await execRemote(conn, "yum install -y numactl");
      const { data } = await execRemote(conn, "rpm -qa | grep -i mariadb");
      await execRemote(conn, `yum remove -y ${data}`);
      await execRemote(
        conn,
        "yum localinstall /mysql-common.rpm -y --nogpgcheck"
      );
      await execRemote(
        conn,
        "yum localinstall /mysql-libs.rpm -y --nogpgcheck"
      );
      await execRemote(
        conn,
        "yum localinstall /mysql-client.rpm -y --nogpgcheck"
      );
      await execRemote(
        conn,
        "yum localinstall /mysql-server.rpm -y --nogpgcheck"
      );
      await execRemote(conn, "service mysqld start");
      return 1;
    }
  } catch (e) {
    return 0;
  }
};

const uploadZblogTar = async conn => {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftpStream) => {
      if (!err) {
        sftpStream.fastPut("./download/blog.tar", "/blog.tar", err2 => {
          if (!err2) {
            resolve("EXEC_FINISHED");
          } else {
            reject("COMMAND_NOT_FOUND");
          }
        });
      } else {
        reject("COMMAND_NOT_FOUND");
      }
    });
  });
};

const getMysqlInitialPassword = async conn => {
  try {
    return await execRemote(
      conn,
      "grep 'temporary password' /var/log/mysqld.log"
    );
  } catch (e) {
    console.log(e);
  }
};

const saveMysqlPassword = (conn, info, cb) => {
  try {
    return new Promise((resolve, reject) => {
      conn.shell((err, stream) => {
        if (err) return reject(err);
        stream
          .on("close", () => {
            resolve();
          })
          .on("data", data => {
            if (data.toString("utf-8").includes("Access denied")) {
              reject(data.toString("utf-8"));
            }
          })
          .on("error", err => {
            reject(err);
          })
          .stderr.on("data", function(data) {
            reject(data.toString("utf-8"));
          });
        stream.write(`mysql -u${info.account} -p\r\n`);
        setTimeout(() => {
          stream.write(`${info.originalPassword}\r\n`);
          setTimeout(() => {
            stream.write(`set global validate_password_policy=0;\r\n`);
            stream.write(`set global validate_password_length=1;\r\n`);
            stream.write(
              `alter user '${info.account}'@'localhost' identified by '${
                info.password
              }';\r\n`
            );
            stream.write(`quit\r\n`);
            stream.write(`exit\r\n`);
          }, 800);
        }, 800);
      });
    });
  } catch (e) {
    console.log(e);
  }
};

const untarZblog = async conn => {
  try {
    await execRemote(conn, "mkdir /blog");
    return await execRemote(conn, "tar xvf /blog.tar -C /blog");
  } catch (e) {
    console.log(e);
  }
};

const installDependencies = async conn => {
  try {
    return new Promise((resolve, reject) => {
      conn.shell((err, stream) => {
        if (err) return reject(err);
        stream
          .on("close", () => {
            resolve();
          })
          .on("data", data => {
            console.log(data.toString("utf-8"));
          })
          .on("error", err => {
            reject(err);
          })
          .stderr.on("data", function(data) {
            reject(data.toString("utf-8"));
          });
        stream.write(`cd /blog\r\n`);
        stream.write(`cnpm install\r\n`);
        stream.end(`exit\r\n`);
      });
    });
  } catch (e) {
    console.log(e);
  }
};

const handleLn = async conn => {
  try {
    await execRemote(conn, "rm /etc/nginx/conf.d/default.conf -f");
    return await execRemote(
      conn,
      "ln -s /blog/nginx.conf /etc/nginx/conf.d/zblog.conf"
    );
  } catch (e) {
    console.log(e);
  }
};

const importSql = (conn, sqlInfo) => {
  try {
    return new Promise((resolve, reject) => {
      conn.shell((err, stream) => {
        if (err) return reject(err);
        stream
          .on("close", () => {
            resolve();
          })
          .on("data", data => {
            console.log(data.toString("utf-8"));
          })
          .on("error", err => {
            reject(err);
          })
          .stderr.on("data", function(data) {
            reject(data.toString("utf-8"));
          });
        stream.write(`mysql -u${sqlInfo.account} -p\r\n`);
        setTimeout(() => {
          stream.write(`${sqlInfo.password}\r\n`);
          setTimeout(() => {
            stream.write(`create database zblog;\r\n`);
            stream.write(`use zblog;\r\n`);
            stream.write(`set names utf8mb4;\r\n`);
            stream.write(`source /blog/zblog.sql;\r\n`);
            stream.write(`quit\r\n`);
            stream.write(`exit\r\n`);
          }, 800);
        }, 800);
      });
    });
  } catch (e) {
    console.log(e);
  }
};

const startPm2 = async conn => {
  try {
    return new Promise((resolve, reject) => {
      conn.shell((err, stream) => {
        if (err) return reject(err);
        stream
          .on("close", () => {
            resolve();
          })
          .on("data", data => {
            console.log(data.toString("utf-8"));
          })
          .on("error", err => {
            reject(err);
          })
          .stderr.on("data", function(data) {
            reject(data.toString("utf-8"));
          });
        stream.write(`cd /blog\r\n`);
        stream.write(`pm2 restart pm2.json\r\n`);
        stream.write(`exit\r\n`);
      });
    });
  } catch (e) {
    console.log(e);
  }
};

const startNginx = async conn => {
  try {
    await execRemote(conn, "nginx -s stop");
    return await execRemote(conn, "nginx");
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
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
};
