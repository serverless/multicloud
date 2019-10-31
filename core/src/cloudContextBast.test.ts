import { TestContext } from "./testUtilities/testContext";
import { TestResponse } from "./testUtilities/testResponse";
import { CloudContext } from "./cloudContext";

describe("Cloud Context Base", () => {
  function createTestContext(): CloudContext {
    const context = new TestContext();
    context.res = new TestResponse();
    context.done = jest.fn();

    jest.spyOn(context.res, "send");

    return context;
  }

  it("does not call res.send() if res is not defined", () => {
    const context = new TestContext();
    context.done = jest.fn();

    context.send();

    expect(context.done).toBeCalled();
  });

  it("calls res.send() with default body, status & headers", () => {
    const context = createTestContext();

    context.send();

    expect(context.res.send).toBeCalledWith({
      body: null,
      status: 200,
      headers: {}
    });
  });

  it("calls res.send() with default status", () => {
    const context = createTestContext();
    const body = { message: "Hello!" };

    context.send(body);

    expect(context.res.send).toBeCalledWith({
      body: body,
      status: 200,
      headers: {}
    });
  });

  it("calls res.send() with custom params", () => {
    const context = createTestContext();
    const body = { message: "Error!" };
    const status = 400;
    const contentType = "application/pdf";

    context.send(body, status, contentType);

    expect(context.res.send).toBeCalledWith({
      body,
      status,
      headers: {
        "Content-Type": contentType
      }
    });
  });

  it("calls res.send() with response like object with only body", () => {
    const context = createTestContext();
    const body = { message: "Hello!" };

    context.send({ body });

    expect(context.res.send).toBeCalledWith({
      body,
      status: 200,
      headers: {}
    });
  });

  it("calls res.send() with response like object with only body and status", () => {
    const context = createTestContext();
    const body = { message: "Error!" };
    const status = 400;

    context.send({ body, status });

    expect(context.res.send).toBeCalledWith({
      body,
      status,
      headers: {}
    });
  });

  it("calls res.send() with response like object with only body, status and headers", () => {
    const context = createTestContext();
    const body = { message: "Error!" };
    const headers = {
      "x-header-1": "header1"
    };
    const status = 400;

    context.send({ body, status, headers });

    expect(context.res.send).toBeCalledWith({
      body,
      status,
      headers: headers
    });
  });

  it("calls res.send() without status and with response like object with only body having a status property", () => {
    const context = createTestContext();
    const body = {
      foo: "bar",
      status: "OK"
    };

    // Call send without status
    context.send(body);

    expect(context.res.send).toBeCalledWith({
      body,
      // Here the status is sent as "OK" instead of 200
      status: 200,
      headers: {}
    });
  });

  it("calls res.send() with status 200 and with response like object with only body having a status property", () => {
    const context = createTestContext();
    const body = {
      foo: "bar",
      status: "OK"
    };

    context.send(body, 200);

    expect(context.res.send).toBeCalledWith({
      body,
      status: 200,
      headers: {}
    });
  });
});
