import { AzureContext } from "./azureContext";
import { AzureResponse } from "./azureResponse";

jest.mock("./azureResponse");

const done: Function = jest.fn();
const runtimeArgs = [
  {
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
