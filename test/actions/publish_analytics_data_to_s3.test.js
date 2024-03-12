const expect = require("chai").expect;
const sinon = require("sinon");

const s3Service = { publish: sinon.stub() };
const PublishAnalyticsDataToS3 = require("../../src/actions/publish_analytics_data_to_s3");

describe("PublishAnalyticsDataToS3", () => {
  let store;
  const context = {
    getStore: () => {
      return store;
    },
  };
  let subject;

  beforeEach(() => {
    subject = new PublishAnalyticsDataToS3(s3Service);
  });

  describe(".handles", () => {
    describe("when config.shouldPublishToS3 is true", () => {
      beforeEach(() => {
        store = new Map([["config", { shouldPublishToS3: true }]]);
      });

      it("returns true", () => {
        expect(subject.handles(context)).to.equal(true);
      });
    });

    describe("when config.shouldPublishToS3 is false", () => {
      beforeEach(() => {
        store = new Map([["config", { shouldPublishToS3: false }]]);
      });

      it("returns false", () => {
        expect(subject.handles(context)).to.equal(false);
      });
    });
  });

  describe(".executeStrategy", () => {
    const debugLogSpy = sinon.spy();
    const formattedAnalyticsData = { slim: true };
    const reportConfig = { name: "foobar", slim: false };

    beforeEach(async () => {
      debugLogSpy.resetHistory();
      s3Service.publish.resetHistory();
      store = new Map([
        ["formattedAnalyticsData", formattedAnalyticsData],
        ["logger", { debug: debugLogSpy }],
        ["reportConfig", reportConfig],
      ]);
      await subject.executeStrategy(context);
    });

    it("calls s3Service.publish with analytics data and config options", () => {
      expect(
        s3Service.publish.calledWith(reportConfig, formattedAnalyticsData),
      ).to.equal(true);
    });
  });
});
