import { CloudContext, Middleware } from "..";
import { Logger, ConsoleLogger } from "../services";

/**
 * Options for Request Logging
 */
export interface LoggingOptions {
  /** Logging Service */
  logger: Logger;
  /** Name of handler for which to log messages */
  handlerName: string;
}

/**
 * Middleware for logging start and stop of function handler. Returns
 * async function that accepts the CloudContext and the `next` Function
 * in the middleware chain
 * @param options Options for logging request
 */
export const RequestLoggingMiddleware = (options: LoggingOptions): Middleware =>
  async (_: CloudContext, next: Function): Promise<void> => {
    const logger: Logger = options.logger || new ConsoleLogger();

    logger.log(`Starting request for handler: ${options.handlerName}`);
    await next();
    logger.log(`Finished request for handler: ${options.handlerName}`);
  };
