/**
* This is a simple test service created with the goal of explain how to use the mockBuilder
*/
export class TestService {
  private message: string;

  public getMessage(message: string, callback: any) {
    this.message = message;
    callback(null, this.message);
  }

  public returnHello(name: string) {
    return `hello ${name}`
  }
}
