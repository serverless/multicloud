import { AwsContext } from ".";
import { AwsResponse } from "./awsResponse";
import awsEvent from "./test/events/defaultAwsEvent.json";


describe("AWS context", () => {
  const awsContext = {
    awsRequestId: "12345",
    req: {},
    res: {},
  };

  function createAwsContext(event, context, callback = jest.fn()) {
    var awsContext = new AwsContext([event, context, callback]);
    awsContext.res = new AwsResponse(awsContext);
    awsContext.done = jest.fn();

    return awsContext;
  }

  it("context id should be set", async () => {
    const emptyAWSEvent = {};
    const sut = createAwsContext(emptyAWSEvent, awsContext);
    expect(sut.id).toEqual(awsContext.awsRequestId);
  });

  it("send() calls response.send() on httpTrigger", () => {
    const body = { message: "Hello World" };
    const context = createAwsContext(awsEvent, awsContext);
    context.res = new AwsResponse(context);
    context.res.send = jest.fn();
    context.send(body);

    expect(context.res.send).toBeCalledWith(body, 200);
  });

  it("send() calls response.send() on httpTrigger with custom status", () => {
    const body = { message: "oh Crap!" };
    const context = createAwsContext(awsEvent, awsContext);
    context.res = new AwsResponse(context);
    context.res.send = jest.fn();
    context.send(body, 400);

    expect(context.res.send).toHaveBeenCalledWith(body, 400);
  });

  it("send() calls context.done() to signal handler is complete", () => {
    const context = createAwsContext(awsEvent, awsContext);
    context.send("test", 200);

    expect(context.done).toBeCalled();
  });

  it("flush() calls response.flush() to call final AWS callback", () => {
    const context = createAwsContext(awsEvent, awsContext);
    const flushSpy = jest.spyOn(context.res, "flush");
    context.send("test", 200);
    context.flush();

    expect(flushSpy).toBeCalled();
  });

  it("binds event property to incoming event argument", () => {
    const context = createAwsContext(awsEvent, awsContext);
    expect(context.event).toBe(awsEvent);
  });
});
