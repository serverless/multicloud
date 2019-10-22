import "reflect-metadata";
import { injectable, inject } from "inversify";
import { CloudRequest } from "../cloudRequest";
import { CloudResponse, CloudResponseLike } from "../cloudResponse";
import { CloudContext, CloudProviderRuntime } from "../cloudContext";
import { ComponentType } from "../cloudContainer";

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

  public send(response: CloudResponseLike): void;
  public send(body: any, status?: number, contentType?: string): void

  public send(bodyOrResponse?: any, status?: number, contentType?: string) {
    if (this.res) {
      const response: CloudResponseLike = {
        body: bodyOrResponse ? (bodyOrResponse.body || bodyOrResponse): null,
        status: status || 200,
        headers: {}
      };

      if (contentType) {
        response.headers["Content-Type"] = contentType;
      }

      this.res.send(response);
    }

    this.done();
  };

  public done: () => void;

  public flush() {
  };
}
