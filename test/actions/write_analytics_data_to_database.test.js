const expect = require("chai").expect;
const sinon = require("sinon");

const postgresPublisher = { publish: sinon.stub() };
const WriteAnalyticsDataToDatabase = require("../../src/actions/write_analytics_data_to_database");

describe("WriteAnalyticsDataToDatabase", () => {
  let store;
  const context = {
    getStore: () => {
      return store;
    },
  };
  let subject;

  beforeEach(() => {
    subject = new WriteAnalyticsDataToDatabase(postgresPublisher);
  });

  describe(".handles", () => {
    describe("when config.shouldWriteToDatabase is true", () => {
      describe("and report is realtime", () => {
        beforeEach(() => {
          store = new Map([
            ["config", { shouldWriteToDatabase: true }],
            ["reportConfig", { realtime: true }],
          ]);
        });

        it("returns false", () => {
          expect(subject.handles(context)).to.equal(false);
        });
      });

      describe("and report is not realtime", () => {
        beforeEach(() => {
          store = new Map([
            ["config", { shouldWriteToDatabase: true }],
            ["reportConfig", { realtime: false }],
          ]);
        });

        it("returns true", () => {
          expect(subject.handles(context)).to.equal(true);
        });
      });
    });

    describe("when config.shouldWriteToDatabase is false", () => {
      describe("and report is realtime", () => {
        beforeEach(() => {
          store = new Map([
            ["config", { shouldWriteToDatabase: false }],
            ["reportConfig", { realtime: true }],
          ]);
        });

        it("returns false", () => {
          expect(subject.handles(context)).to.equal(false);
        });
      });

      describe("and report is not realtime", () => {
        beforeEach(() => {
          store = new Map([
            ["config", { shouldWriteToDatabase: false }],
            ["reportConfig", { realtime: false }],
          ]);
        });

        it("returns false", () => {
          expect(subject.handles(context)).to.equal(false);
        });
      });
    });
  });

  describe(".executeStrategy", () => {
    const debugLogSpy = sinon.spy();
    const processedAnalyticsData = { fake: "data" };
    const reportConfig = { name: "foobar" };

    beforeEach(async () => {
      debugLogSpy.resetHistory();
      postgresPublisher.publish.resetHistory();
      postgresPublisher.publish.returns(processedAnalyticsData);
      store = new Map([
        ["processedAnalyticsData", processedAnalyticsData],
        ["logger", { debug: debugLogSpy }],
        ["reportConfig", reportConfig],
      ]);
      await subject.executeStrategy(context);
    });

    it("calls postgresPublisher.publish with the expected params", () => {
      expect(
        postgresPublisher.publish.calledWith(processedAnalyticsData),
      ).to.equal(true);
    });
  });
});
