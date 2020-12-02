const { CloudContextBuilder } = require("@multicloud/sls-core");

const { handler } = require("./storageHandler");

describe("Hello world workshop", () => {
  it("Should return a Hello World message and status code 200", async () => {
    const builder = new CloudContextBuilder();
    const context = await builder
      .asHttpRequest()
      .withRequestMethod("GET")
      .invokeHandler(handler);

    expect(context.res.status).toEqual(200);
    expect(context.res.body).toEqual({
      message: "Hello World",
    });
  });
});
