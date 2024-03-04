const expect = require("chai").expect;
const sinon = require("sinon");
const LogAnalyticsData = require("../../src/actions/log_analytics_data");

describe("LogAnalyticsData", () => {
  let store;
  const context = {
    getStore: () => {
      return store;
    },
  };
  let subject;

  beforeEach(() => {
    subject = new LogAnalyticsData();
  });

  describe(".handles", () => {
    describe("when config.shouldLogAnalyticsData is true", () => {
      beforeEach(() => {
        store = new Map([["config", { shouldLogAnalyticsData: true }]]);
      });

      it("returns true", () => {
        expect(subject.handles(context)).to.equal(true);
      });
    });

    describe("when config.shouldLogAnalyticsData is false", () => {
      beforeEach(() => {
        store = new Map([["config", { shouldLogAnalyticsData: false }]]);
      });

      it("returns false", () => {
        expect(subject.handles(context)).to.equal(false);
      });
    });
  });

  describe(".executeStrategy", () => {
    const infoLogSpy = sinon.spy();
    const formattedAnalyticsData = { foo: "bar" };

    beforeEach(async () => {
      infoLogSpy.resetHistory();
      store = new Map([
        ["formattedAnalyticsData", formattedAnalyticsData],
        ["logger", { debug: () => {}, info: infoLogSpy }],
        ["reportConfig", { name: "test" }],
      ]);
      await subject.executeStrategy(context);
    });

    it("calls logger.info with the formatted analytics data", () => {
      expect(infoLogSpy.calledWith(formattedAnalyticsData)).to.equal(true);
    });
  });
});
