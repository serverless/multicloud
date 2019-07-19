import { CloudContext, Middleware } from "..";
import { Logger, ConsoleLogger } from "../services"

export const LoggingServiceMiddleware = (logger: Logger): Middleware => async (
  context: CloudContext,
  next: Function
): Promise<void> => {
  context.logger = logger || new ConsoleLogger();
  await next();
};
