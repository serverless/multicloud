import { Middleware, Handler } from "../app";
import { CloudContext } from "../cloudContext";

export class MockFactory {
  /**
   * Creates a middleware that executes the specified spy
   * @param spy The spy function to call
   */
  public static createMockMiddleware(spy?: Middleware): Middleware {
    const defaultImp = async (context: CloudContext, next: () => Promise<void>) => {
      return await next();
    };

    if (!spy) {
      spy = defaultImp;
    }

    return jest.fn(async (context: CloudContext, next: () => Promise<void>) => {
      return spy(context, next);
    });
  }

  /**
   * Creates a handler that executes the optional spy function
   * @param spy The spy function to call
   */
  public static createMockHandler(spy?: Handler): Handler {
    const defaultImp = (context: CloudContext) => context.send("OK", 200);

    if (!spy) {
      spy = defaultImp;
    }

    return jest.fn((context: CloudContext) => {
      return spy(context);
    });
  }

  /**
 * Simulates a call to a promise.
 */
  public static simulatePromise(): Promise<void> {
    return new Promise((resolve) => {
      setImmediate(resolve);
    });
  }

  /**
   * Simulates a call as a callback
  */
  public static simulateCallback(err, callback): void {
    if (err) {
      throw err;
    }
    setImmediate(callback);
  }

  private static middlewareMap = new Map();

  /**
   * Creates a spy on a middleware an calls original implementation
   * @param moduleName The module to spy on
   * @param middlewareName The middleware export name
   */
  public static spyOnMiddleware(moduleName: string, middlewareName: string) {
    let createMiddlewareFunction = null;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const origModule = require(moduleName);
    const origMiddleware = origModule[middlewareName];

    // Create a spy that will be bound to the original imported component
    const createMiddlewareSpy = (...args) => {
      const result = origMiddleware(...args);
      const spy = jest.fn(result);

      // Set reference to spy so we can later check and perform assertions against it
      if (createMiddlewareFunction) {
        MockFactory.middlewareMap.set(createMiddlewareFunction, spy);
      }

      return spy;
    };

    createMiddlewareFunction = jest.fn(createMiddlewareSpy);

    // Overwrites the spy onto the original module
    Object.defineProperty(origModule, middlewareName, {
      value: createMiddlewareFunction,
    });

    return createMiddlewareFunction;
  }

  /**
   * Gets the spy associated with the requested middleware
   * @param middleware The middleware
   */
  public static ensureMiddleware(middleware: Function) {
    return MockFactory.middlewareMap.get(middleware) || jest.fn();
  }
}
