import { AwsContext } from ".";
import awsEvent from "./test/events/defaultAwsEvent.json";

jest.mock("./awsResponse");
import { AwsResponse } from "./awsResponse";

const mockResponse = {
  context: {},
  send: jest.fn((body: any, status: number = 200, callback: Function) => {
    console.log(status);
    console.log(body);
    console.log(callback);
  }),
};

describe("AWS context", () => {
  beforeEach(() => {
    (AwsResponse as jest.Mock<AwsResponse>).mockImplementation(() => mockResponse);
  });

  it("when done() calls response.send() on httpTrigger", () => {
    const context = {
      req: {},
      res: {},
      done: jest.fn()
    };

    const body = { message: "Hello World" };
    const sut = new AwsContext([awsEvent, context, null]);
    sut.res = new AwsResponse(sut);
    sut.send(body);
    expect(mockResponse.send).toHaveBeenCalledWith(body, 200, null);
  });

  it("when done() calls response.send() on httpTrigger with custom status", () => {
    const context = {
      req: {},
      res: {},
      done: jest.fn()
    };
    const body = { message: "oh Crap!" };
    const sut = new AwsContext([awsEvent, context, null]);
    sut.res = new AwsResponse(sut);
    sut.send(body, 400);
    expect(mockResponse.send).toHaveBeenCalledWith(body, 400, null);
  });
});
