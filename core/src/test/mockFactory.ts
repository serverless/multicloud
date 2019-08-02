import { Middleware, Handler } from "../app";
import { CloudContext } from "../cloudContext";

export default class MockFactory {
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
}
