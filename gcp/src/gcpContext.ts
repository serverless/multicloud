import "reflect-metadata";
import { GcpRequest, GcpResponse } from ".";
import { CloudContext, ComponentType } from "@multicloud/sls-core";
import { injectable, inject } from "inversify";
<<<<<<< HEAD
import { GcpFunctionRuntime } from "./models/gcpCloudFunction";
=======
import { CloudFunctionRuntime } from "./models/gcpCloudFunction";
>>>>>>> a98564b... Added gcpContext

/**
 * Implementation of Cloud Context for GCP Function
 */
@injectable()
export class GcpContext implements CloudContext {
  /**
   * Initializes new GcpContext, injects runtime arguments of GCP Functions.
   * Sets runtime parameters from original arguments
   * @param args Runtime arguments for GCP Function.
   */
  public constructor(@inject(ComponentType.RuntimeArgs) args: any[]) {
    this.providerType = "gcp";

    this.runtime = {
      event: args[0],
      context: args[1],
      callback: args[2],
    };

    this.id = this.runtime.context.eventId;

    // GCP has a single incoming event source
    this.event = this.runtime.event; // https://www.serverless.com/framework/docs/providers/google/guide/events/
  }

  /** "gcp" */
  public providerType: string;
  /** Unique identifier for request */
  public id: string;
  /** The incoming event source */
  public event: any;
  /** HTTP Request */
  public req: GcpRequest;
  /** HTTP Response */
  public res: GcpResponse;
  /** Original runtime arguments for GCP Function */
<<<<<<< HEAD
  public runtime: GcpFunctionRuntime;
=======
  public runtime: CloudFunctionRuntime;
>>>>>>> a98564b... Added gcpContext
  /** Signals to the framework that the request is complete */
  public done: () => void;

  /**
   * Send response from GCP Function
   * @param body Body of response
   * @param status Status code of response
   */
  public send(body: any, status: number = 200): void {
    if (this.res) {
      this.res.send(body, status);
    }
    this.done();
  }

  public flush() {
    if (this.res) {
      this.res.flush();
    }
  }
}

