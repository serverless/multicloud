import { Middleware } from "../app";
import { CloudContext } from "../cloudContext";

/**
 * Options for handling exceptions
 */
export interface ExceptionOptions {
  /** Log error message */
  log: (error: string) => Promise<void>;
}

/**
 * Middleware for handling exceptions. Returns async function that accepts the
 * CloudContext and the `next` Function in the middleware chain
 * @param options Options for handling exceptions
 */
export const ExceptionMiddleware = (options: ExceptionOptions): Middleware =>
  (context: CloudContext, next: () => Promise<void>): Promise<void> => {
    function onError(err: any, status: number = 500) {
      options.log(err);

      const result = {
        requestId: context.id,
        message: typeof err === "string" ? err : (err instanceof Error ? err.toString() : JSON.stringify(err)),
        timestamp: new Date()
      };

      context.send(result, status);
    }

    try {
      context.error = onError;
      return next().catch(onError);
    } catch (err) {
      onError(err);
    }
  };
