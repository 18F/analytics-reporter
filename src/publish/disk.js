const fs = require("node:fs/promises");
const path = require("path");

const publish = async (report, results, { output, format }) => {
  const filename = `${report.name}.${format}`;
  const filepath = path.join(output, filename);
  await fs.writeFile(filepath, results);
};

module.exports = { publish };
