import { CloudContext, Middleware } from "..";
import { Logger, ConsoleLogger } from "../services";

export interface LoggingOptions {
  logger: Logger;
  handlerName: string;
}

export const RequestLoggingMiddleware = (options: LoggingOptions): Middleware =>
  async (_: CloudContext, next: Function): Promise<void> => {
    const logger: Logger = options.logger || new ConsoleLogger();

    logger.log(`Starting request for handler: ${options.handlerName}`);
    await next();
    logger.log(`Finished request for handler: ${options.handlerName}`);
  };
