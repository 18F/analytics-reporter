const { configs: eslintConfigs } = require("@eslint/js");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");
const globals = require("globals");

module.exports = [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.mocha,
      },
    },
  },
  {
    // UA code is deprecated, so don't bother with static analysis rules.
    ignores: ["ua/**/*.js"],
    ...eslintConfigs.recommended,
  },
  eslintPluginPrettierRecommended,
];
