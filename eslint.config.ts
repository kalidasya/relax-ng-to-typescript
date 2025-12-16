import js from "@eslint/js";
import globals from "globals";
import tseslint, { parser } from "typescript-eslint";
import { defineConfig } from "eslint/config";
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  {
    ignores: [
      '**/dist/*',
      'tsconfig.json',
    ]
  },
  tseslint.configs.recommended,
  {

    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.browser,
      parser: parser,
      parserOptions: {
        tsconfigRootDir: __dirname
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    },

  },
]);
