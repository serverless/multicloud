const { App, HTTPBindingMiddleware, StorageMiddleware } = require("core");
const { GcpModule } = require("gcp");
const { streamToString } = require("./streamToString");

const app = new App(new GcpModule());

module.exports.handler = app.use(
  [HTTPBindingMiddleware(), StorageMiddleware()],
  async (context) => {
    const { name } = context.req.query;
    const opts = {
      container: "storage_sample123",
      path: "test.txt",
      body: `Hello ${name || "World"}`,
    };
    await context.storage.write(opts);
    const readStream = await context.storage.read(opts);
    const result = await streamToString(readStream);
    context.send({ result }, 200);
  },
);
