import { MockedService } from "./mockedService";

export class MockBuilder {
  public service: any = null;
  public method: string;
  public withCallback: boolean;
  public result: any = null;
  public error: any = null;

  /**
   * Set property withCallback
   * @return param withCallback set to true
   */
  public makeCallback() {
    this.withCallback = true;
    return this;
  }

  /**
   * Set property service
   * @param service service to mock
   * @return param service set to the service to mock
   */
  public setService(service: any): MockBuilder {
    this.service = service;
    return this;
  }

  /**
   * Set property mtehod
   * @param method method to mock
   * @return param method set to the method to mock
   */
  public setMethod(method: string): MockBuilder {
    this.method = method;
    return this;
  }

  /**
   * Set property result
   * @param result result to mock
   * @return param result set to the result to mock
   */
  public setResult(result: any): MockBuilder {
    this.result = result;
    this.error = null;
    return this;
  }

  /**
   * Set property error
   * @param error error to mock
   * @return param error set to the error to mock
   */
  public setError(error: any): MockBuilder {
    this.error = error;
    this.result = null;
    return this;
  }

  /**
   * Method for build the mock
   * @return Module mocked with all params set
   */
  public build(): MockedService {
    const mock = new MockedService(this).getMock();
    this.reset();
    return mock;
  }

  /**
   * Get withCallback property
   * @return withCallack value
   */
  public isHavingCallback(): boolean {
    return this.withCallback;
  }

  /**
   * Get service property
   * @return service value
   */
  public getService(): any {
    return this.service;
  }

  /**
   * Get method property
   * @return method value
   */
  public getMethod(): string {
    return this.method;
  }

  /**
   * Get result property
   * @return result value
   */
  public getResult(): any {
    return this.result;
  }

  /**
   * Get error property
   * @return error value
   */
  public getError(): any {
    return this.error;
  }

  /**
   * Reset all params to the initial values
   * @return service, method, withCallback, result and error set to initial values
   */
  private reset() {
    this.service = null;
    this.method = "";
    this.withCallback = false;
    this.result = null;
    this.error = null;
  }
}
