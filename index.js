const { AsyncLocalStorage } = require("node:async_hooks");
const knex = require("knex");
const util = require("util");
const AppConfig = require("./src/app_config");
const ReportProcessingContext = require("./src/report_processing_context");
const Logger = require("./src/logger");
const Processor = require("./src/processor");
const Queue = require("./src/queue/queue");
const ReportJobQueueMessage = require("./src/queue/report_job_queue_message");

/**
 * Gets an array of JSON report objects from the application confing, then runs
 * a sequential chain of actions on each report object in the array. Some of the
 * actions performed are optional based on the options passed to this function.
 *
 * @param {object} options an object with options to be used when processing
 * all reports.
 * @param {boolean} options.csv if true, format report data to CSV
 * @param {boolean} options.json if true, format report data to JSON
 * @param {string} options.output a string filepath where the analytics data
 * will be written to disk after processing.
 * @param {boolean} options.publish if true, the analytics data will be written
 * to AWS S3 after processing.
 * @param {boolean} options.realtime if true, the application will use the
 * google analytics realtime data reporting API when requesting data.  Otherwise
 * the application uses the non-realtime data reporting API.
 * @param {boolean} options.slim if true, the application will create a smaller
 * data object when formatting the processed data.
 * @param {boolean} options.'write-to-database' if true, the application will
 * write the processed analytics data to the postgres database.
 * @param {string} options.only if set, runs only the report with name
 * matching the passed string.
 * @param {string} options.frequency if set, runs only the reports with
 * frequency matching the passed string.
 */
async function run(options = {}) {
  const appConfig = new AppConfig(options);
  const context = new ReportProcessingContext(new AsyncLocalStorage());
  const reportConfigs = appConfig.filteredReportConfigurations;
  const knexInstance = appConfig.shouldWriteToDatabase
    ? await knex(appConfig.knexConfig)
    : undefined;
  const processor = Processor.buildAnalyticsProcessor(
    appConfig,
    Logger.initialize({
      agencyName: appConfig.agencyLogName,
      scriptName: appConfig.scriptName,
    }),
    knexInstance,
  );

  for (const reportConfig of reportConfigs) {
    await _processReport(appConfig, context, reportConfig, processor);
  }
}

/**
 * Creates a new ReportProcessingContext run for the processing of the report.
 * Adds data to the context store which can be used by all actions in the
 * processor chain (config, logger, reportConfig). Catches any errors that
 * occur during processing and logs success or failure. This method does not
 * throw so that subsequent reports will run if an error occurs in a previous
 * report.
 *
 * @param {import('./src/app_config')} appConfig the application config
 * @param {import('./src/report_processing_context')} context the
 * report-specific context for processing.
 * @param {object} reportConfig the configuration object for the analytics
 * report to process.
 * @param {import('./src/processor')} processor an initialized processor
 * instance.
 * @returns {Promise} resolves when processing completes or has an error.
 */
async function _processReport(appConfig, context, reportConfig, processor) {
  return context.run(async () => {
    const logger = Logger.initialize({
      agencyName: appConfig.agencyLogName,
      scriptName: appConfig.scriptName,
      reportName: reportConfig.name,
    });
    context.appConfig = appConfig;
    context.logger = logger;
    context.reportConfig = reportConfig;

    try {
      await processor.processChain(context);
      logger.info("Processing complete");
    } catch (e) {
      logger.error("Encountered an error during report processing");
      logger.error(util.inspect(e));
    }
  });
}

/**
 * Gets an array of JSON report objects from the application confing, then runs
 * a sequential chain of actions on each report object in the array. Some of the
 * actions performed are optional based on the options passed to this function.
 *
 * @param {object} options an object with options to be used when processing
 * all reports.
 * @param {boolean} options.csv if true, format report data to CSV
 * @param {boolean} options.json if true, format report data to JSON
 * @param {string} options.output a string filepath where the analytics data
 * will be written to disk after processing.
 * @param {boolean} options.publish if true, the analytics data will be written
 * to AWS S3 after processing.
 * @param {boolean} options.realtime if true, the application will use the
 * google analytics realtime data reporting API when requesting data.  Otherwise
 * the application uses the non-realtime data reporting API.
 * @param {boolean} options.slim if true, the application will create a smaller
 * data object when formatting the processed data.
 * @param {boolean} options.'write-to-database' if true, the application will
 * write the processed analytics data to the postgres database.
 * @param {string} options.only if set, runs only the report with name
 * matching the passed string.
 * @param {string} options.frequency if set, runs only the reports with
 * frequency matching the passed string.
 * @param {string} options.agenciesFile if set, run the queue publisher for all
 * agencies in the JSON file
 */
