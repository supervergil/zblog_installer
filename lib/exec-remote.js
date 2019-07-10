const execRemote = (conn, command, streaming) => {
  return new Promise((resolve, reject) => {
    let output = "";
    conn.exec(command, (err, stream) => {
      if (err) {
        reject(err);
      } else {
        stream
          .on("end", () => {
            resolve({ status: "EXEC_FINISHED", data: output });
          })
          .on("data", data => {
            output += data.toString();
            if (streaming) {
              streaming(data);
            }
          })
          .stderr.on("data", function(data) {
            resolve({
              status: "COMMAND_NOT_FOUND",
              data: data.toString("utf-8")
            });
          });
      }
    });
  });
};

module.exports = execRemote;
