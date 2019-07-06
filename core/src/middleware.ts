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

      const next = async () => {
        const middleware = middlewares[index];
        if (middleware) {
          index++;
          await middleware(context, next);
        } else {
          await handler(context);
        }
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
