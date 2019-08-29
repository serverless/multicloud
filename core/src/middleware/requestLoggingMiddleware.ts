import { Logger } from "../services/logger";
import { Middleware } from "../app";
import { CloudContext } from "../cloudContext";
import { ConsoleLogger } from "../services/consoleLogger";

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
  async (_: CloudContext, next: () => Promise<void>): Promise<void> => {
    const logger: Logger = options.logger || new ConsoleLogger();

    logger.log(`Starting request for handler: ${options.handlerName}`);
    await next();
    logger.log(`Finished request for handler: ${options.handlerName}`);
  };
