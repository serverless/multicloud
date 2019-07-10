import { ValidationOptions, ValidationResult } from "@multicloud/sls-core";
import { CloudContext, Middleware } from "@multicloud/sls-core";

export class AuthorizeValidationResult implements ValidationResult {
  public constructor(
    public authorized: boolean,
    private context: CloudContext,
    public message: string
  ) {}

  public hasError(): boolean {
    return !this.authorized;
  }

  public send(): Promise<void> {
    return Promise.resolve(this.context.send(this.message, 401));
  }
}

export class AuthorizationValidationOptions implements ValidationOptions {
  public constructor(
    public header: string,
    public message: string,
    public compare?: any
  ) {}

  public validate = (context: CloudContext): Promise<ValidationResult> => {
    const value = context.req.headers[this.header];
    const result =
      !!value && (this.compare === undefined || value === this.compare);

    return Promise.resolve(
      new AuthorizeValidationResult(result, context, this.message)
    );
  };
}

export const createAuthorizationMiddleware = (
  options: AuthorizationValidationOptions
): Middleware => async (
  context: CloudContext,
  next: Function
): Promise<void> => {
  const result = await options.validate(context);

  if (result.hasError()) {
    await result.send();
    return;
  }
  return next();
};
