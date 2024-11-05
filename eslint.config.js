import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.node, // добавляет глобальные переменные для Node.js
        process: "readonly", // определяет `process` как доступную глобальную переменную
      },
    },
  },
  pluginJs.configs.recommended,
];
