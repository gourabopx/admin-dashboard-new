import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      // Ignore auto-generated prisma & wasm bundles that trigger thousands of lint errors
      "lib/generated/**",
    ],
    rules: {
      // Relax overly-strict rules that are generating noise but not breaking runtime.
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "no-var": "warn",
      "prefer-const": "warn",
    },
  },
];

export default eslintConfig;
