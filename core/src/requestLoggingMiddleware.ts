import { CloudContext } from "./cloudContext";
import { Middleware } from "./middleware";
import { Logger, ConsoleLogger } from "./logger";

export interface LoggingOptions {
  logger: Logger;
  handlerName: string;
}

export const RequestLoggingMiddleware = (
  options: LoggingOptions
): Middleware => async (
  context: CloudContext,
  next: Function
): Promise<void> => {
  const logger: Logger = options.logger || new ConsoleLogger();

  logger.log(`Starting request for handler: ${options.handlerName}`);
  await next();
  logger.log(`Finished request for handler: ${options.handlerName}`);
};
