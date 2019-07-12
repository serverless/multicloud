export enum LogLevel {
  NONE = 0,
  ERROR = 2,
  WARN = 3,
  INFO = 4,
  LOG = 5
}

export interface Logger {
  logLevel: LogLevel;
  log: (message: string) => void;
  info: (message: string) => void;
  error: (message: string) => void;
  warn: (message: string) => void;
}

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
