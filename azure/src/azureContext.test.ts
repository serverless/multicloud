import { AzureContext } from "./azureContext";
import { AzureResponse } from "./azureResponse";


jest.mock("./azureResponse");

const mockResponse = {
  context:{},
  send: jest.fn()
};

describe("Azure context", () => {
  beforeEach(() => {
    (AzureResponse as jest.Mock<AzureResponse>).mockImplementation(() => mockResponse);
  });

  test("when done() calls response.send() on httpTrigger", () => {
    const context = {
      req: {},
      res: {},
      done: jest.fn()
    };
    const body = { message: "Hello World" };
    const sut = new AzureContext(context);
    sut.send(body);
    expect(mockResponse.send).toHaveBeenCalledWith(body, 200);
  });

  test("when done() calls response.send() on httpTrigger with custom status", () => {
    const context = {
      req: {},
      res: {},
      done: jest.fn()
    };
    const body = { message: "oh Crap!" };
    const sut = new AzureContext(context);
    sut.send(body, 400);
    expect(mockResponse.send).toHaveBeenCalledWith(body, 400);
  });
});
