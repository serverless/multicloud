import "reflect-metadata";
import { injectable, inject } from "inversify";
import { ComponentType, CloudContext, CloudProviderRuntime, CloudRequest, CloudResponse } from "..";

@injectable()
export class TestContext implements CloudContext {
  public constructor(@inject(ComponentType.RuntimeArgs) args?: any[]) {
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

  public send(body: any, status: number) {
    if (this.res) {
      this.res.send(body, status);
    }

    this.done();
  };

  public done: () => void;

  public flush() {
  };
}
