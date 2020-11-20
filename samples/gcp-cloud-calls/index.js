
const { App, CloudContainer } = require("../../core/lib");
const { GcpModule, GcpFunctionCloudService} = require("../../gcp/lib");

const container = new CloudContainer();
container.registerModule(new GcpModule());

const app = new App(new GcpModule());
const caller = new GcpFunctionCloudService(container);

module.exports.helloWorld = (req, res) => {
  res.send('Hello, World');
};