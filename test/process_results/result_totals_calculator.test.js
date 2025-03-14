const expect = require("chai").expect;
const reportFixture = require("../support/fixtures/report");
const dataFixture = require("../support/fixtures/data");
const ResultTotalsCalculator = require("../../src/process_results/result_totals_calculator");
const AnalyticsData = require("../../src/analytics_data");

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
        const analyticsData = AnalyticsData.fromGoogleAnalyticsQuery(
          report.query,
          [data],
        )[0];
        analyticsData.name = report.name;
        analyticsData.processData(report);
        const result = analyticsData.toJSON();
        const totals = ResultTotalsCalculator.calculateTotals(result);

        expect(totals).to.eql({});
      });
    });

    describe("when the report data is not empty", () => {
      let totals;
      let report;
      let data;

      beforeEach(() => {
        report = Object.assign({}, reportFixture);
        data = Object.assign({}, dataFixture);
      });

      describe('and data has the "users" metric', () => {
        beforeEach(() => {
          data.metricHeaders = [{ name: "totalUsers" }];
          data.rows = [
            { ...data.rows[0], metricValues: [{ value: "10" }] },
            { ...data.rows[1], metricValues: [{ value: "15" }] },
            { ...data.rows[2], metricValues: [{ value: "20" }] },
          ];

          const analyticsData = AnalyticsData.fromGoogleAnalyticsQuery(
            report.query,
            [data],
          )[0];
          analyticsData.name = report.name;
          analyticsData.processData(report);
          const result = analyticsData.toJSON();
          totals = ResultTotalsCalculator.calculateTotals(result);
        });

        it("computes totals for users", () => {
          expect(totals.totalUsers).to.equal(10 + 15 + 20);
        });
      });

      describe('and data has the "visits" metric', () => {
        beforeEach(() => {
          data.metricHeaders = [{ name: "sessions" }];
          data.rows = [
            { ...data.rows[0], metricValues: [{ value: "10" }] },
            { ...data.rows[1], metricValues: [{ value: "15" }] },
            { ...data.rows[2], metricValues: [{ value: "20" }] },
          ];

          const analyticsData = AnalyticsData.fromGoogleAnalyticsQuery(
            report.query,
            [data],
          )[0];
          analyticsData.name = report.name;
          analyticsData.processData(report);
          const result = analyticsData.toJSON();
          totals = ResultTotalsCalculator.calculateTotals(result);
        });

        it("should compute totals for visits", () => {
          expect(totals.visits).to.equal(10 + 15 + 20);
        });
      });

      describe("and options.sumVisitsByDimensions is provided", () => {
        let options;

        describe("and there is one column being totalled", () => {
          beforeEach(() => {
            options = { sumVisitsByDimensions: ["device"] };
            report.name = "devices";
            data.dimensionHeaders = [
              { name: "date" },
              { name: "deviceCategory" },
            ];
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

            const analyticsData = AnalyticsData.fromGoogleAnalyticsQuery(
              report.query,
              [data],
            )[0];
            analyticsData.name = report.name;
            analyticsData.processData(report);
            const result = analyticsData.toJSON();
            totals = ResultTotalsCalculator.calculateTotals(result, options);
          });

          it("should compute totals for mobile devices", () => {
            expect(totals.by_device.mobile).to.equal(100 + 400);
          });

          it("should compute totals for tablet devices", () => {
            expect(totals.by_device.tablet).to.equal(200 + 500);
          });

          it("should compute totals for desktop devices", () => {
            expect(totals.by_device.desktop).to.equal(300 + 600);
          });

          it("sorts totals by visit count", () => {
            expect(Object.entries(totals.by_device)).to.deep.equal(
              Object.entries({
                desktop: 900,
                tablet: 700,
                mobile: 500,
              }),
            );
          });
        });

        describe("and there are multiple columns being totalled", () => {
          beforeEach(() => {
            options = { sumVisitsByDimensions: ["language", "language_code"] };
            report.name = "language";
            data.dimensionHeaders = [
              { name: "date" },
              { name: "language" },
              { name: "language_code" },
            ];
            data.metricHeaders = [{ name: "sessions" }];
            data.rows = [
              {
                dimensionValues: [
                  { value: "20170130" },
                  { value: "en" },
                  { value: "en-us" },
                ],
                metricValues: [{ value: "100" }],
              },
              {
                dimensionValues: [
                  { value: "20170130" },
                  { value: "es" },
                  { value: "es-us" },
                ],
                metricValues: [{ value: "200" }],
              },
              {
                dimensionValues: [
                  { value: "20170131" },
                  { value: "en" },
                  { value: "en-us" },
                ],
                metricValues: [{ value: "300" }],
              },
              {
                dimensionValues: [
                  { value: "20170131" },
                  { value: "es" },
                  { value: "es-us" },
                ],
                metricValues: [{ value: "400" }],
              },
            ];

            const analyticsData = AnalyticsData.fromGoogleAnalyticsQuery(
              report.query,
              [data],
            )[0];
            analyticsData.name = report.name;
            analyticsData.processData(report);
            const result = analyticsData.toJSON();
            totals = ResultTotalsCalculator.calculateTotals(result, options);
          });

          it("should compute totals for en language", () => {
            expect(totals.by_language.en).to.equal(100 + 300);
          });

          it("should compute totals for es language", () => {
            expect(totals.by_language.es).to.equal(200 + 400);
          });

          it("should compute totals for en-us language code", () => {
            expect(totals.by_language_code["en-us"]).to.equal(100 + 300);
          });

          it("should compute totals for es-us language code", () => {
            expect(totals.by_language_code["es-us"]).to.equal(200 + 400);
          });
        });
      });

      describe("and options.sumActiveUsersByDimensions is provided", () => {
        let options;

        describe("and there is one column being totalled", () => {
          beforeEach(() => {
            options = { sumActiveUsersByDimensions: ["device"] };
            report.name = "devices";
            data.dimensionHeaders = [
              { name: "date" },
              { name: "deviceCategory" },
            ];
            data.metricHeaders = [{ name: "activeUsers" }];
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

            const analyticsData = AnalyticsData.fromGoogleAnalyticsQuery(
              report.query,
              [data],
            )[0];
            analyticsData.name = report.name;
            analyticsData.processData(report);
            const result = analyticsData.toJSON();
            totals = ResultTotalsCalculator.calculateTotals(result, options);
          });

          it("should compute user totals for mobile devices", () => {
            expect(totals.by_device.mobile).to.equal(100 + 400);
          });

          it("should compute user totals for tablet devices", () => {
            expect(totals.by_device.tablet).to.equal(200 + 500);
          });

          it("should compute user totals for desktop devices", () => {
            expect(totals.by_device.desktop).to.equal(300 + 600);
          });

          it("sorts totals by user count", () => {
            expect(Object.entries(totals.by_device)).to.deep.equal(
              Object.entries({
                desktop: 900,
                tablet: 700,
                mobile: 500,
              }),
            );
          });
        });

        describe("and there are multiple columns being totalled", () => {
          beforeEach(() => {
            options = {
              sumActiveUsersByDimensions: ["language", "language_code"],
            };
            report.name = "language";
            data.dimensionHeaders = [
              { name: "date" },
              { name: "language" },
              { name: "language_code" },
            ];
            data.metricHeaders = [{ name: "activeUsers" }];
            data.rows = [
              {
                dimensionValues: [
                  { value: "20170130" },
                  { value: "en" },
                  { value: "en-us" },
                ],
                metricValues: [{ value: "100" }],
              },
              {
                dimensionValues: [
                  { value: "20170130" },
                  { value: "es" },
                  { value: "es-us" },
                ],
                metricValues: [{ value: "200" }],
              },
              {
                dimensionValues: [
                  { value: "20170131" },
                  { value: "en" },
                  { value: "en-us" },
                ],
                metricValues: [{ value: "300" }],
              },
              {
                dimensionValues: [
                  { value: "20170131" },
                  { value: "es" },
                  { value: "es-us" },
                ],
                metricValues: [{ value: "400" }],
              },
            ];

            const analyticsData = AnalyticsData.fromGoogleAnalyticsQuery(
              report.query,
              [data],
            )[0];
            analyticsData.name = report.name;
            analyticsData.processData(report);
            const result = analyticsData.toJSON();
            totals = ResultTotalsCalculator.calculateTotals(result, options);
          });

          it("should compute user totals for en language", () => {
            expect(totals.by_language.en).to.equal(100 + 300);
          });

          it("should compute user totals for es language", () => {
            expect(totals.by_language.es).to.equal(200 + 400);
          });

          it("should compute user totals for en-us language code", () => {
            expect(totals.by_language_code["en-us"]).to.equal(100 + 300);
          });

          it("should compute user totals for es-us language code", () => {
            expect(totals.by_language_code["es-us"]).to.equal(200 + 400);
          });
        });
      });

      describe("and options.sumTotalUsersByDimensions is provided", () => {
        let options;

        describe("and there is one column being totalled", () => {
          beforeEach(() => {
            options = { sumTotalUsersByDimensions: ["device"] };
            report.name = "devices";
            data.dimensionHeaders = [
              { name: "date" },
              { name: "deviceCategory" },
            ];
            data.metricHeaders = [{ name: "totalUsers" }];
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

            const analyticsData = AnalyticsData.fromGoogleAnalyticsQuery(
              report.query,
              [data],
            )[0];
            analyticsData.name = report.name;
            analyticsData.processData(report);
            const result = analyticsData.toJSON();
            totals = ResultTotalsCalculator.calculateTotals(result, options);
          });

          it("should compute user totals for mobile devices", () => {
            expect(totals.by_device.mobile).to.equal(100 + 400);
          });

          it("should compute user totals for tablet devices", () => {
            expect(totals.by_device.tablet).to.equal(200 + 500);
          });

          it("should compute user totals for desktop devices", () => {
            expect(totals.by_device.desktop).to.equal(300 + 600);
          });

          it("sorts totals by user count", () => {
            expect(Object.entries(totals.by_device)).to.deep.equal(
              Object.entries({
                desktop: 900,
                tablet: 700,
                mobile: 500,
              }),
            );
          });
        });

        describe("and there are multiple columns being totalled", () => {
          beforeEach(() => {
            options = {
              sumTotalUsersByDimensions: ["language", "language_code"],
            };
            report.name = "language";
            data.dimensionHeaders = [
              { name: "date" },
              { name: "language" },
              { name: "language_code" },
            ];
            data.metricHeaders = [{ name: "totalUsers" }];
            data.rows = [
              {
                dimensionValues: [
                  { value: "20170130" },
                  { value: "en" },
                  { value: "en-us" },
                ],
                metricValues: [{ value: "100" }],
              },
              {
                dimensionValues: [
                  { value: "20170130" },
                  { value: "es" },
                  { value: "es-us" },
                ],
                metricValues: [{ value: "200" }],
              },
              {
                dimensionValues: [
                  { value: "20170131" },
                  { value: "en" },
                  { value: "en-us" },
                ],
                metricValues: [{ value: "300" }],
              },
              {
                dimensionValues: [
                  { value: "20170131" },
                  { value: "es" },
                  { value: "es-us" },
                ],
                metricValues: [{ value: "400" }],
              },
            ];

            const analyticsData = AnalyticsData.fromGoogleAnalyticsQuery(
              report.query,
              [data],
            )[0];
            analyticsData.name = report.name;
            analyticsData.processData(report);
            const result = analyticsData.toJSON();
            totals = ResultTotalsCalculator.calculateTotals(result, options);
          });

          it("should compute user totals for en language", () => {
            expect(totals.by_language.en).to.equal(100 + 300);
          });

          it("should compute user totals for es language", () => {
            expect(totals.by_language.es).to.equal(200 + 400);
          });

          it("should compute user totals for en-us language code", () => {
            expect(totals.by_language_code["en-us"]).to.equal(100 + 300);
          });

          it("should compute user totals for es-us language code", () => {
            expect(totals.by_language_code["es-us"]).to.equal(200 + 400);
          });
        });
      });

      describe("and options.sumTotalEventsByDimensions is provided", () => {
        let options;

        describe("and there is one column being totalled", () => {
          beforeEach(() => {
            options = { sumTotalEventsByDimensions: ["file_extension"] };
            report.name = "devices";
            data.dimensionHeaders = [{ name: "fileExtension" }];
            data.metricHeaders = [{ name: "eventCount" }];
            data.rows = [
              {
                dimensionValues: [{ value: "pdf" }],
                metricValues: [{ value: "100" }],
              },
              {
                dimensionValues: [{ value: "jpg" }],
                metricValues: [{ value: "200" }],
              },
              {
                dimensionValues: [{ value: "txt" }],
                metricValues: [{ value: "300" }],
              },
              {
                dimensionValues: [{ value: "zip" }],
                metricValues: [{ value: "400" }],
              },
              {
                dimensionValues: [{ value: "xslx" }],
                metricValues: [{ value: "500" }],
              },
              {
                dimensionValues: [{ value: "docx" }],
                metricValues: [{ value: "600" }],
              },
            ];

            const analyticsData = AnalyticsData.fromGoogleAnalyticsQuery(
              report.query,
              [data],
            )[0];
            analyticsData.name = report.name;
            analyticsData.processData(report);
            const result = analyticsData.toJSON();
            totals = ResultTotalsCalculator.calculateTotals(result, options);
          });

          it("should compute event totals for mobile file_extensions", () => {
            expect(totals.by_file_extension.pdf).to.equal(100);
          });

          it("should compute event totals for tablet file_extensions", () => {
            expect(totals.by_file_extension.jpg).to.equal(200);
          });

          it("should compute event totals for desktop file_extensions", () => {
            expect(totals.by_file_extension.txt).to.equal(300);
          });

          it("sorts totals by event count", () => {
            expect(Object.entries(totals.by_file_extension)).to.deep.equal(
              Object.entries({
                docx: 600,
                xslx: 500,
                zip: 400,
                txt: 300,
                jpg: 200,
                pdf: 100,
              }),
            );
          });
        });

        describe("and there are multiple columns being totalled", () => {
          beforeEach(() => {
            options = {
              sumTotalEventsByDimensions: ["language", "language_code"],
            };
            report.name = "language";
            data.dimensionHeaders = [
              { name: "date" },
              { name: "language" },
              { name: "language_code" },
            ];
            data.metricHeaders = [{ name: "eventCount" }];
            data.rows = [
              {
                dimensionValues: [
                  { value: "20170130" },
                  { value: "en" },
                  { value: "en-us" },
                ],
                metricValues: [{ value: "100" }],
              },
              {
                dimensionValues: [
                  { value: "20170130" },
                  { value: "es" },
                  { value: "es-us" },
                ],
                metricValues: [{ value: "200" }],
              },
              {
                dimensionValues: [
                  { value: "20170131" },
                  { value: "en" },
                  { value: "en-us" },
                ],
                metricValues: [{ value: "300" }],
              },
              {
                dimensionValues: [
                  { value: "20170131" },
                  { value: "es" },
                  { value: "es-us" },
                ],
                metricValues: [{ value: "400" }],
              },
            ];

            const analyticsData = AnalyticsData.fromGoogleAnalyticsQuery(
              report.query,
              [data],
            )[0];
            analyticsData.name = report.name;
            analyticsData.processData(report);
            const result = analyticsData.toJSON();
            totals = ResultTotalsCalculator.calculateTotals(result, options);
          });

          it("should compute event totals for en language", () => {
            expect(totals.by_language.en).to.equal(100 + 300);
          });

          it("should compute event totals for es language", () => {
            expect(totals.by_language.es).to.equal(200 + 400);
          });

          it("should compute event totals for en-us language code", () => {
            expect(totals.by_language_code["en-us"]).to.equal(100 + 300);
          });

          it("should compute event totals for es-us language code", () => {
            expect(totals.by_language_code["es-us"]).to.equal(200 + 400);
          });
        });
      });

      describe("and report should sum users for a combination of columns", () => {
        it("should compute totals for os-browsers by operating system and browser", () => {
          report.name = "os-browsers";
          data.dimensionHeaders = [
            { name: "date" },
            { name: "operatingSystem" },
            { name: "browser" },
          ];
          data.metricHeaders = [{ name: "totalUsers" }];
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

          const analyticsData = AnalyticsData.fromGoogleAnalyticsQuery(
            report.query,
            [data],
          )[0];
          analyticsData.name = report.name;
          analyticsData.processData(report);
          const result = analyticsData.toJSON();
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
          data.metricHeaders = [{ name: "totalUsers" }];
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

          const analyticsData = AnalyticsData.fromGoogleAnalyticsQuery(
            report.query,
            [data],
          )[0];
          analyticsData.name = report.name;
          analyticsData.processData(report);
          const result = analyticsData.toJSON();
          const totals = ResultTotalsCalculator.calculateTotals(result);

          expect(totals.by_windows.XP.Chrome).to.equal(100 + 500);
          expect(totals.by_windows.XP.Firefox).to.equal(200 + 600);
          expect(totals.by_browsers.Chrome.XP).to.equal(100 + 500);
          expect(totals.by_browsers.Chrome.Vista).to.equal(300 + 700);
        });
      });
    });
  });
});
