const expect = require("chai").expect;
const proxyquire = require("proxyquire");
const reportFixture = require("../support/fixtures/report");
const dataFixture = require("../support/fixtures/data");
const dataWithHostnameFixture = require("../support/fixtures/data_with_hostname");
const ResultTotalsCalculator = require("../../src/process_results/result_totals_calculator");

proxyquire.noCallThru();

const config = {};

const AnalyticsDataProcessor = proxyquire(
  "../../src/process_results/analytics_data_processor",
  { "./result_totals_calculator": ResultTotalsCalculator },
);

describe("AnalyticsDataProcessor", () => {
  describe(".processData(report, data)", () => {
    let report;
    let data;
    let subject;

    beforeEach(() => {
      report = Object.assign({}, reportFixture);
      data = Object.assign({}, dataFixture);
      config.account = {
        hostname: "",
      };
      subject = new AnalyticsDataProcessor(config);
    });

    it("should return results with the correct props", () => {
      const result = subject.processData(report, data);
      expect(result.name).to.be.a("string");
      expect(result.query).be.an("object");
      expect(result.meta).be.an("object");
      expect(result.data).be.an("array");
      expect(result.totals).be.an("object");
      expect(result.totals).be.an("object");
      expect(result.taken_at).be.a("date");
    });

    it("should return results with an empty data array if data is undefined or has no rows", () => {
      data.rows = [];
      expect(subject.processData(report, data).data).to.be.empty;
      data.rows = undefined;
      expect(subject.processData(report, data).data).to.be.empty;
    });

    it("should delete the query ids for the GA response", () => {
      const result = subject.processData(report, data);
      expect(result.query).to.not.have.property("ids");
    });

    it("should map headers from GA keys to DAP keys", () => {
      data.dimensionHeaders = [
        { name: "fileName" },
        { name: "operatingSystem" },
      ];
      data.metricHeaders = [{ name: "sessions" }, { name: "activeUsers" }];
      data.rows = [
        {
          dimensionValues: [{ value: "foobar" }, { value: "windows" }],
          metricValues: [{ value: "12345" }, { value: "23456" }],
        },
      ];

      const result = subject.processData(report, data);
      expect(Object.keys(result.data[0])).to.deep.equal([
        "file_name",
        "os",
        "visits",
        "active_visitors",
      ]);
    });

    it("should format dates", () => {
      data.dimensionHeaders = [{ name: "date" }];
      data.rows = [{ dimensionValues: [{ value: "20170130" }] }];

      const result = subject.processData(report, data);
      expect(result.data[0].date).to.equal("2017-01-30");
    });

    it("should not format dates with value (other)", () => {
      data.dimensionHeaders = [{ name: "date" }];
      data.rows = [{ dimensionValues: [{ value: "(other)" }] }];

      const result = subject.processData(report, data);
      expect(result.data[0].date).to.equal("(other)");
    });

    it("should filter rows that don't meet a dimension threshold if a threshold is provided", () => {
      report.threshold = {
        field: "unmapped_column",
        value: "10",
      };
      data.dimensionHeaders = [
        { name: "operatingSystem" },
        { name: "unmapped_column" },
      ];
      data.metricHeaders = [{ name: "sessions" }];

      data.rows = [
        {
          dimensionValues: [{ value: "macOs" }, { value: "20" }],
          metricValues: [{ value: "12345" }],
        },
        {
          dimensionValues: [{ value: "windows" }, { value: "5" }],
          metricValues: [{ value: "12345" }],
        },
        {
          dimensionValues: [{ value: "iOS" }, { value: "15" }],
          metricValues: [{ value: "12345" }],
        },
      ];

      const result = subject.processData(report, data);
      expect(result.data).to.have.length(2);
      expect(result.data.map((row) => row.unmapped_column)).to.deep.equal([
        "20",
        "15",
      ]);
    });

    it("should not filter rows when a threshold is provided that doesn't exist in the data", () => {
      report.threshold = {
        field: "foobar",
        value: "10",
      };
      data.dimensionHeaders = [{ name: "operatingSystem" }];
      data.metricHeaders = [{ name: "sessions" }];

      data.rows = [
        {
          dimensionValues: [{ value: "macOs" }],
          metricValues: [{ value: "12345" }],
        },
        {
          dimensionValues: [{ value: "windows" }],
          metricValues: [{ value: "12345" }],
        },
        {
          dimensionValues: [{ value: "iOS" }],
          metricValues: [{ value: "12345" }],
        },
      ];

      const result = subject.processData(report, data);
      expect(result.data).to.have.length(3);
    });

    it("should filter rows that don't meet a metric threshold if a threshold is provided", () => {
      report.threshold = {
        field: "unmapped_column",
        value: "10",
      };
      data.dimensionHeaders = [{ name: "operatingSystem" }];
      data.metricHeaders = [{ name: "sessions" }, { name: "unmapped_column" }];

      data.rows = [
        {
          dimensionValues: [{ value: "macOs" }],
          metricValues: [{ value: "12345" }, { value: "20" }],
        },
        {
          dimensionValues: [{ value: "windows" }],
          metricValues: [{ value: "12345" }, { value: "5" }],
        },
        {
          dimensionValues: [{ value: "iOS" }],
          metricValues: [{ value: "12345" }, { value: "15" }],
        },
      ];

      const result = subject.processData(report, data);
      expect(result.data).to.have.length(2);
      expect(result.data.map((row) => row.unmapped_column)).to.deep.equal([
        "20",
        "15",
      ]);
    });

    it("should remove dimensions that are specified by the cut prop", () => {
      report.cut = "unmapped_column";
      data.dimensionHeaders = [
        { name: "ga:hostname" },
        { name: "unmapped_column" },
      ];
      data.metricHeaders = [];
      data.rows = [
        {
          dimensionValues: [
            { value: "www.example.gov" },
            { value: "10000000" },
          ],
          metricValues: [],
        },
      ];

      const result = subject.processData(report, data);
      expect(result.data[0].unmapped_column).to.be.undefined;
    });

    it("should remove metrics that are specified by the cut prop", () => {
      report.cut = "unmapped_column";
      data.dimensionHeaders = [];
      data.metricHeaders = [{ name: "sessions" }, { name: "unmapped_column" }];
      data.rows = [
        {
          dimensionValues: [],
          metricValues: [{ value: "12345" }, { value: "10000000" }],
        },
      ];

      const result = subject.processData(report, data);
      expect(result.data[0].unmapped_column).to.be.undefined;
    });

    it("should not remove metrics when the cut prop is a column that doesn't exist", () => {
      report.cut = "junk";
      data.dimensionHeaders = [];
      data.metricHeaders = [{ name: "sessions" }, { name: "unmapped_column" }];
      data.rows = [
        {
          dimensionValues: [],
          metricValues: [{ value: "12345" }, { value: "10000000" }],
        },
      ];

      const result = subject.processData(report, data);
      expect(Object.keys(result.data[0]).length).to.equal(2);
    });

    it("should add a hostname to realtime data if a hostname is specified by the config", () => {
      report.realtime = true;
      config.account.hostname = "www.example.gov";

      subject = new AnalyticsDataProcessor(config);

      const result = subject.processData(report, data);
      expect(result.data[0].domain).to.equal("www.example.gov");
    });

    it("should not overwrite the domain with a hostname from the config", () => {
      let dataWithHostname;
      dataWithHostname = Object.assign({}, dataWithHostnameFixture);
      report.realtime = true;
      config.account.hostname = "www.example.gov";
      subject = new AnalyticsDataProcessor(config);

      const result = subject.processData(report, dataWithHostname);
      expect(result.data[0].domain).to.equal("www.example0.com");
    });

    it("should use ResultTotalsCalculator to calculate the totals", () => {
      const calculateTotals = (result) => {
        expect(result.name).to.equal(report.name);
        expect(result.data).to.be.an("array");
        return { visits: 1234 };
      };
      const AnalyticsDataProcessor = proxyquire(
        "../../src/process_results/analytics_data_processor",
        { "./result_totals_calculator": { calculateTotals } },
      );
      subject = new AnalyticsDataProcessor(config);

      const result = subject.processData(report, data);
      expect(result.totals).to.deep.equal({ visits: 1234 });
    });
  });
});
