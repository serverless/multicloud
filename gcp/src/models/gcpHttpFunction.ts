import { GcpResponse } from "../gcpResponse";
import { GcpFunctionRuntime } from "./gcpCloudFunction";


export class GcpHttpFunctionRuntime implements GcpFunctionRuntime {
  //Corresponds to the req parameter as this acts as the event trigger
  public event: any;
  public context: {
    set: any;
    status: any;
    send: any;
  }

  public flush(response: GcpResponse): void {
    this.context.set(response.headers.toJSON());
    this.context.status(response.status).send(response.body);
  }
}
