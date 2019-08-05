import { injectable, inject, ContainerModule, interfaces } from "inversify";
import { CloudModule, ComponentType, CloudContext, CloudRequest, CloudResponse } from "..";
import { CloudService, CloudStorage } from "../services";
import { Stream } from "stream";

@injectable()
export class TestModule implements CloudModule {
  private static isHttpRequest(req: interfaces.Request) {
    const runtimeArgs = req.parentContext.container.get(ComponentType.RuntimeArgs);
    return runtimeArgs && runtimeArgs[0].isHttp;
  }

  public create() {
    return new ContainerModule((bind) => {
      bind<CloudContext>(ComponentType.CloudContext)
        .to(TestContext)
        .inSingletonScope();

      bind<CloudRequest>(ComponentType.CloudRequest)
        .to(TestRequest)
        .when(TestModule.isHttpRequest);

      bind<CloudResponse>(ComponentType.CloudResponse)
        .to(TestResponse)
        .when(TestModule.isHttpRequest);

      bind<CloudService>(ComponentType.CloudService)
        .to(TestCloudService);

      bind<CloudStorage>(ComponentType.CloudStorage)
        .to(TestCloudStorage)
        .when(TestModule.isHttpRequest);
    });
  }
}

@injectable()
export class TestContext implements CloudContext {
  public constructor(@inject(ComponentType.RuntimeArgs) private args?: any[]) {
    this.id = Math.random().toString(36).substring(7);
  }

  public providerType: string = "test";
  public id: string;
  public event: any;
  public container?;
  public req?: CloudRequest;
  public res?: CloudResponse;
  public storage?;
  public logger?;
  public service?;
  public runtime?;
  public telemetry?;

  public send(body: any, status: number) {
    if (this.res) {
      this.res.send(body, status);
    }

    this.done();
  };

  public done: () => void;

  public flush() {
  };
}

@injectable()
export class TestRequest implements CloudRequest {
  public constructor(@inject(ComponentType.CloudContext) private context: CloudContext) {
    Object.assign(this, this.context.req);
  }

  public body: any;
  public headers = {};
  public method: string;
  public query = {};
  public pathParams = {};
}

@injectable()
export class TestResponse implements CloudResponse {
  public constructor(@inject(ComponentType.CloudContext) private context: CloudContext) {
    Object.assign(this, this.context.res);
  }

  public body: string;
  public status: number;
  public headers = {};

  public send(body: any, status: number) {
    this.body = body;
    this.status = status;
  }

  public flush() {
  }
}

@injectable()
export class TestCloudService implements CloudService {
  public invoke<T>(): Promise<T> {
    return Promise.resolve(null);
  }
}

@injectable()
export class TestCloudStorage implements CloudStorage {
  public read(): Promise<Stream> {
    return Promise.resolve(null);
  };
}
