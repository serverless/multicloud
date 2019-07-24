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
export const ExceptionMiddleware = (options: ExceptionOptions) =>
  (context: CloudContext, next: Function): Promise<void> => {
    function onError(err) {
      options.log(err);
      context.send(err, 500);
    }

    try {
      return next().catch(onError);
    } catch (err) {
      onError(err);
    }
  };
