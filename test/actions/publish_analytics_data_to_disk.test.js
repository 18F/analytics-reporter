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
  let context;
  let subject;

  beforeEach(() => {
    subject = new PublishAnalyticsDataToDisk();
  });

  describe(".handles", () => {
    describe("when appConfig.shouldPublishToDisk is true", () => {
      beforeEach(() => {
        context = { appConfig: { shouldPublishToDisk: true } };
      });

      it("returns true", () => {
        expect(subject.handles(context)).to.equal(true);
      });
    });

    describe("when appConfig.shouldPublishToDisk is false", () => {
      beforeEach(() => {
        context = { appConfig: { shouldPublishToDisk: false } };
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
    const appConfig = { format: "csv", slim: true };

    beforeEach(async () => {
      debugLogSpy.resetHistory();
      DiskPublisher.publish.resetHistory();
      context = {
        appConfig: appConfig,
        formattedAnalyticsData: formattedAnalyticsData,
        logger: { debug: debugLogSpy },
        reportConfig: reportConfig,
      };
      await subject.executeStrategy(context);
    });

    it("calls DiskPublisher.publish with processed analytics data and config options", () => {
      expect(
        DiskPublisher.publish.calledWith(
          reportConfig,
          formattedAnalyticsData,
          appConfig,
        ),
      ).to.equal(true);
    });
  });
});
