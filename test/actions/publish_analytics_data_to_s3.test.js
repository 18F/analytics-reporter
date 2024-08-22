const expect = require("chai").expect;
const sinon = require("sinon");

const s3Service = { publish: sinon.stub() };
const PublishAnalyticsDataToS3 = require("../../src/actions/publish_analytics_data_to_s3");

describe("PublishAnalyticsDataToS3", () => {
  let context;
  let subject;

  beforeEach(() => {
    subject = new PublishAnalyticsDataToS3(s3Service);
  });

  describe(".handles", () => {
    describe("when config.shouldPublishToS3 is true", () => {
      beforeEach(() => {
        context = { appConfig: { shouldPublishToS3: true } };
      });

      it("returns true", () => {
        expect(subject.handles(context)).to.equal(true);
      });
    });

    describe("when config.shouldPublishToS3 is false", () => {
      beforeEach(() => {
        context = { appConfig: { shouldPublishToS3: false } };
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

    describe("When a single format is configured", () => {
      beforeEach(async () => {
        debugLogSpy.resetHistory();
        s3Service.publish.resetHistory();
        context = {
          formattedAnalyticsData: { json: formattedAnalyticsData },
          logger: { debug: debugLogSpy },
          reportConfig: reportConfig,
          appConfig: {
            aws: {
              bucket: "test-bucket",
              cache: 60,
              path: "path/to/data",
            },
            formats: ["json"],
          },
        };
        await subject.executeStrategy(context);
      });

      it("calls s3Service.publish with analytics data and config options", () => {
        expect(
          s3Service.publish.calledWith(
            {
              name: context.reportConfig.name,
              bucket: context.appConfig.aws.bucket,
              path: context.appConfig.aws.path,
              format: context.appConfig.formats[0],
            },
            formattedAnalyticsData,
          ),
        ).to.equal(true);
      });
    });

    describe("When multiple formats are configured", () => {
      beforeEach(async () => {
        debugLogSpy.resetHistory();
        s3Service.publish.resetHistory();
        context = {
          formattedAnalyticsData: {
            csv: formattedAnalyticsData,
            json: formattedAnalyticsData,
          },
          logger: { debug: debugLogSpy },
          reportConfig: reportConfig,
          appConfig: {
            aws: {
              bucket: "test-bucket",
              cache: 60,
              path: "path/to/data",
            },
            formats: ["csv", "json"],
          },
        };
        await subject.executeStrategy(context);
      });

      it("calls s3Service.publish with analytics data and config options for format 1", () => {
        expect(
          s3Service.publish.calledWith(
            {
              name: context.reportConfig.name,
              bucket: context.appConfig.aws.bucket,
              path: context.appConfig.aws.path,
              format: context.appConfig.formats[0],
            },
            formattedAnalyticsData,
          ),
        ).to.equal(true);
      });

      it("calls s3Service.publish with analytics data and config options for format 2", () => {
        expect(
          s3Service.publish.calledWith(
            {
              name: context.reportConfig.name,
              bucket: context.appConfig.aws.bucket,
              path: context.appConfig.aws.path,
              format: context.appConfig.formats[1],
            },
            formattedAnalyticsData,
          ),
        ).to.equal(true);
      });
    });
  });
});
