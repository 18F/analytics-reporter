const fs = require("node:fs/promises");
const path = require("path");

/**
 * Publishes report data to a file on the local filesystem.
 *
 * @param {string} name the name of the file to create.
 * @param {string} data the data to write to the file.
 * @param {string} format the file extension to use
 * @param {string} directory the path for the directory to use for the file
 * @param {import('../app_config')} appConfig application config instance. Sets the file
 * extension and the path of the file to create.
 */
const publish = async ({ name, data, format, directory }) => {
  const filename = `${name}.${format}`;
  const filepath = path.join(directory, filename);
  await fs.writeFile(filepath, data);
};

module.exports = { publish };
