import { GcpResponse } from "../gcpResponse";
import { GcpFunctionRuntime } from "./gcpCloudFunction";

export class GcpBackgroundFunctionRuntime implements GcpFunctionRuntime {
  public event: any;
  public context: {
    eventId: string;
  };
  public callback: (err, response) => void;

  public flush(response: GcpResponse): void {
    this.callback(null, {
      headers: response.headers.toJSON(),
      body: response.body,
      statusCode: response.status || 200,
    });
  }
}
