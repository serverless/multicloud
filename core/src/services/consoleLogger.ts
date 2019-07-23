import { Logger, LogLevel } from ".";

/**
 * Console implementation of Logger interface
 */
export class ConsoleLogger implements Logger {
  /** Level of verbosity for logging */
  public logLevel: LogLevel;

  /** Log message */
  public log(message: string) {
    console.log(message);
  }

  /** Log message as info */
  public info(message: string) {
    console.info(message);
  }

  /** Log message as warning */
  public warn(message: string) {
    console.warn(message);
  }

  /** Log message as error */
  public error(message: string) {
    console.error(message);
  }
}
