const QueueMessage = require("./queue_message");

/**
 * Data object for a report job queue message to be sent to a PgBoss queue
 * client.
 */
class ReportJobQueueMessage extends QueueMessage {
  #agencyName;
  #analyticsReportIds;
  #awsBucketPath;
  #reportOptions;
  #reportConfig;
  #scriptName;

  /**
   * @param {object} params the params object.
   * @param {string} params.agencyName the name of the agency.
   * @param {string} params.analyticsReportIds the google analytics property ids
   * for the agency to use when running reports.
   * @param {string} params.awsBucketPath the folder in the S3 bucket where
   * report data is stored for the agency.
   * @param {object} params.reportOptions the options passed to the reporter
   * executable.
   * @param {object} params.reportConfig the google analytics configuration
   * object for the report to run.
   * @param {string} params.scriptName the name of the script which was run to
   * begin the reporter process.
   * @returns {ReportJobQueueMessage} the built queue message instance.
   */
  constructor({
    agencyName = "",
    analyticsReportIds = "",
    awsBucketPath = "",
    reportOptions = {},
    reportConfig = {},
    scriptName = "",
  }) {
    super();
    this.#agencyName = agencyName;
    this.#analyticsReportIds = analyticsReportIds;
    this.#awsBucketPath = awsBucketPath;
    this.#reportOptions = reportOptions;
    this.#reportConfig = reportConfig;
    this.#scriptName = scriptName;
  }

  /**
   * @returns {object} the class converted to a JSON object.
   */
  toJSON() {
    return {
      agencyName: this.#agencyName,
      analyticsReportIds: this.#analyticsReportIds,
      awsBucketPath: this.#awsBucketPath,
      options: this.#reportOptions,
      reportConfig: this.#reportConfig,
      scriptName: this.#scriptName,
    };
  }

  /**
   * @returns {object} an options object for the PgBoss send method
   */
  sendOptions() {
    return {
      priority: this.#messagePriority(this.#reportConfig.frequency),
      retryLimit: 2,
      retryDelay: 10,
      retryBackoff: true,
      singletonKey: `${this.#scriptName}-${this.#agencyName}-${this.#reportConfig.name}`,
    };
  }

  #messagePriority(reportFrequency) {
    let priority;
    switch (reportFrequency) {
      case "realtime":
        priority = 3;
        break;
      case "hourly":
        priority = 2;
        break;
      case "daily":
        priority = 1;
        break;
      default:
        priority = 0;
    }
    return priority;
  }

  /**
   * @param {object} message a PgBoss message object from the report job queue.
   * should have a data key with the expected fields.
   * @returns {ReportJobQueueMessage} the built queue message instance.
   */
  static fromMessage(message = { data: {} }) {
    return new ReportJobQueueMessage({
      agencyName: message.data.agencyName,
      analyticsReportIds: message.data.analyticsReportIds,
      awsBucketPath: message.data.awsBucketPath,
      reportOptions: message.data.options,
      reportConfig: message.data.reportConfig,
      scriptName: message.data.scriptName,
    });
  }
}

module.exports = ReportJobQueueMessage;
