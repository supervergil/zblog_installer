const execRemote = (conn, command) => {
  return new Promise((resolve, reject) => {
    let output = "";
    conn.exec(command, (err, stream) => {
      if (err) {
        reject(err);
      } else {
        stream
          .on("close", () => {
            resolve({ status: 1, data: output });
          })
          .on("error", err => {
            reject({ status: 0, data: err.toString("utf-8") });
          })
          .on("data", data => {
            console.log("std:" + data.toString("utf-8"));
            output += data.toString("utf-8");
          })
          .stderr.on("data", function(data) {
            console.log("err:" + data.toString("utf-8"));
            resolve({ status: 0, data: data.toString("utf-8") });
          });
      }
    });
  });
};

module.exports = execRemote;
