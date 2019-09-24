import { ProviderType } from "@multicloud/sls-core";
import { AzureContext, AzureRequest, AzureResponse } from ".";

jest.mock("./azureResponse");

const done: Function = jest.fn();
const runtimeArgs = [
  {
    invocationId: "12344",
    req: {},
    res: {},
    done,
    log: {},
    bindingDefinitions: [],
  }
];

runtimeArgs[0].log = () => { return 1; }
runtimeArgs[0].log.verbose = () => { return 2; };
runtimeArgs[0].log.info = () => { return 3; };
runtimeArgs[0].log.warn = () => { return 4; };
runtimeArgs[0].log.error = () => { return 5; };

const createAzureContext = (args): AzureContext => {
  const azureContext = new AzureContext(args);
  azureContext.res = new AzureResponse(azureContext);
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

  it("requestId should be set", () => {
    expect(context.id).toEqual(runtimeArgs[0].invocationId);
  });

  it("when send() calls response.send() on httpTrigger", () => {
    const body = { message: "Hello World" };
    context.send(body);

    expect(context.res.send).toBeCalledWith(body, 200, undefined);
  });

  it("when send() calls response.send() on httpTrigger with custom status", () => {
    const body = { message: "oh no!" };
    context.send(body, 400);
    expect(context.res.send).toBeCalledWith(body, 400, undefined);
  });

  it("when send() calls response.send() on httpTrigger with contentType", () => {
    const body = { message: "oh no!" };
    const expectedContentType = "image/jpg";

    context.send(body, 200, expectedContentType);
    expect(context.res.send).toBeCalledWith(body, 200, expectedContentType);
  });

  it("send() calls runtime done() on fail status code", () => {
    const body = { message: "oh no!" };
    context.send(body, 400);
    expect(context.done).toBeCalled();
  });

  it("send() calls context.done() on success status code", () => {
    context.send("test", 200);
    expect(context.done).toBeCalled();
  });

  it("send() with no params uses default values", () => {
    context.send();
    expect(context.res.send).toBeCalledWith(null, 200, undefined);
  });

  it("flush() calls response.flush()", () => {
    const flushSpy = jest.spyOn(context.res, "flush");

    context.send("test", 200);
    context.flush();

    expect(flushSpy).toBeCalled();
  });

  it("logging calls should be redirect to Azure context", () => {
    console.log("hi");
    console.warn("whoa");
    console.error("no");
    console.trace("verbose");
    console.debug("dbg");
    console.info("A-okay");

    expect(runtimeArgs[0].log()).toEqual(1);
    expect(runtimeArgs[0].log.verbose()).toEqual(2);
    expect(runtimeArgs[0].log.info()).toEqual(3);
    expect(runtimeArgs[0].log.warn()).toEqual(4);
    expect(runtimeArgs[0].log.error()).toEqual(5);
  });

  it("logging calls redirect and be restored", () => {
    console.log("hi");
    console.warn("whoa");
    console.error("no");
    console.trace("verbose");
    console.debug("dbg");
    console.info("A-okay");

    expect(runtimeArgs[0].log()).toEqual(1);
    expect(runtimeArgs[0].log.verbose()).toEqual(2);
    expect(runtimeArgs[0].log.info()).toEqual(3);
    expect(runtimeArgs[0].log.warn()).toEqual(4);
    expect(runtimeArgs[0].log.error()).toEqual(5);

    context.send("", 204);

    expect(console.log()).toEqual(undefined);
    expect(console.warn()).toEqual(undefined);
    expect(console.info()).toEqual(undefined);
    expect(console.debug()).toEqual(undefined);
    expect(console.trace()).toEqual(undefined);
    expect(console.error()).toEqual(undefined);
  });

  describe("Input bindings", () => {
    it("Processes single input binding correctly", () => {
      const expectedMessage = { "foo": "bar" };
      const runtimeArgs = [
        {
          bindingDefinitions: [
            {
              name: "message",
              type: "queueTrigger",
              direction: "in",
            }
          ],
          log: {},
        },
        expectedMessage,
      ];

      const context = new AzureContext(runtimeArgs);
      expect(context["message"]).toBe(expectedMessage);
    });

    it("Processes multiple input bindings correctly", () => {
      const expectedMessage1 = { "a": 1 };
      const expectedMessage2 = { "b": 2 };
      const runtimeArgs = [
        {
          log: {},
          bindingDefinitions: [
            {
              name: "message1",
              type: "queueTrigger",
              direction: "in",
            },
            {
              name: "message2",
              type: "queueTrigger",
              direction: "in",
            }
          ]
        },
        expectedMessage1,
        expectedMessage2,
      ];

      const context = new AzureContext(runtimeArgs);
      expect(context["message1"]).toBe(expectedMessage1);
      expect(context["message2"]).toBe(expectedMessage2);
    });

    it("Does not overwrite context properties that already exist and would cause conflict", () => {
      const expectedMessage = { "foo": "bar" };

      const runtimeArgs = [
        {
          log: {},
          bindingDefinitions: [
            {
              name: "container",
              type: "queueTrigger",
              direction: "in",
            }
          ]
        },
        expectedMessage,
      ];

      const context = new AzureContext(runtimeArgs);
      expect(context.providerType).not.toBe(expectedMessage);
      expect(context.providerType).toEqual(ProviderType.Azure);
    });

    it("Binds CloudContext event to the first incoming binding argument", () => {
      const runtimeArgs = [
        {
          log: {},
          bindingDefinitions: [],
        },
        "test message"
      ];

      const context = new AzureContext(runtimeArgs);
      expect(context.event).toBe(runtimeArgs[1]);
    });
  });
});
