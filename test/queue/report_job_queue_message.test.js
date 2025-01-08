const expect = require("chai").expect;
const ReportJobQueueMessage = require("../../src/queue/report_job_queue_message");

describe("ReportJobQueueMessage", () => {
  const agencyName = "test-agency";
  const analyticsReportIds = "12343567";
  const awsBucketPath = "/data/test-agency";
  const reportOptions = { foo: "bar" };
  const reportConfig = { query: "get some data", name: "foobar report" };
  const scriptName = "daily.sh";
  let subject;

  beforeEach(async () => {
    subject = new ReportJobQueueMessage({});
  });

  describe(".toJSON", () => {
    describe("when no arguments are passed to the constructor", () => {
      it("returns an object with default values", () => {
        expect(subject.toJSON()).to.deep.equal({
          agencyName: "",
          analyticsReportIds: "",
          awsBucketPath: "",
          reportConfig: {},
          options: {},
          scriptName: "",
        });
      });
    });

    describe("when all arguments are passed to the constructor", () => {
      beforeEach(() => {
        subject = new ReportJobQueueMessage({
          agencyName,
          analyticsReportIds,
          awsBucketPath,
          reportConfig,
          reportOptions,
          scriptName,
        });
      });

      it("returns an object with default values", () => {
        expect(subject.toJSON()).to.deep.equal({
          agencyName,
          analyticsReportIds,
          awsBucketPath,
          reportConfig,
          options: reportOptions,
          scriptName,
        });
      });
    });
  });

  describe(".sendOptions", () => {
    describe("when report frequency is not set", () => {
      const noFrequencyReportConfig = { name: "no frequency" };

      beforeEach(() => {
        subject = new ReportJobQueueMessage({
          agencyName,
          analyticsReportIds,
          awsBucketPath,
          reportConfig: noFrequencyReportConfig,
          reportOptions,
          scriptName,
        });
      });

      it("returns an options object with priority: 0", () => {
        expect(subject.sendOptions()).to.deep.equal({
          priority: 0,
          retryLimit: 2,
          retryDelay: 10,
          retryBackoff: true,
          singletonKey: `${scriptName}-${agencyName}-${noFrequencyReportConfig.name}`,
        });
      });
    });

    describe("when report frequency is daily", () => {
      const dailyReportConfig = { name: "daily", frequency: "daily" };

      beforeEach(() => {
        subject = new ReportJobQueueMessage({
          agencyName,
          analyticsReportIds,
          awsBucketPath,
          reportConfig: dailyReportConfig,
          reportOptions,
          scriptName,
        });
      });

      it("returns an options object with priority: 1", () => {
        expect(subject.sendOptions()).to.deep.equal({
          priority: 1,
          retryLimit: 2,
          retryDelay: 10,
          retryBackoff: true,
          singletonKey: `${scriptName}-${agencyName}-${dailyReportConfig.name}`,
        });
      });
    });

    describe("when report frequency is hourly", () => {
      const hourlyReportConfig = { name: "hourly", frequency: "hourly" };

      beforeEach(() => {
        subject = new ReportJobQueueMessage({
          agencyName,
          analyticsReportIds,
          awsBucketPath,
          reportConfig: hourlyReportConfig,
          reportOptions,
          scriptName,
        });
      });

      it("returns an options object with priority: 2", () => {
        expect(subject.sendOptions()).to.deep.equal({
          priority: 2,
          retryLimit: 2,
          retryDelay: 10,
          retryBackoff: true,
          singletonKey: `${scriptName}-${agencyName}-${hourlyReportConfig.name}`,
        });
      });
    });

    describe("when report frequency is realtime", () => {
      const realtimeReportConfig = { name: "realtime", frequency: "realtime" };

      beforeEach(() => {
        subject = new ReportJobQueueMessage({
          agencyName,
          analyticsReportIds,
          awsBucketPath,
          reportConfig: realtimeReportConfig,
          reportOptions,
          scriptName,
        });
      });

      it("returns an options object with priority: 3", () => {
        expect(subject.sendOptions()).to.deep.equal({
          priority: 3,
          retryLimit: 2,
          retryDelay: 10,
          retryBackoff: true,
          singletonKey: `${scriptName}-${agencyName}-${realtimeReportConfig.name}`,
        });
      });
    });
  });

  describe(".fromMessage", () => {
    describe("when arguments are passed", () => {
      it("creates a new ReportJobQueueMessage instance", () => {
        expect(
          ReportJobQueueMessage.fromMessage({ data: {} }) instanceof
            ReportJobQueueMessage,
        ).to.equal(true);
      });
    });

    describe("when no arguments are passed", () => {
      it("creates a new ReportJobQueueMessage instance", () => {
        expect(
          ReportJobQueueMessage.fromMessage() instanceof ReportJobQueueMessage,
        ).to.equal(true);
      });
    });
  });
});
