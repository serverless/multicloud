import { CloudContext } from ".";

export interface ContainerResolver {
  resolve<T>(...args: any[]): T;
}

export class App {
  public constructor(private containerResolver: ContainerResolver) {}

  public use(middlewares: Middleware[], handler: Handler): Function {
    return async (...args: any[]) => {
      const context = this.containerResolver.resolve<CloudContext>(args);
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

export type Middleware = (context: CloudContext, next: Function) => Promise<void> | void;
export type Handler = (Context: CloudContext) => Promise<void> | void;
