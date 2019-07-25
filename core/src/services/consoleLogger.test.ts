import { ConsoleLogger, LogLevel } from ".";

describe("Console Logger", () => {
  beforeEach(() => {
    console.trace = jest.fn();
    console.debug = jest.fn();
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  test("LogLevel.NONE should not log", () => {
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

  test("LogLevel.VERBOSE should work as expected", () => {
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

  test("LogLevel.INFO should work as expected", () => {
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

  test("LogLevel.WARN should work as expected", () => {
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

  test("LogLevel.ERROR should work as expected", () => {
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

});
