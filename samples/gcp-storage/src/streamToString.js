module.exports.streamToString = async (readableStream) => new Promise((resolve, reject) => {
  const chunks = [];
  readableStream.on("data", (data) => {
    chunks.push(data.toString());
  });
  readableStream.on("end", () => {
    resolve(chunks.join(""));
  });
  readableStream.on("error", reject);
});
