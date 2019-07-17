const { App, CloudContainer } = require("@multicloud/sls-core");
const {
  AzureModule,
  AzureFunctionCloudService
} = require("@multicloud/sls-azure");


const container = new CloudContainer();
container.registerModule(new AzureModule());
container.registerModule({
  init: container => {
    container.bind("google").toConstantValue({
      name: "google",
      method: "get",
      http: "http://www.google.com"
    });
  }
});

const app = new App(container);
const caller = new AzureFunctionCloudService(container)

const handler = async (context) => {
  const result = await caller.invoke("google");
  context.send(result.data);
};

module.exports = app.use([], handler);
