import { AzureContext, AzureRequest, AzureResponse } from ".";

jest.mock("./azureResponse");

const done: Function = jest.fn();
const runtimeArgs = [
  {
    invocationId: "12344",
    req: {},
    res: {},
    done,
    log: () => { return 1; },
    warn: () => { return 2; },
    info: () => { return 3; },
    debug: () => { return 4; },
    trace: () => { return 5; },
    error: () => { return 6; },
  }
];

const createAzureContext = (args): AzureContext => {
  const azureContext = new AzureContext(args);
  azureContext.done = jest.fn();

  return azureContext;
};

describe("Azure context", () => {
  let context: AzureContext = undefined;
  beforeEach(() => {
    context = createAzureContext(runtimeArgs);
    context.req = new AzureRequest(context);
    context.res = new AzureResponse(context);
  });

  test("requestId should be set", () => {
    expect(context.id).toEqual(runtimeArgs[0].invocationId);
  });

  test("when send() calls response.send() on httpTrigger", () => {
    const body = { message: "Hello World" };
    context.send(body);
    expect(context.res.send).toHaveBeenCalledWith(body, 200);
  });

  test("when send() calls response.send() on httpTrigger with custom status", () => {
    const body = { message: "oh Crap!" };
    context.send(body, 400);
    expect(context.res.send).toHaveBeenCalledWith(body, 400);
  });

  test("when send() calls runtime done()", () => {
    const body = { message: "oh Crap!" };
    context.send(body, 400);
    expect(done).toHaveBeenCalledWith();
  });

  test("send() calls context.done()", () => {
    context.send("test", 200);
    expect(context.done).toBeCalled();
  });

  test("logging calls should be redirect to Azure context", () => {
    console.log("hi");
    console.warn("whoa");
    console.error("crap");
    console.trace("verbose");
    console.debug("dbg");
    console.info("A-okay");

    expect(runtimeArgs[0].log()).toEqual(1);
    expect(runtimeArgs[0].warn()).toEqual(2);
    expect(runtimeArgs[0].info()).toEqual(3);
    expect(runtimeArgs[0].debug()).toEqual(4);
    expect(runtimeArgs[0].trace()).toEqual(5);
    expect(runtimeArgs[0].error()).toEqual(6);
  });

  test("logging calls redirect and be restored", () => {
    console.log("hi");
    console.warn("whoa");
    console.error("crap");
    console.trace("verbose");
    console.debug("dbg");
    console.info("A-okay");

    expect(runtimeArgs[0].log()).toEqual(1);
    expect(runtimeArgs[0].warn()).toEqual(2);
    expect(runtimeArgs[0].info()).toEqual(3);
    expect(runtimeArgs[0].debug()).toEqual(4);
    expect(runtimeArgs[0].trace()).toEqual(5);
    expect(runtimeArgs[0].error()).toEqual(6);

    context.send("", 204);

    expect(console.log()).toEqual(undefined);
    expect(console.warn()).toEqual(undefined);
    expect(console.info()).toEqual(undefined);
    expect(console.debug()).toEqual(undefined);
    expect(console.trace()).toEqual(undefined);
    expect(console.error()).toEqual(undefined);
  });
});
