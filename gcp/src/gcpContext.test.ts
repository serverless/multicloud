import { GcpContext, GcpResponse } from ".";

const runtimeArgs = [
  {
    _readableState: { highWaterMark: "123" },
    headers: { "x-appengine-request-log-id": "123" }
  },
  {},
  {},
  jest.fn(),
];

const backgroundRuntimeArgs = [
  {},
  {
    eventId: "3214",
  },
  {},
  jest.fn(),
];

const createGcpContext = (args): GcpContext => {
  let gcpContext = new GcpContext(args);
  gcpContext.res = new GcpResponse(gcpContext);
  gcpContext.done = jest.fn();
  gcpContext.res.flush = () => {
    return { status: jest.fn() };
  };
  return gcpContext;
};

describe("GCP context", () => {
  it("highwaterMark should be set to id", () => {
    const context = createGcpContext(runtimeArgs);
    expect(context.id).toEqual(runtimeArgs[0]._readableState.highWaterMark);
  });

  it("eventId should be set to id", () => {
    const context = createGcpContext(backgroundRuntimeArgs);
    expect(context.id).toEqual(backgroundRuntimeArgs[1].eventId);
  });

  it("when send() calls response.send() on httpTrigger with custom status", () => {
    const context = createGcpContext(runtimeArgs);
    const body = { message: "oh Crap!" };
    context.res = new GcpResponse(context);
    context.res.send = jest.fn();
    context.send(body);
    expect(context.res.send).toBeCalledWith(body, 200);
  });

  it("send() calls context.done() to signal handler is complete", () => {
    const context = createGcpContext(runtimeArgs);
    context.send("test", 200);

    expect(context.done).toBeCalled();
  });

  it("send() calls context.done() to signal handler is complete", () => {
    let context = new GcpContext(runtimeArgs);
    context.done = jest.fn();
    context.send("test", 200);
    expect(context.done).toBeCalled();
  });

  it("flush() calls response.flush() to call final Gcp callback", () => {
    const context = createGcpContext(runtimeArgs);
    const flushSpy = jest.spyOn(context.res, "flush");
    context.send("test", 200);
    context.flush();
    expect(flushSpy).toBeCalled();
  });
});
