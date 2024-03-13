const fs = require("node:fs/promises");
const path = require("path");

const publish = async ({ name }, data, config) => {
  const filename = `${name}.${config.format}`;
  const filepath = path.join(config.output, filename);
  await fs.writeFile(filepath, data);
};

module.exports = { publish };
