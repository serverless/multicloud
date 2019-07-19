import { Logger, LogLevel } from ".";

export class ConsoleLogger implements Logger {
  public logLevel: LogLevel;

  public log(message: string) {
    console.log(message);
  }

  public info(message: string) {
    console.info(message);
  }

  public warn(message: string) {
    console.warn(message);
  }

  public error(message: string) {
    console.error(message);
  }
}
