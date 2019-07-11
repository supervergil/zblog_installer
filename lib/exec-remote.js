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
            output += data.toString("utf-8");
          })
          .stderr.on("data", function(data) {
            resolve({ status: 0, data: data.toString("utf-8") });
          });
      }
    });
  });
};

module.exports = execRemote;
