import { GcpBackgroundFunctionRuntime } from ".";
import { GcpResponse, GcpContext } from "../";

const createGcpContext = (args): GcpContext => {
  const context = new GcpContext(args);
  context.res = new GcpResponse(context);
  return context;
};

const defaultParams: any[] = [
  { _readableState: { highWaterMark: expect.any(String) },
    headers: { "x-appengine-request-log-id": "123" } },
  {},
  jest.fn(() => null),
];

describe("GCP Background Functions", () => {
  it("flush() should call callback()", () => {
    const backgroundFunction = new  GcpBackgroundFunctionRuntime();
    const callback = jest.fn();
    backgroundFunction.callback = callback;
    const callbackSpy = jest.spyOn(backgroundFunction, "callback");

    const gcpContext = createGcpContext(defaultParams);
    const response = new GcpResponse(gcpContext);
    backgroundFunction.flush(response);
    expect(callbackSpy).toBeCalled();
  });
});
