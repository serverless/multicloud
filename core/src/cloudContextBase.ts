import "reflect-metadata";
import { injectable } from "inversify";
import { CloudContext } from "./cloudContext";
import { CloudResponseLike, CloudResponse } from "./cloudResponse";

@injectable()
export abstract class CloudContextBase implements CloudContext {
  [key: string]: any;
  public providerType: string;
  public id: string;
  public event: any;
  public res?: CloudResponse;

  public send(response?: CloudResponseLike): void;
  public send(body?: any, status?: number, contentType?: string): void

  public send(bodyOrResponse: any, status?: number, contentType?: string): void {
    if (this.res) {
      const response: CloudResponseLike = {
        body: bodyOrResponse ? (bodyOrResponse.body || bodyOrResponse) : null,
        status: status || (status ? status : (bodyOrResponse ? bodyOrResponse.status : 200)) || 200,
        headers: bodyOrResponse ? bodyOrResponse.headers || {} : {}
      };

      if (contentType) {
        response.headers["Content-Type"] = contentType;
      }

      this.res.send(response);
    }

    this.done();
  }

  public abstract done(): void;
  public abstract flush(): void;
}
