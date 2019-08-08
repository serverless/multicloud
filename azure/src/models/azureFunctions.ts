import { CloudProviderRuntime } from "@multicloud/sls-core";

/**
 * The Azure functions runtime context
 */
export interface AzureFunctionsRuntime extends CloudProviderRuntime {
  event: any;
  context: {
    bindingData: any;
    bindingDefinitions: BindingDefinition[];
    invocationId: string;
    log: AzureLog;
    done: (err: any, response: any) => void;
    req?: any;
    res?: any;
  };
}

/**
 * Azure JavaScript logging function definition.
 */
export type LogFunction = (message: string) => void;

/**
 * Azure logging interface, as per documentation:
 * https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node#context-object
 */
export type AzureLog = LogFunction & {
  verbose: LogFunction;
  info: LogFunction;
  warn: LogFunction;
  error: LogFunction;
}

/**
 * The azure functions binding definition
 */
export interface BindingDefinition {
  name: string;
  type: string;
  direction: BindingDirection;
}

/**
 * The Azure functions binding direction
 */
export enum BindingDirection {
  In = "in",
  Out = "out",
}
