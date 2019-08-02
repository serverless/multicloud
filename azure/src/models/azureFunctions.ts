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
    log: (message: string) => void;
    debug: (message: string) => void;
    info: (message: string) => void;
    trace: (message: string) => void;
    message: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
    done: (err: any, response: any) => void;
    req?: any;
    res?: any;
  };
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
