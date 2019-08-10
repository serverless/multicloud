import { CloudContainer, TestModule, TestContext, TestCloudService, CloudContext, ServiceMiddleware } from "..";

describe("ServiceMiddleware should", () => {
  let context: CloudContext;

  beforeEach(() => {
    context = new TestContext();

    const container = new CloudContainer();
    container.registerModule(new TestModule());
    context.container = container;
  })

  it("calls the next middleware in the chain", async () => {
    const next = jest.fn();
    await ServiceMiddleware()(context, next);

    expect(next).toHaveBeenCalled();
  });

  it("sets the cloudService on the context", async () => {
    const next = jest.fn();
    await ServiceMiddleware()(context, next);
    expect(context.service).toBeInstanceOf(TestCloudService);
    expect(next).toBeCalled();
  });
});
