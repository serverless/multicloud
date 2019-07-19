import { CloudContext } from ".";
import { ComponentType, CloudContainer, CloudModule, } from "./cloudContainer";
import Guard from "./common/guard";

export class App {
  private container: CloudContainer;

  public constructor(...modules: CloudModule[]) {
    Guard.null(modules);
    Guard.expression(modules, (values) => values.length > 0);

    this.container = new CloudContainer();
    this.container.registerModule(...modules);
  }

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
          result = handler(context);
        }

        if (result && result.then) {
          return result;
        }

        return Promise.resolve();
      };

      return await next();
    };
  }
}

export type Middleware = (context: CloudContext, next: Function) => Promise<void> | void;
export type Handler = (Context: CloudContext) => Promise<void> | void;
