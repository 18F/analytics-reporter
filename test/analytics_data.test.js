const expect = require("chai").expect;
const AnalyticsData = require("../src/analytics_data");

describe("AnalyticsData", () => {
  describe(".fromGoogleAnalyticsQuery", () => {
    let gaResponse;
    let query;
    let actual;

    describe("when params are empty", () => {
      it("returns an empty array", () => {
        expect(AnalyticsData.fromGoogleAnalyticsQuery()).to.deep.equal([]);
      });
    });

    describe("when params are provided", () => {
      describe("and a single date range is in the query", () => {
        const expectedData = [
          {
            activeUsers: "303759",
            screenResolution: "1920x1080",
            yearMonth: "202502",
          },
          {
            activeUsers: "303759",
            screenResolution: "1920x1080",
            yearMonth: "202502",
          },
          {
            activeUsers: "303759",
            screenResolution: "1920x1080",
            yearMonth: "202502",
          },
        ];

        beforeEach(() => {
          gaResponse = [
            {
              metrics: [{ name: "activeUsers" }],
              orderBys: [
                { desc: true, dimension: [Object] },
                { desc: true, metric: [Object] },
              ],
              dateRanges: [{ endDate: "yesterday", startDate: "yesterday" }],
              dimensions: [{ name: "yearMonth" }, { name: "screenResolution" }],
              dimensionFilter: { andGroup: { expressions: [Array] } },
              limit: "10000",
              property: "properties/395256592",
              ids: "395256592",
              dimensionHeaders: [
                {
                  name: "yearMonth",
                },
                {
                  name: "screenResolution",
                },
              ],
              metricHeaders: [
                {
                  name: "activeUsers",
                  type: "TYPE_INTEGER",
                },
              ],
              rows: [
                {
                  dimensionValues: [
                    {
                      value: "202502",
                      oneValue: "value",
                    },
                    {
                      value: "1920x1080",
                      oneValue: "value",
                    },
                  ],
                  metricValues: [
                    {
                      value: "303759",
                      oneValue: "value",
                    },
                  ],
                },
                {
                  dimensionValues: [
                    {
                      value: "202502",
                      oneValue: "value",
                    },
                    {
                      value: "1920x1080",
                      oneValue: "value",
                    },
                  ],
                  metricValues: [
                    {
                      value: "303759",
                      oneValue: "value",
                    },
                  ],
                },
                {
                  dimensionValues: [
                    {
                      value: "202502",
                      oneValue: "value",
                    },
                    {
                      value: "1920x1080",
                      oneValue: "value",
                    },
                  ],
                  metricValues: [
                    {
                      value: "303759",
                      oneValue: "value",
                    },
                  ],
                },
              ],
            },
          ];
          query = {
            orderBys: [
              { desc: true, dimension: [Object] },
              { desc: true, metric: [Object] },
            ],
            dateRanges: [{ endDate: "yesterday", startDate: "yesterday" }],
            dimensions: [{ name: "yearMonth" }, { name: "screenResolution" }],
            metrics: [{ name: "activeUsers" }],
            dimensionFilter: { andGroup: { expressions: [Array] } },
            limit: "10000",
            property: "properties/395450427",
            ids: "395450427",
          };
          actual = AnalyticsData.fromGoogleAnalyticsQuery(query, gaResponse);
        });

        it("creates a new AnalyticsData instance for each date range", () => {
          expect(actual.length).to.equal(query.dateRanges.length);
        });

        it("each AnalyticsData instance has expected data", () => {
          actual.forEach((actualItem, index) => {
            expect(actualItem).to.deep.equal(
              new AnalyticsData(
                { ...query, dateRanges: [query.dateRanges[index]] },
                expectedData,
              ),
            );
          });
        });
      });

      describe("and a multiple date ranges are in the query", () => {
        const expectedData = {
          date_range_0: [
            {
              activeUsers: "72994",
              screenResolution: "1920x1080",
              yearMonth: "202502",
            },
          ],
          date_range_1: [
            {
              activeUsers: "303759",
              screenResolution: "1920x1080",
              yearMonth: "202502",
            },
            {
              activeUsers: "149951",
              screenResolution: "1536x864",
              yearMonth: "202502",
            },
            {
              activeUsers: "76511",
              screenResolution: "390x844",
              yearMonth: "202502",
            },
          ],
          date_range_2: [
            {
              activeUsers: "303759",
              screenResolution: "1920x1080",
              yearMonth: "202502",
            },
            {
              activeUsers: "149951",
              screenResolution: "1536x864",
              yearMonth: "202502",
            },
            {
              activeUsers: "76511",
              screenResolution: "390x844",
              yearMonth: "202502",
            },
          ],
          date_range_3: [
            {
              activeUsers: "303759",
              screenResolution: "1920x1080",
              yearMonth: "202502",
            },
            {
              activeUsers: "149951",
              screenResolution: "1536x864",
              yearMonth: "202502",
            },
            {
              activeUsers: "76511",
              screenResolution: "390x844",
              yearMonth: "202502",
            },
          ],
        };

        beforeEach(() => {
          gaResponse = [
            {
              dimensionHeaders: [
                {
                  name: "yearMonth",
                },
                {
                  name: "screenResolution",
                },
                {
                  name: "dateRange",
                },
              ],
              metricHeaders: [
                {
                  name: "activeUsers",
                  type: "TYPE_INTEGER",
                },
              ],
              rows: [
                {
                  dimensionValues: [
                    {
                      value: "202502",
                      oneValue: "value",
                    },
                    {
                      value: "1920x1080",
                      oneValue: "value",
                    },
                    {
                      value: "date_range_1",
                      oneValue: "value",
                    },
                  ],
                  metricValues: [
                    {
                      value: "303759",
                      oneValue: "value",
                    },
                  ],
                },
                {
                  dimensionValues: [
                    {
                      value: "202502",
                      oneValue: "value",
                    },
                    {
                      value: "1920x1080",
                      oneValue: "value",
                    },
                    {
                      value: "date_range_2",
                      oneValue: "value",
                    },
                  ],
                  metricValues: [
                    {
                      value: "303759",
                      oneValue: "value",
                    },
                  ],
                },
                {
                  dimensionValues: [
                    {
                      value: "202502",
                      oneValue: "value",
                    },
                    {
                      value: "1920x1080",
                      oneValue: "value",
                    },
                    {
                      value: "date_range_3",
                      oneValue: "value",
                    },
                  ],
                  metricValues: [
                    {
                      value: "303759",
                      oneValue: "value",
                    },
                  ],
                },
                {
                  dimensionValues: [
                    {
                      value: "202502",
                      oneValue: "value",
                    },
                    {
                      value: "1536x864",
                      oneValue: "value",
                    },
                    {
                      value: "date_range_1",
                      oneValue: "value",
                    },
                  ],
                  metricValues: [
                    {
                      value: "149951",
                      oneValue: "value",
                    },
                  ],
                },
                {
                  dimensionValues: [
                    {
                      value: "202502",
                      oneValue: "value",
                    },
                    {
                      value: "1536x864",
                      oneValue: "value",
                    },
                    {
                      value: "date_range_2",
                      oneValue: "value",
                    },
                  ],
                  metricValues: [
                    {
                      value: "149951",
                      oneValue: "value",
                    },
                  ],
                },
                {
                  dimensionValues: [
                    {
                      value: "202502",
                      oneValue: "value",
                    },
                    {
                      value: "1536x864",
                      oneValue: "value",
                    },
                    {
                      value: "date_range_3",
                      oneValue: "value",
                    },
                  ],
                  metricValues: [
                    {
                      value: "149951",
                      oneValue: "value",
                    },
                  ],
                },
                {
                  dimensionValues: [
                    {
                      value: "202502",
                      oneValue: "value",
                    },
                    {
                      value: "390x844",
                      oneValue: "value",
                    },
                    {
                      value: "date_range_1",
                      oneValue: "value",
                    },
                  ],
                  metricValues: [
                    {
                      value: "76511",
                      oneValue: "value",
                    },
                  ],
                },
                {
                  dimensionValues: [
                    {
                      value: "202502",
                      oneValue: "value",
                    },
                    {
                      value: "390x844",
                      oneValue: "value",
                    },
                    {
                      value: "date_range_2",
                      oneValue: "value",
                    },
                  ],
                  metricValues: [
                    {
                      value: "76511",
                      oneValue: "value",
                    },
                  ],
                },
                {
                  dimensionValues: [
                    {
                      value: "202502",
                      oneValue: "value",
                    },
                    {
                      value: "390x844",
                      oneValue: "value",
                    },
                    {
                      value: "date_range_3",
                      oneValue: "value",
                    },
                  ],
                  metricValues: [
                    {
                      value: "76511",
                      oneValue: "value",
                    },
                  ],
                },
                {
                  dimensionValues: [
                    {
                      value: "202502",
                      oneValue: "value",
                    },
                    {
                      value: "1920x1080",
                      oneValue: "value",
                    },
                    {
                      value: "date_range_0",
                      oneValue: "value",
                    },
                  ],
                  metricValues: [
                    {
                      value: "72994",
                      oneValue: "value",
                    },
                  ],
                },
              ],
            },
          ];
          query = {
            orderBys: [
              { desc: true, dimension: [Object] },
              { desc: true, metric: [Object] },
            ],
            dateRanges: [
              { endDate: "yesterday", startDate: "yesterday" },
              { endDate: "yesterday", startDate: "7daysAgo" },
              { endDate: "yesterday", startDate: "30daysAgo" },
              { endDate: "yesterday", startDate: "90daysAgo" },
            ],
            dimensions: [{ name: "yearMonth" }, { name: "screenResolution" }],
            metrics: [{ name: "activeUsers" }],
            dimensionFilter: { andGroup: { expressions: [Array] } },
            limit: "10000",
            property: "properties/395450427",
            ids: "395450427",
          };
          actual = AnalyticsData.fromGoogleAnalyticsQuery(query, gaResponse);
        });

        it("creates a new AnalyticsData instance for each date range", () => {
          expect(actual.length).to.equal(query.dateRanges.length);
        });

        it("AnalyticsData instance has expected data for date range 0", () => {
          expect(actual[0]).to.deep.equal(
            new AnalyticsData(
              { ...query, dateRanges: [query.dateRanges[0]] },
              expectedData["date_range_0"],
            ),
          );
        });

        it("AnalyticsData instance has expected data for date range 1", () => {
          expect(actual[1]).to.deep.equal(
            new AnalyticsData(
              { ...query, dateRanges: [query.dateRanges[1]] },
              expectedData["date_range_1"],
            ),
          );
        });

        it("AnalyticsData instance has expected data for date range 2", () => {
          expect(actual[2]).to.deep.equal(
            new AnalyticsData(
              { ...query, dateRanges: [query.dateRanges[2]] },
              expectedData["date_range_2"],
            ),
          );
        });

        it("AnalyticsData instance has expected data for date range 3", () => {
          expect(actual[3]).to.deep.equal(
            new AnalyticsData(
              { ...query, dateRanges: [query.dateRanges[3]] },
              expectedData["date_range_3"],
            ),
          );
        });
      });
    });
  });
});
