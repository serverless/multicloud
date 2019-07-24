import { CloudContext } from ".";
import { ComponentType, CloudContainer, CloudModule, } from "./cloudContainer";
import Guard from "./common/guard";
import { ensurePromise } from "./common/util";

/**
 * Base level app. Handles registration for all cloud modules and
 * manages middleware chain
 */
export class App {
  private container: CloudContainer;

  /**
   * Initialize IoC container and register all modules
   * @param modules Array of modules to register
   */
  public constructor(...modules: CloudModule[]) {
    Guard.null(modules);
    Guard.expression(modules, (values) => values.length > 0);

    this.container = new CloudContainer();
    this.container.registerModule(...modules);
  }

  /**
   * Apply middleware array and initialize handler function
   * @param middlewares Array of middlewares to apply *in order* in application
   * @param handler Serverless Handler function
   */
  public use(middlewares: Middleware[], handler: Handler): Function {
    return async (...args: any[]) => {
      this.container.bind(ComponentType.RuntimeArgs).toConstantValue(args);
      const context = this.container.resolve<CloudContext>(ComponentType.CloudContext);
      context.container = this.container;
      let index = 0;

      const next = () => {
        const middleware = middlewares[index];
        let result = null;

        if (middleware) {
          index++;
          result = middleware(context, next);
        } else {
          result = new Promise((resolve, reject) => {
            context.done = resolve;
            return ensurePromise(handler(context)).catch(reject);
          });
        }

        return ensurePromise(result);
      };

      // Executes the middleware chain and handler
      await next();

      // Flush the final response to the cloud provider
      context.flush();
    };
  }
}

/**
 * Middleware type
 * @param context Cloud Context for Serverless function
 * @param next Next function to call in middleware chain
 */
export type Middleware = (context: CloudContext, next: () => Promise<void>) => Promise<void>;

/**
 * Serverless Handler type
 * @param context Cloud Context for Serverless function
 */
export type Handler = (context: CloudContext) => Promise<void> | void;
