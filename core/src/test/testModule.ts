import "reflect-metadata";
import { interfaces, ContainerModule } from "inversify";
import {
  CloudModule, ComponentType, CloudContext, CloudRequest, CloudResponse, CloudService, CloudStorage,
  TestCloudService, TestCloudStorage, TestContext, TestRequest, TestResponse
} from "..";

export class TestModule implements CloudModule {
  private static isTestEnvironment(): boolean {
    return process.env.NODE_ENV === "test";
  }

  private static isHttpRequest(req: interfaces.Request): boolean {
    const runtimeArgs = req.parentContext.container.get(ComponentType.RuntimeArgs);
    return runtimeArgs && runtimeArgs[1] && runtimeArgs[1].method;
  }

  public create() {
    return new ContainerModule((bind) => {
      bind<CloudContext>(ComponentType.CloudContext)
        .to(TestContext)
        .inSingletonScope()
        .when(TestModule.isTestEnvironment);

      bind<CloudRequest>(ComponentType.CloudRequest)
        .to(TestRequest)
        .when((req) => TestModule.isTestEnvironment() && TestModule.isHttpRequest(req));

      bind<CloudResponse>(ComponentType.CloudResponse)
        .to(TestResponse)
        .when((req) => TestModule.isTestEnvironment() && TestModule.isHttpRequest(req));

      bind<CloudService>(ComponentType.CloudService)
        .to(TestCloudService)
        .when(TestModule.isTestEnvironment);

      bind<CloudStorage>(ComponentType.CloudStorage)
        .to(TestCloudStorage)
        .when(TestModule.isTestEnvironment);
    });
  }
}
