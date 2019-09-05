import { MockBuilder } from "./mockBuilder";

export class MockedService {
  public mock: any;
  public service: Function;
  public method: string;
  public builder: Function;
  public result: Function;
  public error: Error;
  public isHavingCallback: boolean;

  public constructor(builder: MockBuilder) {
    this.mock = null;
    this.service = builder.getService();
    this.method = builder.getMethod();
    this.result = builder.getResult();
    this.error = builder.getError();
    this.isHavingCallback = builder.isHavingCallback();

    this.mockFunction(this.service, this.method, this.error, this.result);

  }

  /**
  * Returns the mock to be used in the unit tests
  * @return jest mock object
  */
  public getMock(): MockedService {
    return this.mock;
  }

  /**
   * Creates a mock function for services to used in the unit tests
   * @param service Service to mock
   * @param methodName Method name to mock
   * @param error Error value
   * @param result Result value
   */
  public mockFunction(service: any, methodName: string, error: Error, result: any) {
    let mock;

    if (this.isHavingCallback) {
      mock = jest.fn((_, callback) => {
        callback(error, result);
      });
    }
    else {
      mock = jest.fn(() => {
        if (error) {
          throw error;
        }
        return result;
      });
    }

    if (service.mockImplementation) {
      service.mockImplementation(() => ({
        [methodName]: mock
      }));
    }
    else {
      service[methodName] = mock;
    }

    this.mock = mock;
  }
}
