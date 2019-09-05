import { MockBuilder } from "./mockBuilder";
import { TestService } from "./service/testService"

jest.mock("./service/testService");

describe("Mock builder should", () => {
  let mockBuilder;


  const result = {
    test: "this is a simple test result"
  };

  const error = new Error("Oops!")

  beforeEach(() => {
    jest.clearAllMocks();
    mockBuilder = new MockBuilder()
      .setService(TestService)
      .setMethod("getMessage")
  });

  it("set the service", () => {
    expect(mockBuilder.getService()).toBe(TestService)
  });

  it("set the method", () => {
    expect(mockBuilder.getMethod()).toBe("getMessage")
  });

  it("set the result if there is a result", () => {
    mockBuilder
      .setResult(result)
    expect(mockBuilder.getResult()).toBe(result)
  });

  it("set the error if there is an error", () => {
    mockBuilder
      .setError(error)
    expect(mockBuilder.getError()).toBe(error)
  });

  it("set the isHavingCallback to true", () => {
    mockBuilder
      .makeCallback()
    expect(mockBuilder.isHavingCallback()).toBe(true)
  });

  it("reset the paramters after build", () => {
    mockBuilder
      .build()
    expect(mockBuilder.service).toBe(null)
    expect(mockBuilder.method).toBe("")
    expect(mockBuilder.withCallback).toBe(false)
    expect(mockBuilder.result).toBe(null)
    expect(mockBuilder.error).toBe(null)
  });

  it("build the mock successfully", () => {
    const spyCallback = jest.fn();
    const mock = mockBuilder
      .setResult(result)
      .setService(TestService)
      .setMethod("getMessage")
      .makeCallback()
      .build()
    const testService = new TestService();
    testService.getMessage("Test", spyCallback);
    expect(spyCallback).toBeCalled();
    expect(mock).toBeCalledWith("Test", spyCallback);
    expect(mock).toEqual(expect.any(Function))
  });

  it("mock a function when isHavingCallback is set to false", () => {

    const mock = mockBuilder
      .setService(TestService)
      .setMethod("returnHello")
      .setResult("test result")
      .build()
    const testService = new TestService();
    const result = testService.returnHello("Test")
    expect(mock).toBeCalledWith("Test");
    expect(result).toEqual("test result")
  });

  it("mock a function when isHavingCallback is set to false and return error", () => {

    const mock = mockBuilder
      .setService(TestService)
      .setMethod("returnHello")
      .setError(error)
      .build()
    const testService = new TestService();
    expect(() => testService.returnHello("Test")).toThrow(error);
    expect(mock).toBeCalledWith("Test");
  });
});

describe("Usage example of the mock builder", () => {
  let mockBuilder;

  const context = {
    name: "Test",
    send: jest.fn()
  };

  const testHandler = async context => {
    const testService = new TestService();

    testService.getMessage(context.name, (error, result) => {
      if (error) {
        throw error;
      }
      context.send(result);
    });
  };;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBuilder = new MockBuilder()
      .setService(TestService)
      .setMethod("getMessage")
      .makeCallback()
  });

  it("test handler should call method send", async () => {
    const getMessageMock = await mockBuilder
      .setResult(context.name)
      .build()
    await testHandler(context);
    expect(getMessageMock).toBeCalledWith(context.name, expect.any(Function));
    expect(context.send).toBeCalledWith(context.name);
  });
});
