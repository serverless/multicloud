import { AzureModule } from "@multicloud/sls-azure/lib/AzureModule";
import { CloudContainer, App, Handler, CloudContext } from "@multicloud/sls-core";
console.log('hello');
const container = new CloudContainer();
container.registerModule(new AzureModule());

const handler: Handler = (context: CloudContext) => {
  context.send("Foo, Bar", 200);
};

const app = new App(container);

export default app.use([], handler);
