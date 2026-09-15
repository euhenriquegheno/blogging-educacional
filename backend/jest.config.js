/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  collectCoverageFrom: [
    'build/uses-cases/create-publicacao.js',
    'build/uses-cases/update-publicacao.js',
    'build/uses-cases/delete-publicacao.js',
  ],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20,
    },
  },
  moduleFileExtensions: ['js'],
  testMatch: ['<rootDir>/tests/**/*.spec.js'],
}
