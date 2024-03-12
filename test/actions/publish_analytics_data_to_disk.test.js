const expect = require("chai").expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const DiskPublisher = { publish: sinon.stub() };
const PublishAnalyticsDataToDisk = proxyquire(
  "../../src/actions/publish_analytics_data_to_disk",
  {
    "../publish/disk": DiskPublisher,
  },
);

describe("PublishAnalyticsDataToDisk", () => {
  let store;
  const context = {
    getStore: () => {
      return store;
    },
  };
  let subject;

  beforeEach(() => {
    subject = new PublishAnalyticsDataToDisk();
  });

  describe(".handles", () => {
    describe("when config.shouldPublishToDisk is true", () => {
      beforeEach(() => {
        store = new Map([["config", { shouldPublishToDisk: true }]]);
      });

      it("returns true", () => {
        expect(subject.handles(context)).to.equal(true);
      });
    });

    describe("when config.shouldPublishToDisk is false", () => {
      beforeEach(() => {
        store = new Map([["config", { shouldPublishToDisk: false }]]);
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
    const config = { format: "csv", slim: true };

    beforeEach(async () => {
      debugLogSpy.resetHistory();
      DiskPublisher.publish.resetHistory();
      store = new Map([
        ["config", config],
        ["formattedAnalyticsData", formattedAnalyticsData],
        ["logger", { debug: debugLogSpy }],
        ["reportConfig", reportConfig],
      ]);
      await subject.executeStrategy(context);
    });

    it("calls DiskPublisher.publish with processed analytics data and config options", () => {
      expect(
        DiskPublisher.publish.calledWith(
          reportConfig,
          formattedAnalyticsData,
          config,
        ),
      ).to.equal(true);
    });
  });
});
