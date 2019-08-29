import { ContainerModule } from "inversify";
import { CloudContainer, ComponentType, CloudModule } from "./cloudContainer";
import { CloudContext } from "./cloudContext";
import { TestModule } from "./test/testModule";
import { CloudRequest } from "./cloudRequest";
import { TestRequest } from "./test/testRequest";
import { CloudResponse } from "./cloudResponse";
import { TestResponse } from "./test/testResponse";

describe("Core Module", () => {
  let cloudContainer: CloudContainer = undefined;
  let context: CloudContext = undefined;
  const params: any[] = [
    {
      id: "123"
    },
    {
      method: "GET"
    }
  ];
  beforeEach(() => {
    cloudContainer = new CloudContainer();
    cloudContainer.bind(ComponentType.RuntimeArgs).toConstantValue(params);
    cloudContainer.registerModule(new TestModule());
    context = cloudContainer.resolve<CloudContext>(ComponentType.CloudContext);
  });

  it("resolves CloudContextProvider", () => {
    expect(context).not.toBeNull();
  });

  it("resolves CloudContext using args in ctor and CloudContextProvider", () => {
    expect(context.runtime.context).toBe(params[0]);
  });

  it("resolves request", () => {
    const request = cloudContainer.resolve<CloudRequest>(ComponentType.CloudRequest);

    expect(request).toBeInstanceOf(TestRequest);
  });

  it("resolves response", () => {
    const response = cloudContainer.resolve<CloudResponse>(ComponentType.CloudResponse);

    expect(response).toBeInstanceOf(TestResponse);
  });

  it("reuses instances of cloud context", () => {
    const context1 = cloudContainer.resolve<CloudContext>(ComponentType.CloudContext);
    context1.container = cloudContainer;

    const context2 = cloudContainer.resolve<CloudContext>(ComponentType.CloudContext);

    expect(context1).not.toBeNull();
    expect(context2).not.toBeNull();
    expect(context1).toBe(context2);
  });
});

describe("Cloud container", () => {
  let cloudContainer: CloudContainer = undefined;

  beforeEach(() => {
    cloudContainer = new CloudContainer();
  });

  it("call module init with container", () => {
    const mock: CloudModule = {
      create: jest.fn(() => {
        return new ContainerModule(() => {
          // Register Components
        });
      })
    };

    cloudContainer.registerModule(mock);
    expect(mock.create).toHaveBeenCalled();
  });

  it("retrieves instance", () => {
    const object = { hello: "world" };

    const mockModule: CloudModule = {
      create: () => {
        return new ContainerModule((bind) => {
          bind("test").toConstantValue(object);
        });
      }
    };

    cloudContainer.registerModule(mockModule);
    const result = cloudContainer.resolve("test");
    expect(result).toBe(object);
  });

  it("fail when empty identifier", () => {
    const err = "service identifier cannot be empty or undefined";
    expect(() => cloudContainer.resolve("")).toThrow(err);
    expect(() => cloudContainer.resolve(undefined)).toThrow(err);
  });

  it("can rebind component registrations that previously exist", () => {
    const runtimeArgs1 = [
      "arg1",
      "arg2",
    ];

    cloudContainer.bind(ComponentType.RuntimeArgs).toConstantValue(runtimeArgs1);
    const result1 = cloudContainer.resolve(ComponentType.RuntimeArgs);

    expect(result1).toEqual(runtimeArgs1);

    const runtimeArgs2 = [
      "arg1",
      "arg2",
      "arg3",
    ];

    cloudContainer.bind(ComponentType.RuntimeArgs).toConstantValue(runtimeArgs2);
    const result2 = cloudContainer.resolve(ComponentType.RuntimeArgs);

    expect(result2).toEqual(runtimeArgs2);
  });

  it("resolves returns null if service identifier throw exception", () => {
    const container = new CloudContainer();
    const result = container.resolve("unknown");

    expect(result).toBeNull();
  });

  it("resolving between child & parent containers", () => {
    const runtimeArgs = ["arg1", "arg2"];
    const testModule = new TestModule();

    const parent = new CloudContainer();
    parent.registerModule(testModule);

    const child1 = new CloudContainer(parent);
    const child2 = new CloudContainer(parent);
    child1.registerModule(testModule);
    child2.registerModule(testModule);

    child1.bind(ComponentType.RuntimeArgs).toConstantValue(runtimeArgs);
    child2.bind(ComponentType.RuntimeArgs).toConstantValue(runtimeArgs);

    // Retrieve context from child container 1
    const context1a = child1.resolve<CloudContext>(ComponentType.CloudContext);
    const context1b = child1.resolve<CloudContext>(ComponentType.CloudContext);

    // Retrieve context from child container 2
    const context2a = child2.resolve<CloudContext>(ComponentType.CloudContext);
    const context2b = child2.resolve<CloudContext>(ComponentType.CloudContext);

    // Retrieve context from parent
    const context3b = parent.resolve<CloudContext>(ComponentType.CloudContext);

    // Context from same child container are the same
    expect(context1a).toBe(context1b);
    expect(context2a).toBe(context2b);

    // Context from another child container are the same
    expect(context1a).not.toBe(context2a);
    expect(context1b).not.toBe(context2b);

    // Context resolved from parent container are not the same as any children
    expect(context1a).not.toBe(context3b);
    expect(context1b).not.toBe(context3b);
    expect(context2a).not.toBe(context3b);
    expect(context2b).not.toBe(context3b);
  });
});
