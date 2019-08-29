import { Logger } from "../services/logger";
import { Middleware } from "../app";
import { CloudContext } from "../cloudContext";
import { ConsoleLogger } from "../services/consoleLogger";

/**
 * Middleware for logging. Returns async function that accepts the
 * CloudContext and the `next` Function in the middleware chain
 * @param logger Logging Service
 */
export const LoggingServiceMiddleware = (logger: Logger): Middleware =>
  async (context: CloudContext, next: () => Promise<void>): Promise<void> => {
    context.logger = logger || new ConsoleLogger();
    await next();
  };
