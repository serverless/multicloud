import { CloudContext } from "./cloudContext";
import { Middleware } from "./middleware";
import { Logger, ConsoleLogger } from "./logger"

export const LoggingServiceMiddleware = (logger: Logger): Middleware => async (
  context: CloudContext,
  next: Function
): Promise<void> => {
  context.logger = logger || new ConsoleLogger();
  await next();
};
