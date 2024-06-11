/**
 * Parent class for actions in a chain of responsibility pattern.
 */
class Action {
  /**
   * Subclasses should override this method if there are instances where the
   * class should not execute on the context.
   *
   * @param {ReportProcessingContext} context the context for the action chain.
   * @returns {Boolean} true if the action should execute on the context.
   */
  handles() {
    return true;
  }

  /**
   * Executes the logic of the Action using the strategy pattern and writes an
   * error log for debugging if an error occurs in execution.
   *
   * @param {Context} context the context for the action chain.
   */
  async execute(context) {
    try {
      await this.executeStrategy(context);
    } catch (e) {
      context.logger.error(`Error executing ${this.constructor.name}`);
      throw e;
    }
  }

  /**
   * Provides an execution strategy to the execute method. Subclasses should
   * override this method to provide their action specific logic.
   *
   * @param {ReportProcessingContext} context the context for the action chain.
   */
  async executeStrategy() {
    return;
  }
}

module.exports = Action;
