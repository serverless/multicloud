import "reflect-metadata";
import { Container } from "inversify";
import { CloudContext } from "./cloudContext";

export interface CloudModule {
  init: (container: Container) => void;
}

export interface ContainerResolver {
  resolve<T>(serviceIdentifier: string): T;
}

export interface ContainerRegister {
  registerModule(module: CloudModule): void;
}

export interface ResolveContext {
  resolveContext(args: any[]): CloudContext;
}

export enum ComponentType {
  RuntimeArgs = "RuntimeArgs",
  CloudContext = "CloudContext",
  CloudRequest = "CloudRequest",
  CloudResponse = "CloudResponse",
  CloudService = "CloudService",
  CloudStorage = "CloudStorage"
}

export class CloudContainer implements ContainerResolver, ContainerRegister {
  private container: Container = new Container();

  public registerModule(module: CloudModule) {
    module.init(this.container);
  }

  public resolve<T>(serviceIdentifier: string) {
    if(!serviceIdentifier || serviceIdentifier === "") throw new Error("service identifier cannot be empty or undefined");
    return this.container.get<T>(serviceIdentifier);
  }
}

export class CoreModule implements CloudModule {
  public constructor(private args: any[]) {}
  public init(container: Container) {
    if(!container.isBound(ComponentType.RuntimeArgs))
      container.bind(ComponentType.RuntimeArgs).toConstantValue(this.args);
    else
      container.rebind(ComponentType.RuntimeArgs).toConstantValue(this.args);
  }
}
