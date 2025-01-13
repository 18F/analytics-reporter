/**
 * Abstract class for a queue message to be sent to a PgBoss queue client.
 */
class QueueMessage {
  /**
   * @returns {object} the class converted to a JSON object.
   */
  toJSON() {
    return {};
  }

  /**
   * @returns {object} an options object for the PgBoss send method
   */
  sendOptions() {
    return {};
  }

  /**
   * @param {object} message a PgBoss message object from the report job queue.
   * @returns {QueueMessage} the built queue message instance.
   */
  static fromMessage(message) {
    return new QueueMessage(message.data);
  }
}

module.exports = QueueMessage;
