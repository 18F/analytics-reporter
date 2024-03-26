const expect = require("chai").expect;
const proxyquire = require("proxyquire");
const sinon = require("sinon");
const util = require("util");

let reportConfigs;
let contextStore;
let logger;
let processorError;

class Config {
  get filteredReportConfigurations() {
    return reportConfigs;
  }
}

class AsyncLocalStorage {
  async run(store, callback) {
    contextStore = store;
    await callback();
  }
}

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
        expect(contextStore.get("config") instanceof Config).to.equal(true);
      });

      it("sets a report config on the context", () => {
        expect(contextStore.get("reportConfig")).to.equal(reportConfig);
      });

      it("sets a logger on the context", () => {
        expect(contextStore.get("logger")).to.equal(logger);
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
        expect(contextStore.get("config") instanceof Config).to.equal(true);
      });

      it("sets a report config on the context", () => {
        expect(contextStore.get("reportConfig")).to.equal(reportConfig);
      });

      it("sets a logger on the context", () => {
        expect(contextStore.get("logger")).to.equal(logger);
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
