import "reflect-metadata";
import { Container, ContainerModule, interfaces } from "inversify";
import { Guard } from "./common/guard";

/**
 * Module that can be registered within CloudContainer
 */
export interface CloudModule {
  create: () => ContainerModule;
}

/**
 * Resolver for IoC container
 */
export interface ContainerResolver {
  /**
   * Initialize service according to serviceIdentifier
   * @param serviceIdentifier Type of service to initialize
   */
  resolve<T>(serviceIdentifier: string): T;
}

/**
 * Handles registration for IoC container
 */
export interface ContainerRegister {
  /**
   * Register CloudModules in IoC container
   * @param modules Array of CloudModules to register in IoC container
   */
  registerModule(...modules: CloudModule[]): void;
}

/**
 * Binder of service implementations to IoC container
 */
export interface ContainerBind {
  /** Bind an implementation of the service identifier to the IoC container */
  bind<T>(serviceIdentifier): interfaces.BindingToSyntax<T>;
}

/**
 * Type of Component for registration and resolution
 */
export enum ComponentType {
  /** Arguments provided at runtime to function */
  RuntimeArgs = "RuntimeArgs",
  /** Common cloud context */
  CloudContext = "CloudContext",
  /** Common cloud request */
  CloudRequest = "CloudRequest",
  /** Common cloud response */
  CloudResponse = "CloudResponse",
  /** Common cloud invocation service */
  CloudService = "CloudService",
  /** Common cloud storage service */
  CloudStorage = "CloudStorage"
}

/**
 * IoC Container for instantiation of common cloud services
 */
export class CloudContainer implements ContainerResolver, ContainerRegister, ContainerBind {
  private container: Container = new Container();

  public constructor(private parent?: CloudContainer) {
    if (this.parent) {
      this.container.parent = parent.container;
    }
  }

  /**
   * Register modules within container
   * @param modules Array of modules to register within container
   */
  public registerModule(...modules: CloudModule[]) {
    const containerModules = modules.map((module) => module.create());
    this.container.load(...containerModules);
  }

  /**
   * Returns instantiation of service
   * @param serviceIdentifier Type of service to instantiate
   */
  public resolve<T>(serviceIdentifier: string) {
    Guard.empty(serviceIdentifier, "serviceIdentifier", "service identifier cannot be empty or undefined");
    try {
      return this.container.get<T>(serviceIdentifier);
    } catch (e) {
      return null;
    }
  }

  /**
   * Bind an implementation of a service identifier to the CloudContainer
   * @param serviceIdentifier Type of service to bind
   */
  public bind<T>(serviceIdentifier): interfaces.BindingToSyntax<T> {
    Guard.empty(serviceIdentifier, "serviceIdentifier", "service identifier cannot be empty or undefined");

    return this.container.isBound(serviceIdentifier)
      ? this.container.rebind<T>(serviceIdentifier)
      : this.container.bind(serviceIdentifier);
  }
}
