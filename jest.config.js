module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  jest: {
    automock: false,
    testPathIgnorePatterns: ["types"],
  },
};
