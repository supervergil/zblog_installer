const execRemote = require("./exec-remote");

const uploadNodejsRpm = async conn => {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftpStream) => {
      if (!err) {
        sftpStream.stat("/nodejs.rpm", (err3, stats) => {
          if (err3) {
            sftpStream.fastPut(
              "./package/redhat/nodejs.rpm",
              "/nodejs.rpm",
              err2 => {
                if (!err2) {
                  resolve("EXEC_FINISHED");
                } else {
                  reject("COMMAND_NOT_FOUND");
                }
              }
            );
          } else {
            resolve("EXEC_FINISHED");
          }
        });
      } else {
        reject("COMMAND_NOT_FOUND");
      }
    });
  });
};

const uploadMysqlRpm = async conn => {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftpStream) => {
      if (!err) {
        sftpStream.stat("/mysql.rpm", (err3, stats) => {
          if (err3) {
            sftpStream.fastPut(
              "./package/redhat/mysql.rpm",
              "/mysql.rpm",
              err2 => {
                if (!err2) {
                  resolve("EXEC_FINISHED");
                } else {
                  reject("COMMAND_NOT_FOUND");
                }
              }
            );
          } else {
            resolve("EXEC_FINISHED");
          }
        });
      } else {
        reject("COMMAND_NOT_FOUND");
      }
    });
  });
};

const uploadMysqlServerRpm = async conn => {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftpStream) => {
      if (!err) {
        sftpStream.stat("/mysql-server.rpm", (err3, stats) => {
          if (err3) {
            sftpStream.fastPut(
              "./package/redhat/mysql-server.rpm",
              "/mysql-server.rpm",
              err2 => {
                if (!err2) {
                  resolve("EXEC_FINISHED");
                } else {
                  reject("COMMAND_NOT_FOUND");
                }
              }
            );
          } else {
            resolve("EXEC_FINISHED");
          }
        });
      } else {
        reject("COMMAND_NOT_FOUND");
      }
    });
  });
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

const checkLinuxEnv = async conn => {
  try {
    await execRemote(conn, "sudo rm -f /var/run/yum.pid");
    const { status } = await execRemote(conn, "yum --version");
    if (status === "COMMAND_NOT_FOUND") {
      return "DEBIAN";
    } else if (status === "EXEC_FINISHED") {
      return "REDHAT";
    }
  } catch (e) {
    console.log(e);
  }
};

const checkNodeEnv = async conn => {
  try {
    const { status } = await execRemote(conn, "node -v");
    return status;
  } catch (e) {
    console.log(e);
  }
};

const checkMysqlEnv = async (conn, linuxEnv) => {
  try {
    const { status } = await execRemote(conn, "mysql --help");
    return status;
  } catch (e) {
    console.log(e);
  }
};

const installMysql = async (conn, linuxEnv) => {
  try {
    if (linuxEnv === "REDHAT") {

      /*
        yum install -y numactl
        rpm -qa |grep -i mariadb
        yum remove -y mariadb包名
        rpm -ivh /mysql-common.rpm
        rpm -ivh /mysql-libs.rpm
        rpm -ivh /mysql-client.rpm
        rpm -ivh /mysql-server.rpm
        service mysqld start
      */ 

      await execRemote(
        conn,
        "sudo yum localinstall /mysql.rpm -y --nogpgcheck"
      );
      await execRemote(
        conn,
        "sudo yum localinstall /mysql-server.rpm -y --nogpgcheck"
      );
      await execRemote(conn, "sudo service mysqld start");
      return "EXEC_FINISHED";
    } else if (linuxEnv === "DEBIAN") {
    }
  } catch (e) {
    console.log(e);
  }
};

const installNode = async (conn, linuxEnv) => {
  try {
    if (linuxEnv === "REDHAT") {
      const { status } = await execRemote(
        conn,
        "rpm -ivh /nodejs.rpm"
      );
      return status;
    } else if (linuxEnv === "DEBIAN") {
      await execRemote(conn, "sudo apt-get install -y nodejs");
      await execRemote(conn, "sudo apt-get install -y npm");
      return "EXEC_FINISHED";
    }
  } catch (e) {
    console.log(e);
  }
};

const checkCnpm = async conn => {
  try {
    const { status } = await execRemote(conn, "cnpm -v");
    return status;
  } catch (e) {
    console.log(e);
  }
};

const installCnpm = async conn => {
  try {
    const { status } = await execRemote(
      conn,
      "npm install -g cnpm --registry https://registry.npm.taobao.org"
    );
    return status;
  } catch (e) {
    console.log(e);
  }
};

const checkPm2 = async conn => {
  try {
    const { status } = await execRemote(conn, "pm2 -v");
    return status;
  } catch (e) {
    console.log(e);
  }
};

const installPm2 = async conn => {
  try {
    const { status } = await execRemote(
      conn,
      "sudo npm install -g pm2  --registry https://registry.npm.taobao.org"
    );
    return status;
  } catch (e) {
    console.log(e);
  }
};

const checkNginxEnv = async (conn, linuxEnv) => {
  try {
    const { data } = await execRemote(conn, "nginx -h");
    if (data.startsWith("nginx version")) {
      return "EXEC_FINISHED";
    } else {
      return "COMMAND_NOT_FOUND";
    }
  } catch (e) {
    console.log(e);
  }
};

const installNginx = async (conn, linuxEnv) => {
  try {
    if (linuxEnv === "REDHAT") {
      await execRemote(
        conn,
        "rpm -Uvh http://nginx.org/packages/centos/7/noarch/RPMS/nginx-release-centos-7-0.el7.ngx.noarch.rpm"
      );
      await execRemote(conn, "sudo yum install -y nginx");
      await execRemote(conn, "nginx");
      return "EXEC_FINISHED";
    } else if (linuxEnv === "DEBIAN") {
      return;
    }
  } catch (e) {
    console.log(e);
  }
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
};
