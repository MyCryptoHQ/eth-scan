module.exports = {
  roots: ['src/', 'tests/'],
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['**/*.ts?(x)', '!**/*.d.ts', '!src/contracts/**/*', '!src/vendor/**/*'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest'
  }
};
