const expect = require("chai").expect;
const proxyquire = require("proxyquire");

class WinstonConsoleMock {
  constructor(config) {
    this.config = config;
  }
}

const winstonMock = {
  createLogger: (loggerConfig) => {
    return {
      child: (childConfig) => {
        return {
          ...loggerConfig,
          ...childConfig,
        };
      },
    };
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
    timestamp: () => {
      return "timestamp";
    },
    printf: () => {
      return "printf";
    },
  },
  transports: {
    Console: WinstonConsoleMock,
  },
};

describe("logger", () => {
  let subject;

  describe(".initialize", () => {
    describe("when config is provided", () => {
      const logLevel = "warn";
      const config = {
        scriptName: "foobar.sh",
        agency: "gov-wide",
      };
      const reportConfig = { name: "device" };

      beforeEach(() => {
        process.env.ANALYTICS_LOG_LEVEL = logLevel;
        subject = proxyquire("../src/logger", {
          winston: winstonMock,
        });
      });

      afterEach(() => {
        delete process.env.ANALYTICS_LOG_LEVEL;
      });

      it("creates a logger with log level set to the environment value", () => {
        expect(subject.initialize(config, reportConfig)).to.eql({
          level: logLevel,
          format: "printf",
          label: "foobar.sh - device - gov-wide",
          transports: [new WinstonConsoleMock({ level: logLevel })],
        });
      });
    });

    describe("when config is not provided", () => {
      const logLevel = "debug";

      beforeEach(() => {
        delete process.env.ANALYTICS_LOG_LEVEL;
        subject = proxyquire("../src/logger", {
          winston: winstonMock,
        });
      });

      it("creates a logger with log level set to debug", () => {
        expect(subject.initialize()).to.eql({
          level: logLevel,
          format: "printf",
          label: "",
          transports: [new WinstonConsoleMock({ level: logLevel })],
        });
      });
    });
  });
});
