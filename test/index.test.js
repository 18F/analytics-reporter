const expect = require("chai").expect;
const proxyquire = require("proxyquire");
const sinon = require("sinon");
const util = require("util");

let context;
let reportConfigs;
let logger;
let processorError;
let queueMessages;
let pollError;

class AppConfig {
  get filteredReportConfigurations() {
    return reportConfigs;
  }

  get shouldWriteToDatabase() {
    return true;
  }

  get knexConfig() {
    return {};
  }

  get messageQueueName() {
    return "test_queue";
  }
}

class ReportProcessingContext {
  #appConfig;
  #logger;
  #reportConfig;

  run(callback) {
    context = this;
    return callback();
  }

  get appConfig() {
    return this.#appConfig;
  }

  set appConfig(appConfig) {
    this.#appConfig = appConfig;
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

  static buildAnalyticsProcessor() {
    return new Processor();
  }
}

class S3Service {}

class Queue {
  async start() {}

  async poll(callback) {
    if (pollError) {
      throw pollError;
    }
    for (const message of queueMessages) {
      await callback(message);
    }
  }

  static buildQueue() {
    return new Queue();
  }
}

const knexStub = () => {
  return { destroy: () => {} };
};

const subject = proxyquire("../index.js", {
  "node:async_hooks": { AsyncLocalStorage },
  knex: knexStub,
  "./src/app_config": AppConfig,
  "./src/report_processing_context": ReportProcessingContext,
  "./src/processor": Processor,
  "./src/logger": {
    initialize: () => {
      return logger;
    },
  },
  "./src/publish/s3": S3Service,
  "./src/queue/queue": Queue,
});

describe("index", () => {
  beforeEach(() => {
    logger = {
      info: sinon.spy(),
      error: sinon.spy(),
      clear: sinon.spy(),
    };
  });

  describe(".run", () => {
    const reportConfig = { foo: "bar" };

    describe("when processing is successful", () => {
      beforeEach(async () => {
        reportConfigs = [reportConfig];
        await subject.run();
      });

      it("sets an app config instance on the context", () => {
        expect(context.appConfig instanceof AppConfig).to.equal(true);
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

      it("sets an app config instance on the context", () => {
        expect(context.appConfig instanceof AppConfig).to.equal(true);
      });

      it("sets a report config on the context", () => {
        expect(context.reportConfig).to.equal(reportConfig);
      });

      it("sets a logger on the context", () => {
        expect(context.logger).to.equal(logger);
      });

      it("logs that there was a processing error", () => {
        expect(
          logger.error.calledWith(
            "Encountered an error during report processing",
          ),
        ).to.equal(true);
      });

      it("logs the error", () => {
        expect(logger.error.calledWith(util.inspect(processorError))).to.equal(
          true,
        );
      });
    });
  });

  describe(".runQueueConsume", () => {
    const message = {
      agencyName: "agency",
      analyticsReportIds: "1234",
      awsBucketPath: "path/to/bucket",
      scriptName: "script.js",
      reportConfig: { foo: "bar" },
      options: {},
    };

    beforeEach(() => {
      processorError = undefined;
      pollError = undefined;
      queueMessages = [message];
    });

    describe("when a wrapJob function is provided", () => {
      let wrapJob;

      beforeEach(async () => {
        wrapJob = sinon.spy((name, job) => job());
        await subject.runQueueConsume({ wrapJob });
      });

      it("wraps each report processing job", () => {
        expect(wrapJob.calledOnce).to.equal(true);
      });

      it("passes the job name to the wrapper", () => {
        expect(wrapJob.firstCall.args[0]).to.equal("ProcessReport");
      });

      it("processes the report from the queue message", () => {
        expect(context.reportConfig).to.equal(message.reportConfig);
      });

      it("logs processing complete", () => {
        expect(logger.info.calledWith("Processing complete")).to.equal(true);
      });
    });

    describe("when no wrapJob function is provided", () => {
      beforeEach(async () => {
        await subject.runQueueConsume();
      });

      it("processes the report from the queue message", () => {
        expect(context.reportConfig).to.equal(message.reportConfig);
      });

      it("logs processing complete", () => {
        expect(logger.info.calledWith("Processing complete")).to.equal(true);
      });
    });

    describe("when polling the queue has an error", () => {
      beforeEach(async () => {
        pollError = new Error("queue is down");
        await subject.runQueueConsume();
      });

      it("logs that there was a polling error", () => {
        expect(
          logger.error.calledWith("Error polling queue for messages"),
        ).to.equal(true);
      });

      it("logs the error", () => {
        expect(logger.error.calledWith(util.inspect(pollError))).to.equal(true);
      });
    });
  });
});
