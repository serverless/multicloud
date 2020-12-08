/* eslint-env jest */
const { CloudContextBuilder } = require("@multicloud/sls-core");
const mock = require("./streamToString");
const { handler } = require("./storageHandler");

jest.mock("./streamToString");

describe("Storage read and write", () => {
  it("Should return a Hello World message and status code 200", async () => {
    const builder = new CloudContextBuilder();
    const addMock = jest.spyOn(mock, "streamToString");
    const name = "MultiCloud";
    addMock.mockImplementation(() => `Hello ${name}`);
    const context = await builder
      .asHttpRequest()
      .withRequestMethod("GET")
      .withRequestQuery({ name })
      .invokeHandler(handler);
    expect(context.res.status).toEqual(200);
    expect(context.res.body).toEqual({
      result: `Hello ${name}`,
    });
  });
});
