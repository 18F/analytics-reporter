const expect = require("chai").expect;
const proxyquire = require("proxyquire");

class WinstonConsoleMock {
  constructor(config) {
    this.config = config;
  }
}

const winstonMock = {
  createLogger: (loggerConfig) => {
    return loggerConfig;
  },
  format: {
    combine: (...args) => {
      return args;
    },
    colorize: () => {
      return "colorize";
    },
    label: (options) => {
      return options;
    },
    simple: () => {
      return "simple";
    },
  },
  transports: {
    Console: WinstonConsoleMock,
  },
};

const logger = proxyquire("../src/logger", {
  winston: winstonMock,
});

describe("logger", () => {
  describe(".initialize", () => {
    describe("when config is provided", () => {
      const logLevel = "warn";
      const config = {
        logLevel,
        scriptName: "foobar.sh",
        agency: "gov-wide",
      };
      const reportConfig = { name: "device" };

      it("creates a logger with log level set to the environment value", () => {
        expect(logger.initialize(config, reportConfig)).to.eql({
          level: logLevel,
          format: [
            { label: "foobar.sh - device - gov-wide", message: true },
            "colorize",
            "simple",
          ],
          transports: [new WinstonConsoleMock({ level: logLevel })],
        });
      });
    });

    describe("when config is not provided", () => {
      const logLevel = "debug";

      it("creates a logger with log level set to debug", () => {
        expect(logger.initialize()).to.eql({
          level: logLevel,
          format: [{ label: "", message: true }, "colorize", "simple"],
          transports: [new WinstonConsoleMock({ level: logLevel })],
        });
      });
    });
  });
});
