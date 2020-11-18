import { GcpContext } from ".";

const runtimeArgs = [
  {},
  {
    eventId: "12344",
  }
];

const createGcpContext = (args): GcpContext => {
  const gcpContext = new GcpContext(args);
  gcpContext.done = jest.fn();
  return gcpContext;
};

describe("GCP context", () => {
  it("eventId should be set", () => {
    const context = createGcpContext(runtimeArgs);
    expect(context.id).toEqual(runtimeArgs[1].eventId);
  });
});
