import { AwsContext } from ".";
import { AwsResponse } from "./awsResponse";
import awsEvent from "./test/events/defaultAwsEvent.json";


describe("AWS context", () => {
  const awsContext = {
    requestId: "12345",
    req: {},
    res: {},
  };

  function createAwsContext(event, context, callback = jest.fn()) {
    var awsContext = new AwsContext([event, context, callback]);
    awsContext.done = jest.fn();

    return awsContext;
  }

  it("context id should be set", async () => {
    const emptyAWSEvent = {};
    const sut = createAwsContext(emptyAWSEvent, awsContext);
    expect(sut.id).toEqual(awsContext.requestId);
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

  it("send() calls context.done() to signal request is complete", () => {
    const context = createAwsContext(awsEvent, awsContext);
    context.send("test", 200);

    expect(context.done).toBeCalled();
  });
});
