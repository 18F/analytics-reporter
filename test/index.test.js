const expect = require("chai").expect;
const proxyquire = require("proxyquire");
const sinon = require("sinon");
const util = require("util");

let context;
let reportConfigs;
let logger;
let processorError;

class Config {
  get filteredReportConfigurations() {
    return reportConfigs;
  }
}

class ReportProcessingContext {
  #config;
  #logger;
  #reportConfig;

  run(callback) {
    context = this;
    return callback();
  }

  get config() {
    return this.#config;
  }

  set config(config) {
    this.#config = config;
  }

  get logger() {
    return this.#logger;
  }

  set logger(logger) {
    this.#logger = logger;
  }

  get reportConfig() {
    return this.#reportConfig;
  }

  set reportConfig(reportConfig) {
    this.#reportConfig = reportConfig;
  }
}

class AsyncLocalStorage {}

class Processor {
  processChain(reportConfig) {
    if (processorError) {
      return Promise.reject(processorError);
    }
    return Promise.resolve(reportConfig);
  }
}

class S3Service {}

const subject = proxyquire("../index.js", {
  "node:async_hooks": { AsyncLocalStorage },
  "./src/config": Config,
  "./src/report_processing_context": ReportProcessingContext,
  "./src/processor": Processor,
  "./src/logger": {
    initialize: () => {
      return logger;
    },
  },
  "./src/publish/s3": S3Service,
});

describe("index", () => {
  beforeEach(() => {
    logger = {
      info: sinon.spy(),
      error: sinon.spy(),
    };
  });

  describe(".run", () => {
    const reportConfig = { foo: "bar" };

    describe("when processing is successful", () => {
      beforeEach(async () => {
        reportConfigs = [reportConfig];
        await subject.run();
      });

      it("sets a config instance on the context", () => {
        expect(context.config instanceof Config).to.equal(true);
      });

      it("sets a report config on the context", () => {
        expect(context.reportConfig).to.equal(reportConfig);
      });

      it("sets a logger on the context", () => {
        expect(context.logger).to.equal(logger);
      });

      it("logs processing complete", () => {
        expect(logger.info.calledWith("Processing complete")).to.equal(true);
      });
    });

    describe("when processing has an error", () => {
      beforeEach(async () => {
        processorError = new Error("you broke it");
        reportConfigs = [reportConfig];
        await subject.run();
      });

      it("sets a config instance on the context", () => {
        expect(context.config instanceof Config).to.equal(true);
      });

      it("sets a report config on the context", () => {
        expect(context.reportConfig).to.equal(reportConfig);
      });

      it("sets a logger on the context", () => {
        expect(context.logger).to.equal(logger);
      });

      it("logs that there was a processing error", () => {
        expect(logger.error.calledWith("Encountered an error")).to.equal(true);
      });

      it("logs the error", () => {
        expect(logger.error.calledWith(util.inspect(processorError))).to.equal(
          true,
        );
      });
    });
  });
});
