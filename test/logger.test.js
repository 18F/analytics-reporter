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
    describe("when ANALYTICS_LOG_LEVEL is set", () => {
      const logLevel = "warn";

      beforeEach(() => {
        process.env.ANALYTICS_LOG_LEVEL = logLevel;
      });

      afterEach(() => {
        delete process.env.ANALYTICS_LOG_LEVEL;
      });

      it("creates a logger with log level set to the environment value", () => {
        expect(logger.initialize()).to.eql({
          level: logLevel,
          format: ["colorize", "simple"],
          transports: [new WinstonConsoleMock({ level: logLevel })],
        });
      });
    });

    describe("when ANALYTICS_LOG_LEVEL is not set", () => {
      const logLevel = "debug";

      it("creates a logger with log level set to debug", () => {
        expect(logger.initialize()).to.eql({
          level: logLevel,
          format: ["colorize", "simple"],
          transports: [new WinstonConsoleMock({ level: logLevel })],
        });
      });
    });
  });
});
