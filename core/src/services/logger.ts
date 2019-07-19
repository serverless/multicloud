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
