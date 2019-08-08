import "reflect-metadata";
import { AzureRequest, AzureResponse } from ".";
import { CloudContext, ComponentType } from "@multicloud/sls-core";
import { CloudStorage, ProviderType } from "@multicloud/sls-core";
import { injectable, inject } from "inversify";
import { AzureFunctionsRuntime, BindingDirection } from "./models/azureFunctions";

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
    this.providerType = ProviderType.Azure;
    this.runtime = {
      context: args[0],
      event: args[1]
    };
    this.id = this.runtime.context.invocationId;

    // Azure supports multiple input event bindings. Set the first one to the generic event
    // Other bindings are set dynamically based on the function.json naming conventions.
    this.event = this.runtime.event;

    this.processInputBindings(args);
    this.redirectConsole();
  }

  /** "azure" */
  public providerType: string;
  /** Unique identifier for request */
  public id: string;
  /** The incoming event source */
  public event: any;
  /** HTTP Request */
  public req: AzureRequest;
  /** HTTP Response */
  public res: AzureResponse;
  /** Azure Storage Service */
  public storage: CloudStorage;
  /** Original runtime context for Azure Function */
  public runtime: AzureFunctionsRuntime;
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

      this.done();
    }
    finally {
      this.restoreConsole();
    }
  }

  public flush() {
    if (this.res) {
      this.res.flush();
    }
  }

  /**
   * Processing the incoming Azure Functions bindings and attaches the
   * values onto the CloudContext for easy retrieval.
   * @param args The original Azure runtime handler arguments
   */
  private processInputBindings(args: any[]): void {
    this.runtime.context.bindingDefinitions
      .filter((binding) => binding.direction === BindingDirection.In)
      .forEach((binding, index) => {
        if (!this[binding.name]) {
          this[binding.name] = args[index + 1];
        }
      });
  }

  private redirectConsole(): void {
    // Azure Functions (JavaScript) expect developers to use `context.log`,
    // instead of the usual console logging APIs. This effectively redirects
    // console.* logging calls to use the Azure context.* logging equivalents
    // https://github.com/Azure/azure-functions-host/issues/162

    //NOTE: the shape of the logging APIs is atypical than what might be expected:
    //      https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node#context-object
    if (this.runtime.context.log && this.runtime.context.log instanceof Function) {
      console.log = this.runtime.context.log;
    }

    if (this.runtime.context.log.info && this.runtime.context.log.info instanceof Function) {
      console.info = this.runtime.context.log.info;
    }

    if (this.runtime.context.log.warn && this.runtime.context.log.warn instanceof Function) {
      console.warn = this.runtime.context.log.warn;
    }

    if (this.runtime.context.log.error && this.runtime.context.log.error instanceof Function) {
      console.error = this.runtime.context.log.error;
    }

    // debug and trace have no true analog; using verbose, which has no counterpart in console.* APIs
    if (this.runtime.context.log.verbose && this.runtime.context.log.verbose instanceof Function) {
      console.debug = this.runtime.context.log.verbose;
      console.trace = this.runtime.context.log.verbose;
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
