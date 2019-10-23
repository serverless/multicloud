import { Guard } from "./common/guard";
import { ensurePromise } from "./common/util";
import { CloudContainer, CloudModule, ComponentType } from "./cloudContainer";
import { TestModule } from "./testUtilities/testModule";
import { CloudContext } from "./cloudContext";
import { CloudResponseLike } from "./cloudResponse";

/**
 * Base level app. Handles registration for all cloud modules and
 * manages middleware chain
 */
export class App {
  private container: CloudContainer;
  private modules: CloudModule[] = [];
  private middlewares: Middleware[] = [];

  /**
   * Initialize IoC container and register all modules
   * @param modules Array of modules to register
   */
  public constructor(...modules: CloudModule[]) {
    Guard.null(modules);

    if (modules.length === 0 || process.env.NODE_ENV === "test") {
      modules.push(new TestModule());
    }

    this.modules = modules;
    this.container = new CloudContainer();
    this.container.registerModule(...modules);
  }

  /**
   * Array of default middleware components to apply *in order* in application
   * @param middlewares
   */
  public registerMiddleware(...middlewares: Middleware[]) {
    Guard.null(middlewares);
    this.middlewares = middlewares;
  }

  /**
   * Initialize handler function using default middleware pipeline
   * @param handler Serverless Handler function
   */
  public use(handler: Handler): Function;

  /**
   * Apply middleware pipeline and initialize handler function
   * @param middlewares Array of middlewares to apply *in order* in application (Appended to default middlewares)
   * @param handler Serverless Handler function
   */
  public use(middlewares: Middleware[], handler: Handler): Function;

  public use(middlewaresOrHandler: Middleware[] | Handler, handler?: Handler): (...args: any[]) => Promise<CloudContext> {
    return async (...args: any[]): Promise<CloudContext> => {
      // Define the default middlewares for the request
      let requestMiddlewares = [...this.middlewares];

      if (handler) {
        // Append request specific middlewares to the pipeline
        requestMiddlewares = [...requestMiddlewares, ...middlewaresOrHandler as Middleware[]];
      } else {
        handler = middlewaresOrHandler as Handler;
      }

      // Creates a child IoC container for each request into the app
      // This allows multiple calls to the container to reuse the same instance
      // of singleton components such as the `CloudContext`
      const requestContainer = new CloudContainer(this.container);
      requestContainer.registerModule(...this.modules)

      // Bind the runtime arguments sent in from the cloud provider
      // and register them with the IoC container for used in dependency injection
      requestContainer.bind(ComponentType.RuntimeArgs).toConstantValue(args);

      // Retrieve the cloud provider specific cloud context based on the
      // IoC container component registrations & constraints
      // Each cloud provider registers constraints based on the incoming runtime arguments
      const context = requestContainer.resolve<CloudContext>(ComponentType.CloudContext);
      context.container = requestContainer;
      context.done = () => undefined;

      let index = 0;

      try {
        const next = () => {
          const middleware = requestMiddlewares[index];
          let result = null;

          // Recursively loop through the middleware pipeline
          if (middleware) {
            index++;
            result = middleware(context, next);
          } else { // When we are out of middlewares, execute the handler
            result = new Promise((resolve, reject) => {
              context.done = resolve;
              ensurePromise(handler(context))
                .then((handlerResult) => handlerResult && context.send(handlerResult))
                .catch(reject)
            });
          }

          return ensurePromise(result);
        };

        // Executes the middleware chain and handler
        await next();
      } finally {
        // Flush the final response to the cloud provider
        context.flush();
      }

      return context;
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
export type Handler = (context: CloudContext) => HandlerResponse;

export type HandlerResponse = Promise<CloudResponseLike> | CloudResponseLike | Promise<any> | any | void;
