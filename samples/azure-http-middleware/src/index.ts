import { AzureModule } from "../../../azure/lib/azureModule";
import { CloudContainer, App, Handler, CloudContext } from "@multicloud/sls-core/lib";
import { HTTPBindingMiddleware } from "../../../core/lib/httpBindingMiddleware"

const container = new CloudContainer();
container.registerModule(new AzureModule());

const handler: Handler = async (context: CloudContext) => {
  context.res.send("HTTPMiddleware is working", 200);
};

const app = new App(container);

export default app.use([HTTPBindingMiddleware(container)], handler);
