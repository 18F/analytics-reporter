const { Given, When } = require("@cucumber/cucumber");
const analyticsReporter = require("../../../index.js");

Given(
  "I set analytics-reporter to run the {string} report",
  function (reportName) {
    if (!this.options) {
      this.options = {};
    }
    this.options.only = reportName;
  },
);

Given("I set analytics-reporter to write slim reports", function () {
  if (!this.options) {
    this.options = {};
  }
  this.options.slim = true;
});

Given("I set analytics-reporter to write reports to disk", function () {
  if (!this.options) {
    this.options = {};
  }
  this.options.output = this.outputDir;
});

Given(
  "I set analytics-reporter to run reports with frequency {string}",
  function (frequency) {
    if (!this.options) {
      this.options = {};
    }
    this.options.frequency = frequency;
  },
);

When("I run the analytics-reporter application", async function () {
  await analyticsReporter.run(this.options || {});
});

When(
  "I run the analytics-reporter application with extended timeout",
  { timeout: 120 * 1000 },
  async function () {
    await analyticsReporter.run(this.options || {});
  },
);
