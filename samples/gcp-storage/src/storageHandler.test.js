const { CloudContextBuilder } = require("core");
jest.mock("./streamToString");
const mock = require("./streamToString");

const { handler } = require("./storageHandler");

describe("Storage read and write", () => {
  it("Should return a Hello World message and status code 200", async () => {
    const builder = new CloudContextBuilder();
    const addMock = jest.spyOn(mock, 'streamToString');
    const name = "MultiCloud"
    addMock.mockImplementation(() => {
      return `Hello ${name}`;
    });
    const context = await builder
      .asHttpRequest()
      .withRequestMethod("GET")
      .withRequestQuery({name})
      .invokeHandler(handler);
    expect(context.res.status).toEqual(200);
    expect(context.res.body).toEqual({
      result: `Hello ${name}`,
    });
  });
});
