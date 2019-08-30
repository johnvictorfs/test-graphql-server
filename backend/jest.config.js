module.exports = {
  preset: 'ts-jest',
  testEnvironment: '<rootDir>/test/environment/mongodb',
  testPathIgnorePatterns: ['/node_modules/', './dist']
};
