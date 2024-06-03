const expect = require("chai").expect;
const { AsyncLocalStorage } = require("node:async_hooks");
const ReportProcessingContext = require("../src/report_processing_context");

describe("ReportProcessingContext", () => {
  let subject;

  beforeEach(() => {
    subject = new ReportProcessingContext(new AsyncLocalStorage());
  });

  describe(".run", () => {
    describe("get config", () => {
      describe("when config has not been set in the run function", () => {
        let actual;

        beforeEach(async () => {
          await subject.run(() => {
            actual = subject.config;
          });
        });

        it("returns undefined", () => {
          expect(actual).to.equal(undefined);
        });
      });

      describe("when config has been set in the run function", () => {
        const expected = { foo: "bar" };
        let actual;

        beforeEach(async () => {
          await subject.run(() => {
            subject.config = expected;
            actual = subject.config;
          });
        });

        it("returns the set value", () => {
          expect(actual).to.equal(expected);
        });
      });
    });

    describe("get formattedAnalyticsData", () => {
      describe("when formattedAnalyticsData has not been set in the run function", () => {
        let actual;

        beforeEach(async () => {
          await subject.run(() => {
            actual = subject.formattedAnalyticsData;
          });
        });

        it("returns undefined", () => {
          expect(actual).to.equal(undefined);
        });
      });

      describe("when formattedAnalyticsData has been set in the run function", () => {
        const expected = { foo: "bar" };
        let actual;

        beforeEach(async () => {
          await subject.run(() => {
            subject.formattedAnalyticsData = expected;
            actual = subject.formattedAnalyticsData;
          });
        });

        it("returns the set value", () => {
          expect(actual).to.equal(expected);
        });
      });
    });

    describe("get googleAnalyticsQuery", () => {
      describe("when googleAnalyticsQuery has not been set in the run function", () => {
        let actual;

        beforeEach(async () => {
          await subject.run(() => {
            actual = subject.googleAnalyticsQuery;
          });
        });

        it("returns undefined", () => {
          expect(actual).to.equal(undefined);
        });
      });

      describe("when googleAnalyticsQuery has been set in the run function", () => {
        const expected = { foo: "bar" };
        let actual;

        beforeEach(async () => {
          await subject.run(() => {
            subject.googleAnalyticsQuery = expected;
            actual = subject.googleAnalyticsQuery;
          });
        });

        it("returns the set value", () => {
          expect(actual).to.equal(expected);
        });
      });
    });

    describe("get logger", () => {
      describe("when logger has not been set in the run function", () => {
        let actual;

        beforeEach(async () => {
          await subject.run(() => {
            actual = subject.logger;
          });
        });

        it("returns undefined", () => {
          expect(actual).to.equal(undefined);
        });
      });

      describe("when logger has been set in the run function", () => {
        const expected = { foo: "bar" };
        let actual;

        beforeEach(async () => {
          await subject.run(() => {
            subject.logger = expected;
            actual = subject.logger;
          });
        });

        it("returns the set value", () => {
          expect(actual).to.equal(expected);
        });
      });
    });

    describe("get processedAnalyticsData", () => {
      describe("when processedAnalyticsData has not been set in the run function", () => {
        let actual;

        beforeEach(async () => {
          await subject.run(() => {
            actual = subject.processedAnalyticsData;
          });
        });

        it("returns undefined", () => {
          expect(actual).to.equal(undefined);
        });
      });

      describe("when processedAnalyticsData has been set in the run function", () => {
        const expected = { foo: "bar" };
        let actual;

        beforeEach(async () => {
          await subject.run(() => {
            subject.processedAnalyticsData = expected;
            actual = subject.processedAnalyticsData;
          });
        });

        it("returns the set value", () => {
          expect(actual).to.equal(expected);
        });
      });
    });

    describe("get rawGoogleAnalyticsReportData", () => {
      describe("when rawGoogleAnalyticsReportData has not been set in the run function", () => {
        let actual;

        beforeEach(async () => {
          await subject.run(() => {
            actual = subject.rawGoogleAnalyticsReportData;
          });
        });

        it("returns undefined", () => {
          expect(actual).to.equal(undefined);
        });
      });

      describe("when rawGoogleAnalyticsReportData has been set in the run function", () => {
        const expected = { foo: "bar" };
        let actual;

        beforeEach(async () => {
          await subject.run(() => {
            subject.rawGoogleAnalyticsReportData = expected;
            actual = subject.rawGoogleAnalyticsReportData;
          });
        });

        it("returns the set value", () => {
          expect(actual).to.equal(expected);
        });
      });
    });

    describe("get reportConfig", () => {
      describe("when reportConfig has not been set in the run function", () => {
        let actual;

        beforeEach(async () => {
          await subject.run(() => {
            actual = subject.reportConfig;
          });
        });

        it("returns undefined", () => {
          expect(actual).to.equal(undefined);
        });
      });

      describe("when reportConfig has been set in the run function", () => {
        const expected = { foo: "bar" };
        let actual;

        beforeEach(async () => {
          await subject.run(() => {
            subject.reportConfig = expected;
            actual = subject.reportConfig;
          });
        });

        it("returns the set value", () => {
          expect(actual).to.equal(expected);
        });
      });
    });
  });
});
