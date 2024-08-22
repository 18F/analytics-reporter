const fs = require("node:fs/promises");
const path = require("path");

/**
 * Publishes report data to a file on the local filesystem.
 *
 * @param {object} params the parameters fro the method
 * @param {string} params.name the name of the file to create.
 * @param {string} params.data the data to write to the file.
 * @param {string} params.format the file extension to use
 * @param {string} params.directory the path for the directory to use for the
 * file
 */
const publish = async ({ name, data, format, directory }) => {
  const filename = `${name}.${format}`;
  const filepath = path.join(directory, filename);
  await fs.writeFile(filepath, data);
};

module.exports = { publish };
