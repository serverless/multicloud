import { CloudContext } from ".";
import {
  ContainerResolver,
  ComponentType,
  ContainerRegister,
  CoreModule
} from "./cloudContainer";

export class App {
  public constructor(
    private container: ContainerResolver & ContainerRegister,
  ) {}

  public use(middlewares: Middleware[], handler: Handler): Function {
    return async (...args: any[]) => {
      this.container.registerModule(new CoreModule(args));
      const context = this.container.resolve<CloudContext>(
        ComponentType.CloudContext
      );
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
      await next();
    };
  }
}

export type Middleware = (
  context: CloudContext,
  next: Function
) => Promise<void> | void;
export type Handler = (Context: CloudContext) => Promise<void> | void;
