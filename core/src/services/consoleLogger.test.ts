import { ConsoleLogger } from "./consoleLogger";
import { LogLevel } from "./logger";

describe("Console Logger", () => {
  beforeEach(() => {
    console.trace = jest.fn();
    console.debug = jest.fn();
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  it("Empty constructor should default to LogLevel.INFO", () => {
    // no env variable set (process.env.LOG_LEVEL)
    const logger = new ConsoleLogger();
    logger.trace("");
    logger.debug("");
    logger.log("");
    logger.info("");
    logger.warn("");
    logger.error("");

    expect(console.trace).not.toHaveBeenCalled();
    expect(console.debug).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
    expect(console.info).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it("LogLevel.NONE should not log", () => {
    const logger = new ConsoleLogger(LogLevel.NONE);
    logger.trace("");
    logger.debug("");
    logger.log("");
    logger.info("");
    logger.warn("");
    logger.error("");

    expect(console.trace).not.toHaveBeenCalled();
    expect(console.debug).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("LogLevel.VERBOSE should work as expected", () => {
    const logger = new ConsoleLogger(LogLevel.VERBOSE);
    logger.trace("");
    logger.debug("");
    logger.log("");
    logger.info("");
    logger.warn("");
    logger.error("");

    expect(console.trace).toHaveBeenCalled();
    expect(console.debug).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
    expect(console.info).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it("LogLevel.INFO should work as expected", () => {
    const logger = new ConsoleLogger(LogLevel.INFO);
    logger.trace("");
    logger.debug("");
    logger.log("");
    logger.info("");
    logger.warn("");
    logger.error("");

    expect(console.trace).not.toHaveBeenCalled();
    expect(console.debug).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
    expect(console.info).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it("LogLevel.WARN should work as expected", () => {
    const logger = new ConsoleLogger(LogLevel.WARN);
    logger.trace("");
    logger.debug("");
    logger.log("");
    logger.info("");
    logger.warn("");
    logger.error("");

    expect(console.trace).not.toHaveBeenCalled();
    expect(console.debug).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it("LogLevel.ERROR should work as expected", () => {
    const logger = new ConsoleLogger(LogLevel.ERROR);
    logger.trace("");
    logger.debug("");
    logger.log("");
    logger.info("");
    logger.warn("");
    logger.error("");

    expect(console.trace).not.toHaveBeenCalled();
    expect(console.debug).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it("LOG_LEVEL environment variable should be used", () => {

    process.env.LOG_LEVEL = "3";
    const logger = new ConsoleLogger();
    logger.trace("");
    logger.debug("");
    logger.log("");
    logger.info("");
    logger.warn("");
    logger.error("");

    expect(console.trace).not.toHaveBeenCalled();
    expect(console.debug).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it("Logger should support multiple args", () => {
    const traceSpy = jest.spyOn(console, "trace");
    const debugSpy = jest.spyOn(console, "debug");
    const logSpy = jest.spyOn(console, "log");
    const infoSpy = jest.spyOn(console, "info");
    const warnSpy = jest.spyOn(console, "warn");
    const errorSpy = jest.spyOn(console, "error");

    const TEST_MESSAGE_ARRAY = ["first", "second", "third"]
    const logger = new ConsoleLogger(LogLevel.VERBOSE);
    logger.trace(...TEST_MESSAGE_ARRAY);
    logger.debug(...TEST_MESSAGE_ARRAY);
    logger.log(...TEST_MESSAGE_ARRAY);
    logger.info(...TEST_MESSAGE_ARRAY);
    logger.warn(...TEST_MESSAGE_ARRAY);
    logger.error(...TEST_MESSAGE_ARRAY);

    expect(traceSpy).toHaveBeenCalledWith("[TRACE] ", ...TEST_MESSAGE_ARRAY);
    expect(debugSpy).toHaveBeenCalledWith("[DEBUG] ", ...TEST_MESSAGE_ARRAY);
    expect(logSpy).toHaveBeenCalledWith("[VERBOSE] ", ...TEST_MESSAGE_ARRAY);
    expect(infoSpy).toHaveBeenCalledWith("[INFO] ", ...TEST_MESSAGE_ARRAY);
    expect(warnSpy).toHaveBeenCalledWith("[WARN] ", ...TEST_MESSAGE_ARRAY);
    expect(errorSpy).toHaveBeenCalledWith("[ERROR] ", ...TEST_MESSAGE_ARRAY);
  });
});
