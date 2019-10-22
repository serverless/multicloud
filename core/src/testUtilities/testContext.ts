import "reflect-metadata";
import { injectable, inject } from "inversify";
import { CloudRequest } from "../cloudRequest";
import { CloudResponse } from "../cloudResponse";
import { CloudContext, CloudProviderRuntime } from "../cloudContext";
import { ComponentType } from "../cloudContainer";
import { CloudContextBase } from "../cloudContextBase";

@injectable()
export class TestContext extends CloudContextBase implements CloudContext {
  public constructor(@inject(ComponentType.RuntimeArgs) args?: any[]) {
    super();

    if (args && args.length) {
      this.runtime.context = args[0];
      this.runtime.event = args[1];
    }

    this.id = this.runtime.context.id || Math.random().toString(36).substring(7)
    this.event = this.runtime.event;
  }

  public runtime: CloudProviderRuntime = {
    context: {},
    event: {}
  };

  public providerType: string = "test";
  public id: string;
  public event: any;
  public container?;
  public req?: CloudRequest;
  public res?: CloudResponse;
  public storage?;
  public logger?;
  public service?;
  public telemetry?;

  public done: () => void;

  public flush() {
    // Intentionally left blank
  }
}
