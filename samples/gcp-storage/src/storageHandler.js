const { App, HTTPBindingMiddleware, StorageMiddleware } = require("core");
const { GcpModule } = require("gcp");
const { streamToString } = require("./streamToString");
const { bucketName } = require("../config.google.json");

const app = new App(new GcpModule());

module.exports.handler = app.use(
  [HTTPBindingMiddleware(), StorageMiddleware()],
  async (context) => {
    const { name } = context.req.query.toJSON();
    const opts = {
      container: bucketName,
      path: "test.txt",
      body: `Hello ${name || "World"}`,
    };
    await context.storage.write(opts);
    const readStream = await context.storage.read(opts);
    const result = await streamToString(readStream);
    context.send({ result }, 200);
  }
);

module.exports.helloGCS = app.use([], async (context) => {
  const file = context.event;
  // console.log(`  Event: ${context.context.eventId}`);
  // console.log(`  Event Type: ${context.eventType}`);
  console.log(`  Bucket: ${file.bucket}`);
  console.log(`  File: ${file.name}`);
  console.log(`  Metageneration: ${file.metageneration}`);
  console.log(`  Created: ${file.timeCreated}`);
  console.log(`  Updated: ${file.updated}`);
  console.log(`  EventId: ${context.id}`);
});
