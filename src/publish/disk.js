const fs = require("node:fs/promises");
const path = require("path");

/**
 * Publishes report data to a file on the local filesystem.
 *
 * @param {string} name the name of the file to create.
 * @param {string} data the data to write to the file.
 * @param {import('../app_config')} appConfig application config instance. Sets the file
 * extension and the path of the file to create.
 */
const publish = async ({ name }, data, appConfig) => {
  const filename = `${name}.${appConfig.format}`;
  const filepath = path.join(appConfig.output, filename);
  await fs.writeFile(filepath, data);
};

module.exports = { publish };
