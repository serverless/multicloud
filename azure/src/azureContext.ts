import "reflect-metadata";
import { AzureRequest, AzureResponse } from ".";
import { CloudContext, ComponentType } from "@multicloud/sls-core";
import { CloudStorage } from "@multicloud/sls-core";
import { injectable, inject } from "inversify";

/**
 * Implementation of Cloud Context for Azure Functions
 */
@injectable()
export class AzureContext implements CloudContext {
  /**
   * Initializes new AzureContext, injects runtime arguments of Azure Functions
   * @param args Runtime arguments for Azure function
   */
  public constructor(@inject(ComponentType.RuntimeArgs) private args: any[]) {
    this.runtime = args[0];
    this.providerType = "azure";
    this.id = this.runtime.invocationId;
    this.redirectConsole();
  }

  /** "azure" */
  public providerType: string;
  /** Unique identifier for request */
  public id: string;
  /** HTTP Request */
  public req: AzureRequest;
  /** HTTP Response */
  public res: AzureResponse;
  /** Azure Storage Service */
  public storage: CloudStorage;
  /** Original runtime context for Azure Function */
  public runtime: any;
  /** Signals to the runtime that the request is complete */
  public done: () => void;

  /**
   * Send response from Azure Function
   * @param body Body of response
   * @param status Status code of response
   */
  public send(body: any, status: number = 200): void {
    try {
      if (this.res) {
        this.res.send(body, status);
      }

      this.runtime.done();
      this.done();
    }
    finally {
      this.restoreConsole();
    }
  }

  private redirectConsole(): void {
    // Azure Functions (JavaScript) expect developers to use `context.log`,
    // instead of the usual console logging APIs. This effectively redirects
    // console.* logging calls to use the Azure context.* logging equivalents
    // https://github.com/Azure/azure-functions-host/issues/162
    if (this.runtime.log && this.runtime.log instanceof Function) {
      console.log = this.runtime.log;
    }

    if (this.runtime.info && this.runtime.info instanceof Function) {
      console.info = this.runtime.info;
    }

    if (this.runtime.warn && this.runtime.warn instanceof Function) {
      console.warn = this.runtime.warn;
    }

    if (this.runtime.error && this.runtime.error instanceof Function) {
      console.error = this.runtime.error;
    }

    if (this.runtime.debug && this.runtime.debug instanceof Function) {
      console.debug = this.runtime.debug;
    }

    if (this.runtime.trace && this.runtime.trace instanceof Function) {
      console.trace = this.runtime.trace;
    }
  }

  private restoreConsole(): void {
    delete console.log;
    delete console.info;
    delete console.warn;
    delete console.error;
    delete console.debug;
    delete console.trace;
  }
}
