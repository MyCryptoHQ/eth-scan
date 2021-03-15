module.exports = {
  testEnvironment: 'node',
  roots: ['src/', 'tests/'],
  clearMocks: true,
  collectCoverageFrom: ['**/*.ts?(x)', '!**/*.d.ts', '!src/contracts/**/*', '!src/vendor/**/*', '!src/types/**/*'],
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest'
  },
  testTimeout: 20000
};
