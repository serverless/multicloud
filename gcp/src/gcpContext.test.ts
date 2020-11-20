import { GcpContext, GcpResponse } from ".";

const runtimeArgs = [
  {},
  {
    eventId: "12344",
  },
  jest.fn(),
];

const createGcpContext = (args): GcpContext => {
  let gcpContext = new GcpContext(args);
  gcpContext.res = new GcpResponse(gcpContext);
  gcpContext.done = jest.fn();
  return gcpContext;
};

describe("GCP context", () => {
  it("eventId should be set", () => {
    const context = createGcpContext(runtimeArgs);
    expect(context.id).toEqual(runtimeArgs[1].eventId);
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
