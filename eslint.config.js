const { configs: eslintConfigs } = require("@eslint/js");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");
const globals = require("globals");
const jsdoc = require("eslint-plugin-jsdoc");

module.exports = [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.mocha,
      },
    },
  },
  eslintConfigs.recommended,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      jsdoc,
    },
    files: ["src/**/*.js", "index.js"],
    rules: {
      ...jsdoc.configs.recommended.rules,
      "jsdoc/check-indentation": "error",
      "jsdoc/check-line-alignment": "error",
      "jsdoc/check-syntax": "error",
      "jsdoc/convert-to-jsdoc-comments": "error",
      "jsdoc/no-bad-blocks": "error",
      "jsdoc/no-blank-block-descriptions": "error",
      "jsdoc/no-blank-blocks": "error",
      "jsdoc/require-asterisk-prefix": "error",
      "jsdoc/require-jsdoc": [
        "error",
        {
          checkGetters: false,
          checkSetters: false,
          publicOnly: true,
          require: {
            ArrowFunctionExpression: true,
            ClassDeclaration: true,
            ClassExpression: true,
            FunctionDeclaration: true,
            FunctionExpression: true,
            MethodDefinition: true,
          },
        },
      ],
      "jsdoc/require-throws": "error",
      "jsdoc/sort-tags": "error",
      "jsdoc/tag-lines": "off",
    },
  },
];
