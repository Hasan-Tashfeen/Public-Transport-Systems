module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  ignorePatterns: ["dist", "build", "node_modules"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {},
};
