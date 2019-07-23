import { AzureContext, AzureRequest, AzureResponse } from ".";

jest.mock("./azureResponse");

const done: Function = jest.fn();
const runtimeArgs = [
  {
    invocationId: "12344",
    req: {},
    res: {},
    done
  }
];

const createAzureContext = (args): AzureContext => {
  return new AzureContext(args);
};

describe("Azure context", () => {
  let sut: AzureContext = undefined;
  beforeEach(() => {
    sut = createAzureContext(runtimeArgs);
    sut.req = new AzureRequest(sut);
    sut.res = new AzureResponse(sut);
  });

  test("requestId should be set", () => {
    expect(sut.id).toEqual(runtimeArgs[0].invocationId);
  });

  test("when send() calls response.send() on httpTrigger", () => {
    const body = { message: "Hello World" };
    sut.send(body);
    expect(sut.res.send).toHaveBeenCalledWith(body, 200);
  });

  test("when send() calls response.send() on httpTrigger with custom status", () => {
    const body = { message: "oh Crap!" };
    sut.send(body, 400);
    expect(sut.res.send).toHaveBeenCalledWith(body, 400);
  });

  test("when send() calls runtime done()", () => {
    const body = { message: "oh Crap!" };
    sut.send(body, 400);
    expect(done).toHaveBeenCalledWith();
  });
});
