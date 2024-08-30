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
      const scriptName = "foobar.sh";
      const agencyName = "gov-wide";
      const reportName = "device";

      beforeEach(() => {
        process.env.ANALYTICS_LOG_LEVEL = logLevel;
        subject = proxyquire("../src/logger", {
          winston: winstonMock,
        });
      });

      afterEach(() => {
        delete process.env.ANALYTICS_LOG_LEVEL;
      });

      describe("and all config property are set", () => {
        it("creates a logger with log level set to the environment value and tag with 3 identifiers", () => {
          expect(
            subject.initialize({ agencyName, reportName, scriptName }),
          ).to.eql({
            level: logLevel,
            format: "printf",
            label: "foobar.sh - device - gov-wide",
            transports: [new WinstonConsoleMock({ level: logLevel })],
          });
        });
      });

      describe("and some config properties are not set", () => {
        describe("and only scriptName and agencyName are set", () => {
          it("creates a logger with log level set to the environment value and tag with 2 identifiers", () => {
            expect(subject.initialize({ agencyName, scriptName })).to.eql({
              level: logLevel,
              format: "printf",
              label: "foobar.sh - gov-wide",
              transports: [new WinstonConsoleMock({ level: logLevel })],
            });
          });
        });

        describe("and only scriptName and reportName are set", () => {
          it("creates a logger with log level set to the environment value and tag with 2 identifiers", () => {
            expect(subject.initialize({ reportName, scriptName })).to.eql({
              level: logLevel,
              format: "printf",
              label: "foobar.sh - device",
              transports: [new WinstonConsoleMock({ level: logLevel })],
            });
          });
        });

        describe("and only agencyName and reportName are set", () => {
          it("creates a logger with log level set to the environment value and tag with 2 identifiers", () => {
            expect(subject.initialize({ agencyName, reportName })).to.eql({
              level: logLevel,
              format: "printf",
              label: "device - gov-wide",
              transports: [new WinstonConsoleMock({ level: logLevel })],
            });
          });
        });

        describe("and only scriptName is set", () => {
          it("creates a logger with log level set to the environment value and tag with 1 identifier", () => {
            expect(subject.initialize({ scriptName })).to.eql({
              level: logLevel,
              format: "printf",
              label: "foobar.sh",
              transports: [new WinstonConsoleMock({ level: logLevel })],
            });
          });
        });

        describe("and only agencyName is set", () => {
          it("creates a logger with log level set to the environment value and tag with 1 identifier", () => {
            expect(subject.initialize({ agencyName })).to.eql({
              level: logLevel,
              format: "printf",
              label: "gov-wide",
              transports: [new WinstonConsoleMock({ level: logLevel })],
            });
          });
        });

        describe("and only reportName is set", () => {
          it("creates a logger with log level set to the environment value and tag with 1 identifier", () => {
            expect(subject.initialize({ reportName })).to.eql({
              level: logLevel,
              format: "printf",
              label: "device",
              transports: [new WinstonConsoleMock({ level: logLevel })],
            });
          });
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
