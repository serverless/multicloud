import { AwsContext } from ".";
import { AwsResponse } from "./awsResponse";
import awsEvent from "./test/events/defaultAwsEvent.json";


describe("AWS context", () => {
  const awsContext = {
    requestId: "12345",
    req: {},
    res: {},
  }

  it("context id should be set", async () => {
    const emptyAWSEvent = {};
    const sut = new AwsContext([emptyAWSEvent, awsContext, null]);
    expect(sut.id).toEqual(awsContext.requestId);
  });

  it("send() calls response.send() on httpTrigger", () => {
    const body = { message: "Hello World" };
    const context = new AwsContext([awsEvent, awsContext, null]);
    context.res = new AwsResponse(context);
    context.res.send = jest.fn();
    context.send(body);

    expect(context.res.send).toBeCalledWith(body, 200);
  });

  it("send() calls response.send() on httpTrigger with custom status", () => {
    const body = { message: "oh Crap!" };
    const context = new AwsContext([awsEvent, awsContext, null]);
    context.res = new AwsResponse(context);
    context.res.send = jest.fn();
    context.send(body, 400);

    expect(context.res.send).toHaveBeenCalledWith(body, 400);
  });
});
