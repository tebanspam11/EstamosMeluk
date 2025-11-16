/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  moduleFileExtensions: ["ts", "js"],
  moduleDirectories: ["node_modules", "Backend/src", "."],
  transform: {
    "^.+\\.ts$": ["ts-jest", {}],
  },
};