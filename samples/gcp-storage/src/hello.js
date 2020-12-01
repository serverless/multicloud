const { App, HTTPBindingMiddleware, StorageMiddleware } = require('core');
const { GcpModule } = require('gcp');

const app = new App(new GcpModule());

async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data.toString());
    });
    readableStream.on('end', () => {
      resolve(chunks.join(''));
    });
    readableStream.on('error', reject);
  });
}

module.exports.handler = app.use(
  [HTTPBindingMiddleware(), StorageMiddleware()],
  async (context) => {
    const { name } = context.event.query;
    const opts = {
      container: 'storage_sample123',
      path: 'test.txt',
      body: `Hello ${name || 'World'}`,
    };
    await context.storage.write(opts);
    const readStream = await context.storage.read(opts);
    const result = await streamToString(readStream);
    context.send({ result });
  },
);
