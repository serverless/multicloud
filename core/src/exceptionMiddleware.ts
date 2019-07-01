import { CloudContext } from "./cloudContext";

export interface ExceptionOptions {
  log: (error: string) => Promise<void>;
}

export const ExceptionMiddleware = (options: ExceptionOptions) => async (
  context: CloudContext,
  next: Function
): Promise<void> => {
  try {
    await next();
  } catch (err) {
    options.log(err);
    context.send(err, 500);
  }
};
