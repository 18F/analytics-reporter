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

    describe("when a single format is configured", () => {
      const appConfig = {
        formats: ["csv"],
        slim: true,
        output: "/path/to/dir",
      };

      beforeEach(async () => {
        debugLogSpy.resetHistory();
        DiskPublisher.publish.resetHistory();
        context = {
          appConfig: appConfig,
          formattedAnalyticsData: { csv: formattedAnalyticsData },
          logger: { debug: debugLogSpy },
          reportConfig: reportConfig,
        };
        await subject.executeStrategy(context);
      });

      it("calls DiskPublisher.publish with processed analytics data and config options", () => {
        expect(
          DiskPublisher.publish.calledWith({
            name: reportConfig.name,
            format: appConfig.formats[0],
            data: formattedAnalyticsData,
            directory: appConfig.output,
          }),
        ).to.equal(true);
      });
    });

    describe("when multiple formats are configured", () => {
      const appConfig = {
        formats: ["csv", "json"],
        slim: true,
        output: "/path/to/dir",
      };

      beforeEach(async () => {
        debugLogSpy.resetHistory();
        DiskPublisher.publish.resetHistory();
        context = {
          appConfig: appConfig,
          formattedAnalyticsData: {
            csv: formattedAnalyticsData,
            json: formattedAnalyticsData,
          },
          logger: { debug: debugLogSpy },
          reportConfig: reportConfig,
        };
        await subject.executeStrategy(context);
      });

      it("calls DiskPublisher.publish with processed analytics data and config options for format 1", () => {
        expect(
          DiskPublisher.publish.calledWith({
            name: reportConfig.name,
            format: appConfig.formats[0],
            data: formattedAnalyticsData,
            directory: appConfig.output,
          }),
        ).to.equal(true);
      });

      it("calls DiskPublisher.publish with processed analytics data and config options for format 2", () => {
        expect(
          DiskPublisher.publish.calledWith({
            name: reportConfig.name,
            format: appConfig.formats[1],
            data: formattedAnalyticsData,
            directory: appConfig.output,
          }),
        ).to.equal(true);
      });
    });
  });
});
