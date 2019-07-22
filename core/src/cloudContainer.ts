import "reflect-metadata";
import { Container, ContainerModule, interfaces } from "inversify";
import { CloudContext } from "./cloudContext";
import Guard from "./common/guard";

export interface CloudModule {
  create: () => ContainerModule;
}

export interface ContainerResolver {
  resolve<T>(serviceIdentifier: string): T;
}

export interface ContainerRegister {
  registerModule(...modules: CloudModule[]): void;
}

export interface ContainerBind {
  bind<T>(serviceIdentifier): interfaces.BindingToSyntax<T>;
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

  public registerModule(...modules: CloudModule[]) {
    const containerModules = modules.map((module) => module.create());
    this.container.load(...containerModules);
  }

  public resolve<T>(serviceIdentifier: string) {
    Guard.empty(serviceIdentifier, "serviceIdentifier", "service identifier cannot be empty or undefined");
    return this.container.get<T>(serviceIdentifier);
  }

  public bind<T>(serviceIdentifier): interfaces.BindingToSyntax<T> {
    Guard.empty(serviceIdentifier, "serviceIdentifier", "service identifier cannot be empty or undefined");

    return this.container.isBound(serviceIdentifier)
      ? this.container.rebind<T>(serviceIdentifier)
      : this.container.bind(serviceIdentifier);
  }
}
