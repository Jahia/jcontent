const jestConfig = require('@jahia/test-framework').jestConfig;

module.exports = {
    ...jestConfig,
    setupFiles: ['<rootDir>/src/javascript/setupTextEncoder.js'],
    setupFilesAfterEnv: ['<rootDir>/src/javascript/setupTests.js'],
    moduleNameMapper: {
        ...jestConfig.moduleNameMapper,
        '@jahia/moonstone': '<rootDir>/node_modules/@jahia/moonstone/dist/index.cjs',
        'react-dnd': 'react-dnd-cjs',
        'react-dnd-html5-backend': 'react-dnd-html5-backend-cjs',
        'dnd-core': 'dnd-core-cjs'
    },
    modulePathIgnorePatterns: ['<rootDir>/tests'],
    testEnvironment: 'jsdom'
};
