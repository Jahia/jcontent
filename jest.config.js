const jestConfig = require('@jahia/test-framework').jestConfig;

module.exports = {
    ...jestConfig,
    setupFiles: ['<rootDir>/src/javascript/setupTextEncoder.js'],
    setupFilesAfterEnv: ['<rootDir>/src/javascript/setupTests.js'],
    moduleNameMapper: {
        ...jestConfig.moduleNameMapper,
        '@jahia/moonstone': '<rootDir>/node_modules/@jahia/moonstone/dist/index.cjs',
    },
    modulePathIgnorePatterns: ['<rootDir>/tests']
};
