// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["build/**", "node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // a page method that forgets to await a WebDriver call is the commonest bug here
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/naming-convention": "off",
    },
  },
  { files: ["eslint.config.mjs"], ...tseslint.configs.disableTypeChecked },
);
