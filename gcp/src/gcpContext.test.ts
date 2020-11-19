import { GcpContext, GcpResponse } from ".";

const runtimeArgs = [
  {},
  {
    eventId: "12344",
  }
];

const createGcpContext = (args): GcpContext => {
  const gcpContext = new GcpContext(args);
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
    context.send(body, 400);
    console.log(context);
    expect(context.res.send).toBeCalledWith(body, 400);
  });
});
