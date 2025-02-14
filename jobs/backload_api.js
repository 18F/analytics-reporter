process.env.ANALYTICS_REPORTS_PATH = "reports/api.json";
process.env.ANALYTICS_SCRIPT_NAME = "backload_api.js";

const fs = require("fs");
const { formatISO, parseISO, differenceInDays, subDays } = require("date-fns");

const apiReports = require("../reports/api.json");
const { runQueuePublish } = require("../index.js");
const options = {
  frequency: "daily",
  debug: true,
  "write-to-database": true,
  agenciesFile: `${process.env.ANALYTICS_ROOT_PATH}/deploy/agencies.json`,
};
const logger = require("../src/logger.js").initialize();

(async () => {
  const scriptTargetDate = parseISO("2024-07-01");
  const today = new Date();
  let totalDaysAgo = differenceInDays(today, scriptTargetDate);

  while (totalDaysAgo >= 1) {
    const iterationTargetDate = subDays(new Date(), totalDaysAgo);

    const iterationDaysAgo = differenceInDays(today, iterationTargetDate) + 1;
    const modifiedApiJsonString = JSON.stringify(apiReports).replaceAll(
      '"yesterday"',
      `"${iterationDaysAgo}daysAgo"`,
    );

    fs.unlinkSync("reports/api.json");
    fs.writeFileSync("reports/api.original.json", JSON.stringify(apiReports));
    fs.writeFileSync("reports/api.json", modifiedApiJsonString);
    fs.writeFileSync("reports/api.new.json", modifiedApiJsonString);

    logger.info(
      `Running API reports for ${formatISO(iterationTargetDate, { representation: "date" })}...`,
    );

    try {
      await runQueuePublish(options);
      logger.info(`Job completed: ${process.env.ANALYTICS_SCRIPT_NAME}`);
    } catch (e) {
      logger.error(
        `Job exited with error: ${process.env.ANALYTICS_SCRIPT_NAME}`,
      );
      logger.error(e);
      throw e;
    }

    totalDaysAgo = totalDaysAgo - 1;
    logger.info(
      `API reports for ${formatISO(iterationTargetDate, { representation: "date" })} complete`,
    );

    fs.unlinkSync("reports/api.json");
    fs.renameSync("reports/api.original.json", "reports/api.json");
  }
})();
