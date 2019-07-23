import { AzureContext, AzureRequest, AzureResponse } from ".";

jest.mock("./azureResponse");

const done: Function = jest.fn();
const runtimeArgs = [
  {
    invocationId: "12344",
    req: {},
    res: {},
    done,
    log: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    error: jest.fn()
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

    expect(runtimeArgs[0].log).toHaveBeenCalled();
    expect(runtimeArgs[0].warn).toHaveBeenCalled();
    expect(runtimeArgs[0].error).toHaveBeenCalled();
    expect(runtimeArgs[0].trace).toHaveBeenCalled();
    expect(runtimeArgs[0].debug).toHaveBeenCalled();
    expect(runtimeArgs[0].info).toHaveBeenCalled();
  });
});
