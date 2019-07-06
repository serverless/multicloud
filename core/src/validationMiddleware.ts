import { CloudContext } from ".";
import { Middleware } from "./middleware";

export interface ValidationResult {
  hasError(): boolean;
  send(): Promise<void>;
}

export interface ValidationOptions {
  validate: (context: CloudContext) => Promise<ValidationResult>;
};


export const createValidationMiddleware = (options: ValidationOptions): Middleware => async (context: CloudContext, next: Function): Promise<void> => {
  const result = await options.validate(context);

  if(result.hasError()) {
    await result.send();
    return;
  }
  return next();
}