async function runQueuePublish(options = {}) {
  const agencies = _initAgencies(options.agenciesFile);
  const appConfig = new AppConfig(options);
  const reportConfigs = appConfig.filteredReportConfigurations;
  const appLogger = Logger.initialize({
    agencyName: appConfig.agencyLogName,
    scriptName: appConfig.scriptName,
  });
  const knexInstance = await knex(appConfig.knexConfig);
  const queueClient = await _initQueueClient(
    knexInstance,
    appConfig.messageQueueName,
    appLogger,
  );

  for (const agency of agencies) {
    for (const reportConfig of reportConfigs) {
      process.env.AGENCY_NAME = agency.agencyName;
      const reportLogger = Logger.initialize({
        agencyName: appConfig.agencyLogName,
        scriptName: appConfig.scriptName,
        reportName: reportConfig.name,
      });
      let messageId;
      try {
        messageId = await queueClient.sendMessage(
          new ReportJobQueueMessage({
            agencyName: agency.agencyName,
            analyticsReportIds: agency.analyticsReportIds,
            awsBucketPath: agency.awsBucketPath,
            reportOptions: options,
            reportConfig,
            scriptName: appConfig.scriptName,
          }),
        );
        if (messageId) {
          reportLogger.info(
            `Created job in queue: ${appConfig.messageQueueName} with job ID: ${jobId} for ${reportConfig.query.dateRanges[0].startDate}`,
          );
        } else {
          reportLogger.info(
            `Found a duplicate message in queue: ${queueClient.name}`,
          );
        }
      } catch (e) {
        // Do nothing so that the remaining messages still process.
      }
    }
  }

  try {
    await queueClient.stop();
  } finally {
    appLogger.debug(`Destroying database connection pool`);
    knexInstance.destroy();
  }
}

function _initAgencies(agencies_file) {
  const legacyAgencies = [
    {
      analyticsReportIds: process.env.ANALYTICS_REPORT_IDS,
      agencyName: process.env.AGENCY_NAME,
      awsBucketPath: process.env.AWS_BUCKET_PATH,
    },
  ];

  if (!agencies_file) {
    return legacyAgencies;
  }

  const agencies = require(agencies_file);
  return Array.isArray(agencies) ? agencies : legacyAgencies;
}

async function _initQueueClient(knexInstance, queueName, logger) {
  const queueClient = Queue.buildQueue({
    knexInstance,
    queueName,
    messageClass: ReportJobQueueMessage,
    logger,
  });
  await queueClient.start();
  return queueClient;
}

/**
 * @returns {Promise} when the process ends
 */
async function runQueueConsume() {
  const appConfig = new AppConfig();
  const appLogger = Logger.initialize();
  const knexInstance = await knex(appConfig.knexConfig);
  const queueClient = await _initQueueClient(
    knexInstance,
    appConfig.messageQueueName,
    appLogger,
  );

  try {
    const context = new ReportProcessingContext(new AsyncLocalStorage());
    const processor = Processor.buildAnalyticsProcessor(
      appConfig,
      appLogger,
      knexInstance,
    );

    await queueClient.poll(async (message) => {
      process.env.AGENCY_NAME = message.agencyName;
      process.env.ANALYTICS_REPORT_IDS = message.analyticsReportIds;
      process.env.AWS_BUCKET_PATH = message.awsBucketPath;
      process.env.ANALYTICS_SCRIPT_NAME = message.scriptName;

      await _processReport(
        new AppConfig(message.options),
        context,
        message.reportConfig,
        processor,
      );
    });
  } catch (e) {
    appLogger.error("Error polling queue for messages");
    appLogger.error(util.inspect(e));
  }
}

module.exports = { run, runQueuePublish, runQueueConsume };
