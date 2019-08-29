import { CloudContext } from "../cloudContext";
import { CloudContainer } from "../cloudContainer";
import { TestModule } from "../test/testModule";
import { TestCloudService } from "../test/testCloudService";
import { TestContext } from "../test/testContext";
import { ServiceMiddleware } from "./serviceMiddleware";

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
