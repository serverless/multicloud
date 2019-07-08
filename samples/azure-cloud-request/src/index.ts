import {
  App,
  createValidationMiddleware,
  Handler,
  ContainerResolver
} from "@multicloud/sls-core";

import { createJoiQueryValidationOptions } from "./middleware";

import { CloudContainer } from "@multicloud/sls-core";

import * as Joi from "@hapi/joi";
import { AzureModule } from "@multicloud/sls-azure/lib/AzureModule";

const container = new CloudContainer();
container.registerModule(new AzureModule());

const schema: Joi.AnySchema = Joi.object({
  hi: Joi.string().required()
});

const validationMiddleware = createValidationMiddleware(
  createJoiQueryValidationOptions(schema)
);

const handler: Handler = context => {
  context.send(`Hello ${context.req.query.hi}`, 200);
};

const app = new App(container);
const httpTrigger = app.use([validationMiddleware], handler);

export default httpTrigger;
