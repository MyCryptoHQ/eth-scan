module.exports = {
  roots: ['src/', 'tests/'],
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['**/*.ts?(x)', '!**/*.d.ts', '!src/contracts/**/*', '!src/vendor/**/*'],
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest'
  }
};
