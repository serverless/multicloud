import {
  App,
  createValidationMiddleware,
  Handler,
  ContainerResolver
} from "@multicloud/sls-core";

import { createJoiQueryValidationOptions } from "./middleware";

import { AzureContext } from "@multicloud/sls-azure/lib/azureContext";

import * as Joi from "@hapi/joi";

const schema: Joi.AnySchema = Joi.object({
  hi: Joi.string().required()
});

const validationMiddleware = createValidationMiddleware(
  createJoiQueryValidationOptions(schema)
);

const handler: Handler = context => {
  context.send(`Hello ${context.req.query.hi}`, 200);
};

const resolver: ContainerResolver = {
  resolve: <T>(...args: any[]): T => {
    const context = new AzureContext(args[0][0]);
    return (context as unknown) as T;
  }
};

const app = new App(resolver);
const httpTrigger = app.use([validationMiddleware], handler);

export default httpTrigger;
