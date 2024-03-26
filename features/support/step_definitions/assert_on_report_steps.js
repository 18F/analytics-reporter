const chai = require("chai");
const expect = chai.expect;
const { Then } = require("@cucumber/cucumber");
const fs = require("fs");
const path = require("path");
const util = require("util");
const yup = require("yup");

chai.config.truncateThreshold = 0;

Then(
  "the {string} report should exist in the output directory",
  function (reportName) {
    expect(fs.existsSync(path.join(this.outputDir, `${reportName}.json`)));
  },
);

Then(
  "the {string} report should have totals for:",
  function (reportName, dataTable) {
    const reportJSON = loadReportJson(this.outputDir, reportName);
    dataTable.hashes().forEach((row) => {
      expect(
        Object.prototype.hasOwnProperty.call(reportJSON.totals, row.key),
      ).to.equal(true);
    });
  },
);

Then(
  "the {string} report should not have key {string}",
  function (reportName, reportKey) {
    const reportJSON = loadReportJson(this.outputDir, reportName);
    expect(
      Object.prototype.hasOwnProperty.call(reportJSON, reportKey),
    ).to.equal(false);
  },
);

Then("the {string} report should have keys:", function (reportName, dataTable) {
  const reportJSON = loadReportJson(this.outputDir, reportName);
  dataTable.hashes().forEach((row) => {
    expect(Object.prototype.hasOwnProperty.call(reportJSON, row.key)).to.equal(
      true,
    );
  });
});

Then(
  "the following reports should exist in the output directory:",
  function (dataTable) {
    dataTable.hashes().forEach((row) => {
      expect(
        fs.existsSync(path.join(this.outputDir, `${row.reportName}.json`)),
      );
    });
  },
);

Then("the report(s) should have the expected analytics fields", function () {
  const files = fs.readdirSync(this.outputDir);
  files.forEach((file) => {
    const reportJSON = loadReportJson(this.outputDir, file);
    expect(() => {
      validateReportSchema(reportJSON);
    }).not.to.throw();
  });
});

function loadReportJson(dir, reportName) {
  const fileName = reportName.includes(".json")
    ? reportName
    : `${reportName}.json`;
  return JSON.parse(fs.readFileSync(path.join(dir, fileName)));
}

function validateReportSchema(reportJSON) {
  try {
    reportSchema().validateSync(reportJSON, { abortEarly: false });
  } catch (e) {
    throw new Error(
      `${e.errors.join(", ")} for report: ${util.inspect(reportJSON)}`,
    );
  }
}

function reportSchema() {
  return yup.object({
    name: yup.string().required(),
    query: yup
      .object({
        dimensions: yup.array(),
        metrics: yup.array(),
        dateRanges: yup.array().of(
          yup.object({
            startDate: yup.string(),
            endDate: yup.string(),
          }),
        ),
        orderBys: yup.array(),
        dimensionFilter: yup.object(),
        metricFilter: yup.object(),
        limit: yup.string(),
        property: yup.string().required(),
      })
      .required(),
    meta: yup
      .object({
        name: yup.string().required(),
        description: yup.string().required(),
      })
      .required(),
    // varies between reports.  Tough to be more specific for data and totals.
    data: yup.array().of(yup.object()),
    totals: yup.object(),
    taken_at: yup.date().required(),
  });
}
