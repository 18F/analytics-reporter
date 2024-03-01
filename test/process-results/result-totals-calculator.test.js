const expect = require("chai").expect;
const proxyquire = require("proxyquire");
const reportFixture = require("../support/fixtures/report");
const dataFixture = require("../support/fixtures/data");
const ResultTotalsCalculator = require("../../src/process-results/result-totals-calculator");

proxyquire.noCallThru();

const GoogleAnalyticsDataProcessor = proxyquire(
  "../../src/process-results/ga-data-processor",
  {
    "../config": { account: { hostname: "" } },
  },
);

describe("ResultTotalsCalculator", () => {
  describe("calculateTotals(result)", () => {
    describe("when the report data is empty", () => {
      let report;
      let data;

      beforeEach(() => {
        report = Object.assign({}, reportFixture);
        data = Object.assign({}, dataFixture);
        data.rows = [];
      });

      it("should return an empty object", () => {
        const result = GoogleAnalyticsDataProcessor.processData(report, data);
        const totals = ResultTotalsCalculator.calculateTotals(result);

        expect(totals).to.eql({});
      });
    });

    describe("when the report data is not empty", () => {
      let report;
      let data;

      beforeEach(() => {
        report = Object.assign({}, reportFixture);
        data = Object.assign({}, dataFixture);
      });

      it("should compute totals for users", () => {
        data.metricHeaders = [{ name: "users" }];
        data.rows = [
          { metricValues: [{ value: "10" }] },
          { metricValues: [{ value: "15" }] },
          { metricValues: [{ value: "20" }] },
        ];

        const result = GoogleAnalyticsDataProcessor.processData(report, data);

        const totals = ResultTotalsCalculator.calculateTotals(result);
        expect(totals.users).to.equal(10 + 15 + 20);
      });

      it("should compute totals for visits", () => {
        data.metricHeaders = [{ name: "sessions" }];
        data.rows = [
          { metricValues: [{ value: "10" }] },
          { metricValues: [{ value: "15" }] },
          { metricValues: [{ value: "20" }] },
        ];

        const result = GoogleAnalyticsDataProcessor.processData(report, data);

        const totals = ResultTotalsCalculator.calculateTotals(result);
        expect(totals.visits).to.equal(10 + 15 + 20);
      });

      it("should compute totals for device_models", () => {
        report.name = "device_model";
        data.dimensionHeaders = [
          { name: "date" },
          { name: "mobileDeviceModel" },
        ];
        data.metricHeaders = [{ name: "sessions" }];
        data.rows = [
          {
            dimensionValues: [{ value: "20170130" }, { value: "iPhone" }],
            metricValues: [{ value: "100" }],
          },
          {
            dimensionValues: [{ value: "20170130" }, { value: "Android" }],
            metricValues: [{ value: "200" }],
          },
          {
            dimensionValues: [{ value: "20170131" }, { value: "iPhone" }],
            metricValues: [{ value: "300" }],
          },
          {
            dimensionValues: [{ value: "20170131" }, { value: "Android" }],
            metricValues: [{ value: "400" }],
          },
        ];

        const result = GoogleAnalyticsDataProcessor.processData(report, data);

        const totals = ResultTotalsCalculator.calculateTotals(result);
        expect(totals.device_models.iPhone).to.equal(100 + 300);
        expect(totals.device_models.Android).to.equal(200 + 400);
      });

      it("should compute totals for languages", () => {
        report.name = "language";
        data.dimensionHeaders = [{ name: "date" }, { name: "language" }];
        data.metricHeaders = [{ name: "sessions" }];
        data.rows = [
          {
            dimensionValues: [{ value: "20170130" }, { value: "en" }],
            metricValues: [{ value: "100" }],
          },
          {
            dimensionValues: [{ value: "20170130" }, { value: "es" }],
            metricValues: [{ value: "200" }],
          },
          {
            dimensionValues: [{ value: "20170131" }, { value: "en" }],
            metricValues: [{ value: "300" }],
          },
          {
            dimensionValues: [{ value: "20170131" }, { value: "es" }],
            metricValues: [{ value: "400" }],
          },
        ];

        const result = GoogleAnalyticsDataProcessor.processData(report, data);

        const totals = ResultTotalsCalculator.calculateTotals(result);
        expect(totals.languages.en).to.equal(100 + 300);
        expect(totals.languages.es).to.equal(200 + 400);
      });

      it("should compute totals for devices", () => {
        report.name = "devices";
        data.dimensionHeaders = [{ name: "date" }, { name: "deviceCategory" }];
        data.metricHeaders = [{ name: "sessions" }];
        data.rows = [
          {
            dimensionValues: [{ value: "20170130" }, { value: "mobile" }],
            metricValues: [{ value: "100" }],
          },
          {
            dimensionValues: [{ value: "20170130" }, { value: "tablet" }],
            metricValues: [{ value: "200" }],
          },
          {
            dimensionValues: [{ value: "20170130" }, { value: "desktop" }],
            metricValues: [{ value: "300" }],
          },
          {
            dimensionValues: [{ value: "20170131" }, { value: "mobile" }],
            metricValues: [{ value: "400" }],
          },
          {
            dimensionValues: [{ value: "20170131" }, { value: "tablet" }],
            metricValues: [{ value: "500" }],
          },
          {
            dimensionValues: [{ value: "20170131" }, { value: "desktop" }],
            metricValues: [{ value: "600" }],
          },
        ];

        const result = GoogleAnalyticsDataProcessor.processData(report, data);

        const totals = ResultTotalsCalculator.calculateTotals(result);
        expect(totals.devices.mobile).to.equal(100 + 400);
        expect(totals.devices.tablet).to.equal(200 + 500);
        expect(totals.devices.desktop).to.equal(300 + 600);
      });

      it("should compute totals for screen-sizes", () => {
        report.name = "screen-size";
        data.dimensionHeaders = [
          { name: "date" },
          { name: "screenResolution" },
        ];
        data.metricHeaders = [{ name: "sessions" }];
        data.rows = [
          {
            dimensionValues: [{ value: "20170130" }, { value: "100x100" }],
            metricValues: [{ value: "100" }],
          },
          {
            dimensionValues: [{ value: "20170130" }, { value: "200x200" }],
            metricValues: [{ value: "200" }],
          },
          {
            dimensionValues: [{ value: "20170131" }, { value: "100x100" }],
            metricValues: [{ value: "300" }],
          },
          {
            dimensionValues: [{ value: "20170131" }, { value: "200x200" }],
            metricValues: [{ value: "400" }],
          },
        ];

        const result = GoogleAnalyticsDataProcessor.processData(report, data);

        const totals = ResultTotalsCalculator.calculateTotals(result);
        expect(totals.screen_resolution["100x100"]).to.equal(100 + 300);
        expect(totals.screen_resolution["200x200"]).to.equal(200 + 400);
      });

      it("should compute totals for os", () => {
        report.name = "os";
        data.dimensionHeaders = [{ name: "date" }, { name: "operatingSystem" }];
        data.metricHeaders = [{ name: "sessions" }];
        data.rows = [
          {
            dimensionValues: [{ value: "20170130" }, { value: "Nintendo Wii" }],
            metricValues: [{ value: "100" }],
          },
          {
            dimensionValues: [{ value: "20170130" }, { value: "Xbox" }],
            metricValues: [{ value: "200" }],
          },
          {
            dimensionValues: [{ value: "20170131" }, { value: "Nintendo Wii" }],
            metricValues: [{ value: "300" }],
          },
          {
            dimensionValues: [{ value: "20170131" }, { value: "Xbox" }],
            metricValues: [{ value: "400" }],
          },
        ];

        const result = GoogleAnalyticsDataProcessor.processData(report, data);

        const totals = ResultTotalsCalculator.calculateTotals(result);
        expect(totals.os["Nintendo Wii"]).to.equal(100 + 300);
        expect(totals.os["Xbox"]).to.equal(200 + 400);
      });

      it("should compute totals for windows", () => {
        report.name = "windows";
        data.dimensionHeaders = [
          { name: "date" },
          { name: "operatingSystemVersion" },
        ];
        data.metricHeaders = [{ name: "sessions" }];
        data.rows = [
          {
            dimensionValues: [{ value: "20170130" }, { value: "Server" }],
            metricValues: [{ value: "100" }],
          },
          {
            dimensionValues: [{ value: "20170130" }, { value: "Vista" }],
            metricValues: [{ value: "200" }],
          },
          {
            dimensionValues: [{ value: "20170131" }, { value: "Server" }],
            metricValues: [{ value: "300" }],
          },
          {
            dimensionValues: [{ value: "20170131" }, { value: "Vista" }],
            metricValues: [{ value: "400" }],
          },
        ];

        const result = GoogleAnalyticsDataProcessor.processData(report, data);

        const totals = ResultTotalsCalculator.calculateTotals(result);
        expect(totals.os_version.Server).to.equal(100 + 300);
        expect(totals.os_version.Vista).to.equal(200 + 400);
      });

      it("should compute totals for browsers", () => {
        report.name = "browsers";
        data.dimensionHeaders = [{ name: "date" }, { name: "browser" }];
        data.metricHeaders = [{ name: "sessions" }];
        data.rows = [
          {
            dimensionValues: [{ value: "20170130" }, { value: "Chrome" }],
            metricValues: [{ value: "100" }],
          },
          {
            dimensionValues: [{ value: "20170130" }, { value: "Safari" }],
            metricValues: [{ value: "200" }],
          },
          {
            dimensionValues: [{ value: "20170131" }, { value: "Chrome" }],
            metricValues: [{ value: "300" }],
          },
          {
            dimensionValues: [{ value: "20170131" }, { value: "Safari" }],
            metricValues: [{ value: "400" }],
          },
        ];

        const result = GoogleAnalyticsDataProcessor.processData(report, data);

        const totals = ResultTotalsCalculator.calculateTotals(result);
        expect(totals.browser.Chrome).to.equal(100 + 300);
        expect(totals.browser.Safari).to.equal(200 + 400);
      });

      it("should compute totals for os-browsers by operating system and browser", () => {
        report.name = "os-browsers";
        data.dimensionHeaders = [
          { name: "date" },
          { name: "operatingSystem" },
          { name: "browser" },
        ];
        data.metricHeaders = [{ name: "sessions" }];
        data.rows = [
          {
            dimensionValues: [
              { value: "20170130" },
              { value: "Windows" },
              { value: "Chrome" },
            ],
            metricValues: [{ value: "100" }],
          },
          {
            dimensionValues: [
              { value: "20170130" },
              { value: "Windows" },
              { value: "Firefox" },
            ],
            metricValues: [{ value: "200" }],
          },
          {
            dimensionValues: [
              { value: "20170130" },
              { value: "Linux" },
              { value: "Chrome" },
            ],
            metricValues: [{ value: "300" }],
          },
          {
            dimensionValues: [
              { value: "20170130" },
              { value: "Linux" },
              { value: "Firefox" },
            ],
            metricValues: [{ value: "400" }],
          },
          {
            dimensionValues: [
              { value: "20170130" },
              { value: "Windows" },
              { value: "Chrome" },
            ],
            metricValues: [{ value: "500" }],
          },
          {
            dimensionValues: [
              { value: "20170130" },
              { value: "Windows" },
              { value: "Firefox" },
            ],
            metricValues: [{ value: "600" }],
          },
          {
            dimensionValues: [
              { value: "20170130" },
              { value: "Linux" },
              { value: "Chrome" },
            ],
            metricValues: [{ value: "700" }],
          },
          {
            dimensionValues: [
              { value: "20170130" },
              { value: "Linux" },
              { value: "Firefox" },
            ],
            metricValues: [{ value: "800" }],
          },
        ];

        const result = GoogleAnalyticsDataProcessor.processData(report, data);

        const totals = ResultTotalsCalculator.calculateTotals(result);

        expect(totals.by_os.Windows.Chrome).to.equal(100 + 500);
        expect(totals.by_os.Windows.Firefox).to.equal(200 + 600);

        expect(totals.by_browsers.Chrome.Windows).to.equal(100 + 500);
        expect(totals.by_browsers.Chrome.Linux).to.equal(300 + 700);
      });

      it("should compute totals for windows-browsers by windows version and browser version", () => {
        report.name = "windows-browsers";
        data.dimensionHeaders = [
          { name: "date" },
          { name: "operatingSystemVersion" },
          { name: "browser" },
        ];
        data.metricHeaders = [{ name: "sessions" }];
        data.rows = [
          {
            dimensionValues: [
              { value: "20170130" },
              { value: "XP" },
              { value: "Chrome" },
            ],
            metricValues: [{ value: "100" }],
          },
          {
            dimensionValues: [
              { value: "20170130" },
              { value: "XP" },
              { value: "Firefox" },
            ],
            metricValues: [{ value: "200" }],
          },
          {
            dimensionValues: [
              { value: "20170130" },
              { value: "Vista" },
              { value: "Chrome" },
            ],
            metricValues: [{ value: "300" }],
          },
          {
            dimensionValues: [
              { value: "20170130" },
              { value: "Vista" },
              { value: "Firefox" },
            ],
            metricValues: [{ value: "400" }],
          },
          {
            dimensionValues: [
              { value: "20170130" },
              { value: "XP" },
              { value: "Chrome" },
            ],
            metricValues: [{ value: "500" }],
          },
          {
            dimensionValues: [
              { value: "20170130" },
              { value: "XP" },
              { value: "Firefox" },
            ],
            metricValues: [{ value: "600" }],
          },
          {
            dimensionValues: [
              { value: "20170130" },
              { value: "Vista" },
              { value: "Chrome" },
            ],
            metricValues: [{ value: "700" }],
          },
          {
            dimensionValues: [
              { value: "20170130" },
              { value: "Vista" },
              { value: "Firefox" },
            ],
            metricValues: [{ value: "800" }],
          },
        ];

        const result = GoogleAnalyticsDataProcessor.processData(report, data);

        const totals = ResultTotalsCalculator.calculateTotals(result);

        expect(totals.by_windows.XP.Chrome).to.equal(100 + 500);
        expect(totals.by_windows.XP.Firefox).to.equal(200 + 600);

        expect(totals.by_browsers.Chrome.XP).to.equal(100 + 500);
        expect(totals.by_browsers.Chrome.Vista).to.equal(300 + 700);
      });
    });
  });
});
